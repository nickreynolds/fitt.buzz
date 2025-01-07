import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, eq } from "@acme/db";
import { CreateTaskSchema, Task } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

export const taskRouter = {
  createTask: protectedProcedure
    .input(CreateTaskSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(Task).values(input);
    }),
  completeTask: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ ctx, input }) => {
      return ctx.db
        .update(Task)
        .set({ completed: true })
        .where(eq(Task.id, input.id));
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
