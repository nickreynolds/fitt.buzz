import type {
  inferProcedureBuilderResolverOptions,
  TRPCRouterRecord,
} from "@trpc/server";
import Pusher from "pusher";
import { z } from "zod";

import { and, asc, desc, eq, inArray, isNull, lte, or, sql } from "@acme/db";
import {
  CreateSubtaskSchema,
  CreateSubtaskSetSchema,
  CreateTaskSchema,
  Task,
  TaskCompletion,
} from "@acme/db/schema";
import {
  getCompletionPeriodBegins,
  TaskBlockingTypes,
  TaskCompletionTypes,
} from "@acme/utils";

import { protectedProcedure } from "../trpc";
import { bootstrapTasks } from "../utils/bootstrap";

console.log(process.env.PUSHER_APP_ID);

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID ?? "",
  key: process.env.PUSHER_KEY ?? "",
  secret: process.env.PUSHER_SECRET ?? "",
  cluster: process.env.PUSHER_CLUSTER ?? "",
  useTLS: true,
});

const baseTaskOutputSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  recurring: z.boolean(),
  // Minutes between occurrences
  frequencyMinutes: z.number().nullable(),
  lastCompleted: z.date().nullable(),
  completionPeriodBegins: z.date().nullable(),
  nextDue: z.date(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  creatorId: z.string(),
  parentTaskId: z.string().nullable(),
  sortIndex: z.number(),
  completionDataType: z.enum([
    TaskCompletionTypes.Boolean,
    TaskCompletionTypes.WeightReps,
    TaskCompletionTypes.Time,
  ]),
  isSet: z.boolean(),
  numSets: z.number(),
  numCompletedSets: z.number(),
  blocking: z.enum([
    TaskBlockingTypes.BLOCK_WHEN_OVERDUE,
    TaskBlockingTypes.NEVER_BLOCK,
    TaskBlockingTypes.BLOCK_WHEN_TWICE_OVERDUE,
  ]),
  taskCompletionData: z.array(z.string()).optional(),
  childTaskCompletionDataMap: z.map(z.string(), z.array(z.string())).optional(),
  prevTaskCompletionData: z.array(z.string()).optional(),
  prevChildTaskCompletionDataMap: z
    .map(z.string(), z.array(z.string()))
    .optional(),
});

const reorderTaskSchema = z
  .object({
    id: z.string().uuid(),
    sortIndex: z.number(),
  })
  .array();

type TaskOutput = z.infer<typeof baseTaskOutputSchema> & {
  childTasks?: TaskOutput[];
};

export const taskSchema: z.ZodType<TaskOutput> = baseTaskOutputSchema.extend({
  childTasks: z.lazy(() => taskSchema.array().optional()),
});

export const taskRouter = {
  bootstrapTasks: protectedProcedure.mutation(async ({ ctx }) => {
    const tasksWithCreatorAndCompletionPeriod = bootstrapTasks.map((task) => {
      if (task.recurring && task.frequencyMinutes) {
        const completionPeriodBegins: Date = getCompletionPeriodBegins(
          task.nextDue,
          task.frequencyMinutes,
        );
        return {
          ...task,
          creatorId: ctx.session.user.id,
          completionPeriodBegins,
        };
      } else {
        return {
          ...task,
          creatorId: ctx.session.user.id,
        };
      }
    });

    await ctx.db.insert(Task).values(tasksWithCreatorAndCompletionPeriod);
  }),
  createTask: protectedProcedure
    .input(CreateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.frequencyMinutes && input.frequencyMinutes > 0) {
        const inserted = await ctx.db
          .insert(Task)
          .values({
            ...input,
            creatorId: ctx.session.user.id,
            completionPeriodBegins:
              input.recurring && input.frequencyMinutes
                ? getCompletionPeriodBegins(
                    input.nextDue,
                    input.frequencyMinutes,
                  )
                : null,
          })
          .returning();
        await pusher.trigger(`user-${ctx.session.user.id}`, "refresh-tasks", {
          tasks: [],
        });
        return inserted[0]?.id;
      }
      const inserted = await ctx.db
        .insert(Task)
        .values({ ...input, creatorId: ctx.session.user.id })
        .returning();
      await pusher.trigger(`user-${ctx.session.user.id}`, "refresh-tasks", {
        tasks: [],
      });

      return inserted[0]?.id;
    }),
  createSubtask: protectedProcedure
    .input(CreateSubtaskSchema)
    .mutation(async ({ ctx, input }) => {
      const parent = await ctx.db.query.Task.findFirst({
        where: eq(Task.id, input.parentTaskId),
      });
      if (!parent) {
        throw new Error("Parent task not found");
      }
      if (parent.creatorId !== ctx.session.user.id) {
        throw new Error("You are not the owner of the parent task");
      }
      const inserted = await ctx.db.insert(Task).values({
        ...input,
        recurring: parent.recurring,
        frequencyMinutes: parent.frequencyMinutes ?? null,
        nextDue: parent.nextDue,
        completionPeriodBegins: parent.completionPeriodBegins,
        creatorId: ctx.session.user.id,
      });
      await pusher.trigger(`user-${ctx.session.user.id}`, "refresh-tasks", {
        tasks: [input.parentTaskId],
      });
      return inserted;
    }),
  createSubtaskSet: protectedProcedure
    .input(CreateSubtaskSetSchema)
    .mutation(async ({ ctx, input }) => {
      const parent = await ctx.db.query.Task.findFirst({
        where: eq(Task.id, input.parentTaskId),
      });
      if (!parent) {
        throw new Error("Parent task not found");
      }
      if (parent.creatorId !== ctx.session.user.id) {
        throw new Error("You are not the owner of the parent task");
      }

      // Create both tasks in a transaction
      const result = await ctx.db.transaction(async (trx) => {
        // First create the set parent task
        const setTask = await trx.insert(Task).values({
          id: input.setTaskId,
          title: `${input.title} (set)`,
          description: input.description,
          parentTaskId: input.parentTaskId,
          sortIndex: input.sortIndex ?? 0,
          completionDataType: TaskCompletionTypes.Boolean,
          isSet: true,
          numSets: 1,
          recurring: parent.recurring,
          frequencyMinutes: parent.frequencyMinutes ?? null,
          nextDue: parent.nextDue,
          completionPeriodBegins: parent.completionPeriodBegins,
          creatorId: ctx.session.user.id,
        });

        // Then create the child exercise task
        const childTask = await trx.insert(Task).values({
          id: input.childTaskId,
          title: input.title,
          description: input.description,
          parentTaskId: input.setTaskId,
          sortIndex: 0,
          completionDataType: input.completionDataType,
          isSet: false,
          recurring: parent.recurring,
          frequencyMinutes: parent.frequencyMinutes ?? null,
          nextDue: parent.nextDue,
          completionPeriodBegins: parent.completionPeriodBegins,
          creatorId: ctx.session.user.id,
        });

        return { setTask, childTask };
      });

      await pusher.trigger(`user-${ctx.session.user.id}`, "refresh-tasks", {
        tasks: [input.parentTaskId],
      });
      return result;
    }),
  completeWeightRepsTask: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        weight: z.number(),
        weightUnit: z.string(),
        reps: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let res;
      const task = await ctx.db.query.Task.findFirst({
        where: eq(Task.id, input.id),
        with: {
          childTasks: true,
        },
      });

      if (task) {
        if (task.creatorId !== ctx.session.user.id) {
          throw new Error("You are not the owner of this task");
        }

        if (task.completionDataType !== TaskCompletionTypes.WeightReps) {
          throw new Error("Task is not of type WeightReps");
        }

        if (
          task.completionPeriodBegins &&
          new Date() < task.completionPeriodBegins
        ) {
          throw new Error("Task is not in completion period");
        }

        res = await ctx.db.transaction(async (trx) => {
          if (task.parentTaskId) {
            const { result, numParentCompletedSets } =
              await shouldCompleteParentSet(task, { ctx, input });
            if (result) {
              await trx
                .update(Task)
                .set({ numCompletedSets: numParentCompletedSets + 1 })
                .where(eq(Task.id, task.parentTaskId));
            }
          }

          await trx
            .update(Task)
            .set({ lastCompleted: new Date() })
            .where(eq(Task.id, input.id));

          const res2 = await trx.insert(TaskCompletion).values({
            taskId: task.id,
            completionDataType: TaskCompletionTypes.WeightReps,
            completionData: {
              weight: input.weight,
              weightUnit: input.weightUnit,
              reps: input.reps,
            },
            nextDue: task.nextDue,
          });

          return res2;
        });
      }
      if (!res) {
        throw new Error("Task not found");
      }

      const tasksToRefresh = [input.id];
      if (task?.parentTaskId) {
        tasksToRefresh.push(task.parentTaskId);
      }
      await pusher.trigger(`user-${ctx.session.user.id}`, "refresh-tasks", {
        tasks: tasksToRefresh,
      });
      return res;
    }),
  completeTimedTask: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        time: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let res;
      const task = await ctx.db.query.Task.findFirst({
        where: eq(Task.id, input.id),
        with: {
          childTasks: true,
        },
      });

      if (task) {
        if (task.creatorId !== ctx.session.user.id) {
          throw new Error("You are not the owner of this task");
        }

        if (task.completionDataType !== TaskCompletionTypes.Time) {
          throw new Error("Task is not of type Time");
        }

        if (
          task.completionPeriodBegins &&
          new Date() < task.completionPeriodBegins
        ) {
          throw new Error("Task is not in completion period");
        }

        res = await ctx.db.transaction(async (trx) => {
          if (task.parentTaskId) {
            const { result, numParentCompletedSets } =
              await shouldCompleteParentSet(task, { ctx, input });
            if (result) {
              await trx
                .update(Task)
                .set({ numCompletedSets: numParentCompletedSets + 1 })
                .where(eq(Task.id, task.parentTaskId));
            }
          }

          await trx
            .update(Task)
            .set({ lastCompleted: new Date() })
            .where(eq(Task.id, input.id));

          const res2 = await trx.insert(TaskCompletion).values({
            taskId: task.id,
            completionDataType: TaskCompletionTypes.Time,
            completionData: {
              time: input.time,
            },
            nextDue: task.nextDue,
          });

          return res2;
        });
      }
      if (!res) {
        throw new Error("Task not found");
      }

      const tasksToRefresh = [input.id];
      if (task?.parentTaskId) {
        tasksToRefresh.push(task.parentTaskId);
      }
      await pusher.trigger(`user-${ctx.session.user.id}`, "refresh-tasks", {
        tasks: tasksToRefresh,
      });
      return res;
    }),
  completeTask: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      let res;

      const task = await ctx.db.query.Task.findFirst({
        where: eq(Task.id, input.id),
        with: {
          childTasks: true,
        },
      });

      if (!task) {
        throw new Error("Task not found");
      }
      if (task.creatorId !== ctx.session.user.id) {
        throw new Error("You are not the owner of this task");
      }

      if (task.completionDataType !== TaskCompletionTypes.Boolean) {
        throw new Error("Task is not of type WeightReps");
      }

      if (
        task.completionPeriodBegins &&
        new Date() < task.completionPeriodBegins
      ) {
        throw new Error("Task is not in completion period");
      }

      // if task has children, check that all children are completed.
      if (task.childTasks.length > 0) {
        if (task.isSet) {
          for (const childTask of task.childTasks) {
            const childTaskCompletions =
              await ctx.db.query.TaskCompletion.findMany({
                where: and(
                  eq(TaskCompletion.taskId, childTask.id),
                  eq(TaskCompletion.nextDue, task.nextDue),
                ),
              });
            if (childTaskCompletions.length < task.numSets) {
              throw new Error("Cannot complete task with incomplete sets");
            }
          }
        } else {
          for (const childTask of task.childTasks) {
            if (!childTask.lastCompleted) {
              throw new Error("Cannot complete task with incomplete subtasks");
            }
            if (
              task.completionPeriodBegins &&
              childTask.lastCompleted < task.completionPeriodBegins
            ) {
              throw new Error(
                "Cannot complete task with subtasks completed before completionPeriodBegins",
              );
            }
          }
        }
      }

      res = await ctx.db.transaction(async (trx) => {
        const allChildrenIDs = [];

        let nextChildren = task.childTasks.map((child) => child.id);

        while (nextChildren.length > 0) {
          allChildrenIDs.push(...nextChildren);

          const fullChildren = await ctx.db.query.Task.findMany({
            where: inArray(Task.id, nextChildren),
            with: {
              childTasks: true,
            },
          });

          nextChildren = fullChildren
            .map((child) => child.childTasks.map((c) => c.id))
            .flat();
        }

        if (!task.parentTaskId && task.recurring) {
          if (!task.frequencyMinutes) {
            throw new Error("Recurring task has no frequencyMinutes set");
          }
          const minimumNextDueDate =
            new Date().getTime() + task.frequencyMinutes * 60 * 1000 * 0.7;

          let dueDate =
            task.nextDue.getTime() + task.frequencyMinutes * 60 * 1000;

          while (dueDate < minimumNextDueDate) {
            dueDate += task.frequencyMinutes * 60 * 1000;
          }

          const prevDue = task.nextDue;

          let completionPeriodBegins = getCompletionPeriodBegins(
            new Date(dueDate),
            task.frequencyMinutes,
          );

          if (completionPeriodBegins < new Date()) {
            completionPeriodBegins = new Date(Date.now() + 10);
          }

          res = await trx
            .update(Task)
            .set({
              lastCompleted: new Date(),
              completionPeriodBegins,
              nextDue: new Date(dueDate),
              numCompletedSets: 0,
              prevDues: sql`array_append(${Task.prevDues}, ${prevDue})`,
            })
            .where(inArray(Task.id, [input.id, ...allChildrenIDs]));
        } else {
          if (task.parentTaskId) {
            if (task.parentTaskId) {
              const { result, numParentCompletedSets } =
                await shouldCompleteParentSet(task, { ctx, input });
              if (result) {
                await trx
                  .update(Task)
                  .set({ numCompletedSets: numParentCompletedSets + 1 })
                  .where(eq(Task.id, task.parentTaskId));
              }
            }
            await trx.insert(TaskCompletion).values({
              taskId: task.id,
              completionDataType: TaskCompletionTypes.Boolean,
              completionData: {
                result: true,
              },
              nextDue: task.nextDue,
            });
          }
          res = await trx
            .update(Task)
            .set({ lastCompleted: new Date() })
            .where(eq(Task.id, input.id));
        }
      });

      const tasksToRefresh = [input.id];
      if (task.parentTaskId) {
        tasksToRefresh.push(task.parentTaskId);
      }
      await pusher.trigger(`user-${ctx.session.user.id}`, "refresh-tasks", {
        tasks: tasksToRefresh,
      });
      return res;
    }),
  getTask: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(taskSchema.optional())
    .query(async ({ ctx, input }) => {
      const task = await ctx.db.query.Task.findFirst({
        where: eq(Task.id, input.id),
        with: {
          childTasks: {
            with: {
              childTasks: true,
            },
          },
        },
      });

      if (!task) {
        throw new Error("Task not found");
      }

      const allTaskCompletionDataPoints =
        await ctx.db.query.TaskCompletion.findMany({
          where: and(
            or(
              eq(TaskCompletion.taskId, input.id),
              inArray(
                TaskCompletion.taskId,
                task.childTasks.map((child) => child.id),
              ),
            ),
            eq(TaskCompletion.nextDue, task.nextDue),
          ),
          orderBy: [
            desc(TaskCompletion.nextDue),
            asc(TaskCompletion.createdAt),
          ],
        });

      const taskCompletionData = allTaskCompletionDataPoints
        .filter((point) => point.taskId === input.id)
        .map((point) => JSON.stringify(point.completionData));

      const childTaskCompletionDataMap = new Map<string, string[]>();
      for (const child of task.childTasks) {
        const childTaskCompletionData = allTaskCompletionDataPoints
          .filter((point) => point.taskId === child.id)
          .map((point) => JSON.stringify(point.completionData));
        childTaskCompletionDataMap.set(child.id, childTaskCompletionData);
      }

      const prevTaskCompletionNextDue =
        task.prevDues && task.prevDues.length > 0
          ? task.prevDues[task.prevDues.length - 1]
          : (
              await ctx.db.query.TaskCompletion.findFirst({
                where: and(
                  eq(TaskCompletion.taskId, input.id),
                  lte(TaskCompletion.nextDue, task.nextDue),
                ),
                orderBy: [
                  desc(TaskCompletion.nextDue),
                  asc(TaskCompletion.createdAt),
                ],
              })
            )?.nextDue;

      let prevTaskCompletionData: string[] = [];
      let prevChildTaskCompletionDataMap = new Map<string, string[]>();

      if (prevTaskCompletionNextDue) {
        const allPrevTaskCompletionDataPoints =
          await ctx.db.query.TaskCompletion.findMany({
            where: and(
              or(
                eq(TaskCompletion.taskId, input.id),
                inArray(
                  TaskCompletion.taskId,
                  task.childTasks.map((child) => child.id),
                ),
              ),
              eq(TaskCompletion.nextDue, prevTaskCompletionNextDue),
            ),
          });

        prevTaskCompletionData = allPrevTaskCompletionDataPoints
          .filter((point) => point.taskId === input.id)
          .map((point) => JSON.stringify(point.completionData));

        prevChildTaskCompletionDataMap = new Map<string, string[]>();
        for (const child of task.childTasks) {
          const childTaskCompletionData = allPrevTaskCompletionDataPoints
            .filter((point) => point.taskId === child.id)
            .map((point) => JSON.stringify(point.completionData));
          prevChildTaskCompletionDataMap.set(child.id, childTaskCompletionData);
        }
      }

      return {
        ...task,
        taskCompletionData,
        childTaskCompletionDataMap,
        prevTaskCompletionData,
        prevChildTaskCompletionDataMap,
      };
    }),
  getAllMyTasks: protectedProcedure
    .output(taskSchema.array())
    .query(({ ctx }) => {
      return ctx.db.query.Task.findMany({
        where: (tasks, { eq, and, or }) =>
          and(
            eq(tasks.creatorId, ctx.session.user.id),
            isNull(tasks.parentTaskId),
            or(
              eq(tasks.recurring, true),
              and(eq(tasks.recurring, false), isNull(tasks.lastCompleted)),
            ),
          ),
        with: {
          childTasks: {
            with: {
              childTasks: true,
            },
          },
        },
      });
    }),
  getAllMyActiveTasks: protectedProcedure
    .output(taskSchema.array())
    .query(({ ctx }) => {
      return ctx.db.query.Task.findMany({
        where: (tasks, { eq, or, and, isNull }) =>
          and(
            eq(tasks.creatorId, ctx.session.user.id),
            or(
              and(eq(tasks.recurring, false), isNull(tasks.lastCompleted)),
              and(
                eq(tasks.recurring, true),
                lte(tasks.completionPeriodBegins, new Date()),
              ),
            ),
            isNull(tasks.parentTaskId),
          ),
        with: {
          childTasks: {
            with: {
              childTasks: true,
            },
          },
        },
      });
    }),
  deleteTask: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // First try to find and delete a regular task
      const task = await ctx.db.query.Task.findFirst({
        where: eq(Task.id, input.id),
        with: {
          childTasks: true,
        },
      });
      let res;
      if (task) {
        if (task.creatorId !== ctx.session.user.id) {
          throw new Error("You are not the owner of this task");
        }

        const allChildrenIDs: string[] = [];

        let nextChildren = task.childTasks.map((child) => child.id);

        while (nextChildren.length > 0) {
          allChildrenIDs.push(...nextChildren);

          const fullChildren = await ctx.db.query.Task.findMany({
            where: inArray(Task.id, nextChildren),
            with: {
              childTasks: true,
            },
          });

          nextChildren = fullChildren
            .map((child) => child.childTasks.map((c) => c.id))
            .flat();
        }

        res = await ctx.db.transaction(async (trx) => {
          // use transaction
          await trx
            .delete(TaskCompletion)
            .where(
              inArray(TaskCompletion.taskId, [input.id, ...allChildrenIDs]),
            );

          await trx
            .delete(Task)
            .where(inArray(Task.id, [input.id, ...allChildrenIDs]));
        });
        await pusher.trigger(`user-${ctx.session.user.id}`, "refresh-tasks", {
          tasks: [],
        });
        return res;
      }

      throw new Error("Task not found");
    }),
  setIsSet: protectedProcedure
    .input(z.object({ id: z.string().uuid(), isSet: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // First try to find and delete a regular task
      const task = await ctx.db.query.Task.findFirst({
        where: eq(Task.id, input.id),
      });

      if (task) {
        if (task.creatorId !== ctx.session.user.id) {
          throw new Error("You are not the owner of this task");
        }
        return await ctx.db
          .update(Task)
          .set({ isSet: input.isSet })
          .where(eq(Task.id, input.id));
      }
      throw new Error("Task not found");
    }),
  setNumSets: protectedProcedure
    .input(z.object({ id: z.string().uuid(), numSets: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.query.Task.findFirst({
        where: eq(Task.id, input.id),
      });

      if (task) {
        if (task.creatorId !== ctx.session.user.id) {
          throw new Error("You are not the owner of this task");
        }
        const updated = await ctx.db
          .update(Task)
          .set({ numSets: input.numSets })
          .where(eq(Task.id, input.id));
        await pusher.trigger(`user-${ctx.session.user.id}`, "refresh-tasks", {
          tasks: [input.id, task.parentTaskId],
        });
        return updated;
      }
      throw new Error("Task not found");
    }),
  reorderTasks: protectedProcedure
    .input(reorderTaskSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("reorder 1.");
      const tasks = await ctx.db.query.Task.findMany({
        where: inArray(
          Task.id,
          input.map((task) => task.id),
        ),
      });

      for (const task of tasks) {
        if (task.creatorId !== ctx.session.user.id) {
          throw new Error("You are not the owner of this task");
        }
      }

      for (const task of input) {
        await ctx.db
          .update(Task)
          .set({ sortIndex: task.sortIndex })
          .where(eq(Task.id, task.id));
      }

      const anyParentTaskId = tasks.some((task) => task.parentTaskId);

      await pusher.trigger(`user-${ctx.session.user.id}`, "refresh-tasks", {
        tasks: [input.map((task) => task.id), anyParentTaskId],
      });
    }),
  updateTaskTitle: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(256),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.query.Task.findFirst({
        where: eq(Task.id, input.id),
      });

      if (!task) {
        throw new Error("Task not found");
      }

      if (task.creatorId !== ctx.session.user.id) {
        throw new Error("You are not the owner of this task");
      }

      const updated = await ctx.db
        .update(Task)
        .set({ title: input.title })
        .where(eq(Task.id, input.id));
      await pusher.trigger(`user-${ctx.session.user.id}`, "refresh-tasks", {
        tasks: [input.id, task.parentTaskId],
      });

      return updated;
    }),
  updateIsSet: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        isSet: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.query.Task.findFirst({
        where: eq(Task.id, input.id),
      });

      if (!task) {
        throw new Error("Task not found");
      }

      if (task.creatorId !== ctx.session.user.id) {
        throw new Error("You are not the owner of this task");
      }

      const updated = await ctx.db
        .update(Task)
        .set({ isSet: input.isSet, numSets: input.isSet ? 1 : 0 })
        .where(eq(Task.id, input.id));
      await pusher.trigger(`user-${ctx.session.user.id}`, "refresh-tasks", {
        tasks: [input.id, task.parentTaskId],
      });
      return updated;
    }),
  updateBlocking: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        blocking: z.enum([
          TaskBlockingTypes.BLOCK_WHEN_OVERDUE,
          TaskBlockingTypes.NEVER_BLOCK,
          TaskBlockingTypes.BLOCK_WHEN_TWICE_OVERDUE,
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.query.Task.findFirst({
        where: eq(Task.id, input.id),
      });

      if (!task) {
        throw new Error("Task not found");
      }

      if (task.creatorId !== ctx.session.user.id) {
        throw new Error("You are not the owner of this task");
      }

      const updated = await ctx.db
        .update(Task)
        .set({ blocking: input.blocking })
        .where(eq(Task.id, input.id));
      await pusher.trigger(`user-${ctx.session.user.id}`, "refresh-tasks", {
        tasks: [input.id, task.parentTaskId],
      });
      return updated;
    }),
  updateNextDue: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        nextDue: z.date(),
        completionPeriodBegins: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.query.Task.findFirst({
        where: eq(Task.id, input.id),
        with: {
          childTasks: true,
        },
      });

      if (!task) {
        throw new Error("Task not found");
      }

      if (task.creatorId !== ctx.session.user.id) {
        throw new Error("You are not the owner of this task");
      }

      // Calculate completionPeriodBegins if not provided
      let completionPeriodBegins = input.completionPeriodBegins;
      if (!completionPeriodBegins && task.recurring && task.frequencyMinutes) {
        completionPeriodBegins = getCompletionPeriodBegins(
          input.nextDue,
          task.frequencyMinutes,
        );
      }

      // Collect all child task IDs recursively
      const allChildrenIDs: string[] = [];
      let nextChildren = task.childTasks.map((child) => child.id);

      while (nextChildren.length > 0) {
        allChildrenIDs.push(...nextChildren);

        const fullChildren = await ctx.db.query.Task.findMany({
          where: inArray(Task.id, nextChildren),
          with: {
            childTasks: true,
          },
        });

        nextChildren = fullChildren
          .map((child) => child.childTasks.map((c) => c.id))
          .flat();
      }

      // Update the task and all child tasks
      const updated = await ctx.db
        .update(Task)
        .set({
          nextDue: input.nextDue,
          completionPeriodBegins: completionPeriodBegins ?? null,
        })
        .where(inArray(Task.id, [input.id, ...allChildrenIDs]));

      await pusher.trigger(`user-${ctx.session.user.id}`, "refresh-tasks", {
        tasks: [input.id, task.parentTaskId, ...allChildrenIDs],
      });

      return updated;
    }),
  shouldBlockFun: protectedProcedure
    .output(z.boolean())
    .query(async ({ ctx }) => {
      // Get all tasks for the user
      const tasks = await ctx.db.query.Task.findMany({
        where: (tasks, { eq }) => eq(tasks.creatorId, ctx.session.user.id),
      });

      // Check if any task is overdue and has BLOCK_WHEN_OVERDUE set
      const now = new Date();
      for (const task of tasks) {
        if (task.blocking === TaskBlockingTypes.BLOCK_WHEN_OVERDUE) {
          const nextDue = new Date(task.nextDue);

          // For recurring tasks, check if we're in the completion period
          if (task.recurring && task.completionPeriodBegins) {
            const completionPeriodBegins = new Date(
              task.completionPeriodBegins,
            );
            if (now > completionPeriodBegins && now > nextDue) {
              return true;
            }
          }
          // For non-recurring tasks, simply check if the due date has passed
          else if (!task.lastCompleted && now > nextDue) {
            return true;
          }
        }
      }

      return false;
    }),
} satisfies TRPCRouterRecord;

const shouldCompleteParentSet = async (
  task: TaskOutput,
  opts: inferProcedureBuilderResolverOptions<typeof protectedProcedure>,
): Promise<{ result: boolean; numParentCompletedSets: number }> => {
  const { ctx } = opts;
  if (task.parentTaskId) {
    const parentTask = await ctx.db.query.Task.findFirst({
      where: eq(Task.id, task.parentTaskId),
      with: {
        childTasks: true,
      },
    });
    if (!parentTask) {
      throw new Error("Parent task specified but not found");
    }

    let completeParentSet = parentTask.isSet;
    if (parentTask.isSet) {
      const allChildrenCompletionData = await ctx.db
        .select()
        .from(TaskCompletion)
        .where(
          and(
            inArray(
              TaskCompletion.taskId,
              parentTask.childTasks.map((child) => child.id),
            ),
            eq(TaskCompletion.nextDue, task.nextDue),
          ),
        );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const groupedChildrenCompletionData = new Map<string, any[]>();

      for (const g of allChildrenCompletionData) {
        const existing = groupedChildrenCompletionData.get(g.taskId);
        if (existing) {
          existing.push(g);
        } else {
          groupedChildrenCompletionData.set(g.taskId, [g]);
        }
      }

      console.log(
        "groupedChildrenCompletionData: ",
        groupedChildrenCompletionData,
      );

      const allOtherChildrenCompletionNum = [];
      for (const [childId, completionData] of groupedChildrenCompletionData) {
        if (childId === task.id) {
          if (completionData.length >= parentTask.numSets) {
            throw new Error("Cannot complete more sets");
          }
        } else {
          allOtherChildrenCompletionNum.push(completionData.length);
          if (
            completionData.length <
            (groupedChildrenCompletionData.get(task.id)?.length ?? 0)
          ) {
            throw new Error(
              "Cannot complete more sets. Other subtasks need to be completed first",
            );
          }
        }
      }

      console.log(
        "allOtherChildrenCompletionNum: ",
        allOtherChildrenCompletionNum,
      );

      if (
        allOtherChildrenCompletionNum.length === 0 &&
        parentTask.childTasks.length > 1
      ) {
        completeParentSet = false;
      }

      for (const num of allOtherChildrenCompletionNum) {
        console.log("num: ", num);
        if (
          num !=
          (groupedChildrenCompletionData.get(task.id)?.length ?? 0) + 1
        ) {
          completeParentSet = false;
        }
      }
    }

    if (completeParentSet) {
      return {
        result: true,
        numParentCompletedSets: parentTask.numCompletedSets,
      };
    }
  }
  return { result: false, numParentCompletedSets: 0 };
};
