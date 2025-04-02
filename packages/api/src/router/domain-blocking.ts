import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq } from "@acme/db";
import { DomainBlocking } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

export const domainBlockingRouter = {
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.DomainBlocking.findMany({
      where: eq(DomainBlocking.creatorId, ctx.session.user.id),
      orderBy: (domainBlocking, { desc }) => [desc(domainBlocking.createdAt)],
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        domain: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const inserted = await ctx.db
        .insert(DomainBlocking)
        .values({
          domain: input.domain,
          creatorId: ctx.session.user.id,
        })
        .returning();

      return inserted[0];
    }),
} satisfies TRPCRouterRecord;
