import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq, inArray, isNull, lte, or, sql } from "@acme/db";
import {
  CreateSubtaskSchema,
  CreateTaskSchema,
  Task,
  TaskCompletion,
} from "@acme/db/schema";
import { getCompletionPeriodBegins, TaskCompletionTypes } from "@acme/utils";

import { protectedProcedure } from "../trpc";
import { bootstrapTasks } from "../utils/bootstrap";

const baseTaskOutputSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  recurring: z.boolean(),
  // Hours between occurrences
  frequencyHours: z.number().nullable(),
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
      if (task.recurring && task.frequencyHours) {
        const completionPeriodBegins: Date = getCompletionPeriodBegins(
          task.nextDue,
          task.frequencyHours,
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
      if (input.frequencyHours && input.frequencyHours > 0) {
        const inserted = await ctx.db
          .insert(Task)
          .values({
            ...input,
            creatorId: ctx.session.user.id,
            completionPeriodBegins:
              input.recurring && input.frequencyHours
                ? getCompletionPeriodBegins(input.nextDue, input.frequencyHours)
                : null,
          })
          .returning();
        return inserted[0]?.id;
      }
      const inserted = await ctx.db
        .insert(Task)
        .values({ ...input, creatorId: ctx.session.user.id })
        .returning();
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
      return ctx.db.insert(Task).values({
        ...input,
        recurring: parent.recurring,
        frequencyHours: parent.frequencyHours ?? null,
        nextDue: parent.nextDue,
        completionPeriodBegins: parent.completionPeriodBegins,
        creatorId: ctx.session.user.id,
      });
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

        const res = await ctx.db.transaction(async (trx) => {
          if (task.parentTaskId) {
            let completeParentSet = true;
            const parentTask = await ctx.db.query.Task.findFirst({
              where: eq(Task.id, task.parentTaskId),
              with: {
                childTasks: true,
              },
            });
            if (!parentTask) {
              throw new Error("Parent task specified but not found");
            }
            console.log("task.nextDue: ", task.nextDue);
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

              console.log(
                "allChildrenCompletionData",
                allChildrenCompletionData,
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

              const allOtherChildrenCompletionNum = [];
              for (const [
                childId,
                completionData,
              ] of groupedChildrenCompletionData) {
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
              for (const num of allOtherChildrenCompletionNum) {
                if (
                  num !=
                  (groupedChildrenCompletionData.get(task.id)?.length ?? 0) + 1
                ) {
                  completeParentSet = false;
                }
              }
            }

            if (completeParentSet) {
              const completedParentSets = parentTask.numCompletedSets;
              await trx
                .update(Task)
                .set({ numCompletedSets: completedParentSets + 1 })
                .where(eq(Task.id, task.parentTaskId));
            }
          }

          const res = await trx.insert(TaskCompletion).values({
            taskId: task.id,
            completionDataType: TaskCompletionTypes.WeightReps,
            completionData: {
              weight: input.weight,
              weightUnit: input.weightUnit,
              reps: input.reps,
            },
            nextDue: task.nextDue,
          });

          return res;
        });

        return res;
      } else {
        throw new Error("Task not found");
      }
    }),
  completeTask: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
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

        if (task.completionDataType !== TaskCompletionTypes.Boolean) {
          throw new Error("Task is not of type WeightReps");
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
                throw new Error(
                  "Cannot complete task with incomplete subtasks",
                );
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
          if (!task.frequencyHours) {
            throw new Error("Recurring task has no frequencyHours set");
          }
          const minimumNextDueDate =
            new Date().getTime() + task.frequencyHours * 60 * 60 * 1000 * 0.7;

          let dueDate =
            task.nextDue.getTime() + task.frequencyHours * 60 * 60 * 1000;

          while (dueDate < minimumNextDueDate) {
            dueDate += task.frequencyHours * 60 * 60 * 1000;
          }

          const prevDue = task.nextDue;

          const res = await ctx.db
            .update(Task)
            .set({
              lastCompleted: new Date(),
              completionPeriodBegins: getCompletionPeriodBegins(
                new Date(dueDate),
                task.frequencyHours,
              ),
              nextDue: new Date(dueDate),
              numCompletedSets: 0,
              prevDues: sql`array_append(${Task.prevDues}, ${prevDue})`,
            })
            .where(inArray(Task.id, [input.id, ...allChildrenIDs]));
          console.log("res", res);
          return res;
        } else {
          if (task.parentTaskId) {
            const parentTask = await ctx.db.query.Task.findFirst({
              where: eq(Task.id, task.parentTaskId),
            });
            if (parentTask?.isSet) {
              // do same as in weights/reps
            }
          }
          const res = await ctx.db
            .update(Task)
            .set({ lastCompleted: new Date() })
            .where(eq(Task.id, input.id));
          return res;
        }
      }

      throw new Error("Task not found");
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
                orderBy: [desc(TaskCompletion.nextDue)],
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
      });

      if (task) {
        if (task.creatorId !== ctx.session.user.id) {
          throw new Error("You are not the owner of this task");
        }
        return await ctx.db.delete(Task).where(eq(Task.id, input.id));
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
          .set({ numSets: input.numSets })
          .where(eq(Task.id, input.id));
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

      console.log("reorder 2.");
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

      // TODO: write a single query to do this (below code should basically work but has a column type error)

      // console.log("reorder 3.");
      // const sqlChunks: SQL[] = [];
      // const ids: string[] = [];

      // sqlChunks.push(sql`(case`);

      // for (const m of input) {
      //   sqlChunks.push(sql`when ${Task.id} = ${m.id} then ${m.sortIndex}`);
      //   ids.push(m.id);
      // }

      // sqlChunks.push(sql`end)`);

      // console.log("reorder 4.");
      // const finalSql: SQL = sql.join(sqlChunks, sql.raw(" "));

      // await ctx.db
      //   .update(Task)
      //   .set({ sortIndex: finalSql })
      //   .where(inArray(Task.id, ids));

      // console.log("reorder 5.");
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

      return await ctx.db
        .update(Task)
        .set({ title: input.title })
        .where(eq(Task.id, input.id));
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

      return await ctx.db
        .update(Task)
        .set({ isSet: input.isSet, numSets: input.isSet ? 1 : 0 })
        .where(eq(Task.id, input.id));
    }),
} satisfies TRPCRouterRecord;
