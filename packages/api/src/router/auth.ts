import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { invalidateSessionToken } from "@acme/auth";
import { User } from "@acme/db/schema";
import { TaskBlockingTypes } from "@acme/utils";

import { protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = {
  getSession: publicProcedure.query(({ ctx }) => {
    console.log("getting session:", ctx);
    return ctx.session;
  }),
  getSecretMessage: protectedProcedure.query(() => {
    return "you can see this secret message!";
  }),
  signOut: protectedProcedure.mutation(async (opts) => {
    console.log("sign out.");
    if (!opts.ctx.token) {
      return { success: false };
    }
    await invalidateSessionToken(opts.ctx.token);
    return { success: true };
  }),
  getAllUsersBlockingStatus: protectedProcedure
    .output(
      z.array(
        z.object({
          id: z.string(),
          name: z.string().nullable(),
          email: z.string(),
          shouldBlockFun: z.boolean(),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      // Get all users
      const users = await ctx.db.select().from(User);

      // For each user, check their blocking status
      const usersWithBlockingStatus = await Promise.all(
        users.map(async (user) => {
          // Get all tasks for this user
          const tasks = await ctx.db.query.Task.findMany({
            where: (tasks, { eq }) => eq(tasks.creatorId, user.id),
          });

          // Check if any task is overdue and has BLOCK_WHEN_OVERDUE set
          let shouldBlockFun = false;
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
                  shouldBlockFun = true;
                  break;
                }
              }
              // For non-recurring tasks, simply check if the due date has passed
              else if (!task.lastCompleted && now > nextDue) {
                shouldBlockFun = true;
                break;
              }
            }
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            shouldBlockFun,
          };
        }),
      );

      return usersWithBlockingStatus;
    }),
} satisfies TRPCRouterRecord;
