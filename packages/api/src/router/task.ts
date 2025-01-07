import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, eq } from "@acme/db";
import { CreateTaskSchema, Task } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

export const taskRouter = {
  createTask: protectedProcedure
    .input(CreateTaskSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db
        .insert(Task)
        .values({ ...input, creatorId: ctx.session.user.id });
    }),
  completeTask: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      console.log("completeTask", input);

      const task = await ctx.db.query.Task.findFirst({
        where: eq(Task.id, input.id),
      });

      if (task?.creatorId !== ctx.session.user.id) {
        throw new Error("You are not the owner of this task");
      }

      console.log("you own this task");
      const res = await ctx.db
        .update(Task)
        .set({ completed: true })
        .where(eq(Task.id, input.id));
      console.log("res", res);
      return res;
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
} satisfies TRPCRouterRecord;
