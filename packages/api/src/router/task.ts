import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import type { SQL } from "@acme/db";
import { eq, inArray, isNull, lte, sql } from "@acme/db";
import { CreateSubtaskSchema, CreateTaskSchema, Task } from "@acme/db/schema";
import { getCompletionPeriodBegins } from "@acme/utils";

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

        // if task has children, check that all children are completed.
        if (task.childTasks.length > 0) {
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

        const childrenIDs = task.childTasks.map((child) => child.id);

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

          const res = await ctx.db
            .update(Task)
            .set({
              lastCompleted: new Date(),
              completionPeriodBegins: getCompletionPeriodBegins(
                new Date(dueDate),
                task.frequencyHours,
              ),
              nextDue: new Date(dueDate),
            })
            .where(inArray(Task.id, [input.id, ...childrenIDs]));
          console.log("res", res);
          return res;
        } else {
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

      return task;
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
} satisfies TRPCRouterRecord;
