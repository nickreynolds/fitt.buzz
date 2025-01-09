import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, eq, gte, lte } from "@acme/db";
import { RecurringTask, Task } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

const zodSchema = z.object({
  title: z.string(),
  description: z.string(),
  nextDue: z.date(),
  frequencyHours: z.number().optional(),
});

export const taskRouter = {
  createTask: protectedProcedure.input(zodSchema).mutation(({ ctx, input }) => {
    if (input.frequencyHours && input.frequencyHours > 0) {
      return ctx.db.insert(RecurringTask).values({
        ...input,
        creatorId: ctx.session.user.id,
        frequencyHours: input.frequencyHours,
        completionPeriodBegins: new Date(
          input.nextDue.getTime() - input.frequencyHours * 60 * 60 * 1000 * 0.7,
        ),
      });
    }
    return ctx.db
      .insert(Task)
      .values({ ...input, creatorId: ctx.session.user.id });
  }),
  completeTask: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.query.Task.findFirst({
        where: eq(Task.id, input.id),
      });

      if (task) {
        if (task.creatorId !== ctx.session.user.id) {
          throw new Error("You are not the owner of this task");
        }

        const res = await ctx.db
          .update(Task)
          .set({ completed: true })
          .where(eq(Task.id, input.id));
        return res;
      }

      const recurringTask = await ctx.db.query.RecurringTask.findFirst({
        where: eq(RecurringTask.id, input.id),
      });

      if (recurringTask) {
        if (recurringTask.creatorId !== ctx.session.user.id) {
          throw new Error("You are not the owner of this task");
        }

        if (recurringTask.completionPeriodBegins > new Date()) {
          throw new Error("Task cannot be completed yet");
        }

        // find good nextDue date. Should be a date in the future at least 70% of the way through the frequency period and should be an exact multiple of the frequency period

        const minimumNextDueDate =
          new Date().getTime() +
          recurringTask.frequencyHours * 60 * 60 * 1000 * 0.7;

        let dueDate =
          recurringTask.nextDue.getTime() +
          recurringTask.frequencyHours * 60 * 60 * 1000;

        while (dueDate < minimumNextDueDate) {
          dueDate += recurringTask.frequencyHours * 60 * 60 * 1000;
        }

        const res = await ctx.db
          .update(RecurringTask)
          .set({
            lastCompleted: new Date(),
            completionPeriodBegins: new Date(
              dueDate - recurringTask.frequencyHours * 60 * 60 * 1000 * 0.3,
            ),
            nextDue: new Date(dueDate),
          })
          .where(eq(RecurringTask.id, input.id));
        console.log("res", res);
        return res;
      }

      throw new Error("Task not found");
    }),
  getAllMyTasks: protectedProcedure.query(({ ctx }) => {
    return ctx.db
      .select()
      .from(Task)
      .where(eq(Task.creatorId, ctx.session.user.id));
  }),
  getAllMyActiveTasks: protectedProcedure.query(({ ctx }) => {
    console.log("getAllMyActiveTasks");
    return ctx.db.query.Task.findMany({
      where: and(
        eq(Task.creatorId, ctx.session.user.id),
        eq(Task.completed, false),
      ),
    });
  }),
  getAllMyRecurringTasks: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.RecurringTask.findMany({
      where: (tasks, { eq }) => eq(tasks.creatorId, ctx.session.user.id),
      orderBy: (tasks, { asc }) => [asc(tasks.nextDue)],
    });
  }),
  getMyActiveRecurringTasks: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.RecurringTask.findMany({
      where: (tasks, { eq }) =>
        and(
          eq(tasks.creatorId, ctx.session.user.id),
          lte(tasks.completionPeriodBegins, new Date()),
        ),
      orderBy: (tasks, { asc }) => [asc(tasks.nextDue)],
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

      // If no regular task found, try to find and delete a recurring task
      const recurringTask = await ctx.db.query.RecurringTask.findFirst({
        where: eq(RecurringTask.id, input.id),
      });

      if (recurringTask) {
        if (recurringTask.creatorId !== ctx.session.user.id) {
          throw new Error("You are not the owner of this task");
        }
        return await ctx.db
          .delete(RecurringTask)
          .where(eq(RecurringTask.id, input.id));
      }

      throw new Error("Task not found");
    }),
} satisfies TRPCRouterRecord;
