import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, eq } from "@acme/db";
import { CreateRecurringTaskSchema, RecurringTask } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

export const recurringTaskRouter = {
  createRecurringTask: protectedProcedure
    .input(CreateRecurringTaskSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(RecurringTask).values({
        ...input,
        creatorId: ctx.session.user.id,
        nextDue: new Date(
          new Date().getTime() + 3600 * 1000 * input.frequencyHours,
        ),
      });
    }),
  completeRecurringTask: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      console.log("completeTask", input);

      const task = await ctx.db.query.RecurringTask.findFirst({
        where: eq(RecurringTask.id, input.id),
      });

      if (task?.creatorId !== ctx.session.user.id) {
        throw new Error("You are not the owner of this task");
      }

      console.log("you own this task");
      const res = await ctx.db
        .update(RecurringTask)
        .set({
          lastCompleted: new Date(),
          nextDue: new Date(
            new Date().getTime() + 3600 * 1000 * task.frequencyHours,
          ),
        })
        .where(eq(RecurringTask.id, input.id));
      console.log("res", res);
      return res;
    }),
  getAllMyRecurringTasks: protectedProcedure.query(({ ctx }) => {
    return ctx.db
      .select()
      .from(RecurringTask)
      .where(eq(RecurringTask.creatorId, ctx.session.user.id));
  }),
  getAllMyActiveRecurringTasks: protectedProcedure.query(({ ctx }) => {
    console.log("getAllMyActiveTasks");
    return ctx.db.query.RecurringTask.findMany({
      where: and(eq(RecurringTask.creatorId, ctx.session.user.id)),
    });
  }),
} satisfies TRPCRouterRecord;
