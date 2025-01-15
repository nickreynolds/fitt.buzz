import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, lte } from "@acme/db";
import { CreateSubtaskSchema, CreateTaskSchema, Task } from "@acme/db/schema";
import { getCompletionPeriodBegins } from "@acme/utils";

import { protectedProcedure } from "../trpc";
import { bootstrapTasks } from "../utils/bootstrap";

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
    .mutation(({ ctx, input }) => {
      if (input.frequencyHours && input.frequencyHours > 0) {
        return ctx.db.insert(Task).values({
          ...input,
          creatorId: ctx.session.user.id,
          completionPeriodBegins:
            input.recurring && input.frequencyHours
              ? getCompletionPeriodBegins(input.nextDue, input.frequencyHours)
              : null,
        });
      }
      return ctx.db
        .insert(Task)
        .values({ ...input, creatorId: ctx.session.user.id });
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
            .where(eq(Task.id, input.id));
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
    .query(({ ctx, input }) => {
      return ctx.db.query.Task.findFirst({
        where: eq(Task.id, input.id),
        with: {
          childTasks: {
            with: {
              childTasks: true,
            },
          },
        },
      });
    }),
  getAllMyTasks: protectedProcedure.query(({ ctx }) => {
    return ctx.db
      .select()
      .from(Task)
      .where(eq(Task.creatorId, ctx.session.user.id));
  }),
  getAllMyActiveTasks: protectedProcedure.query(({ ctx }) => {
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
} satisfies TRPCRouterRecord;
