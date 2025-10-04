import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { pgEnum, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { z } from "zod";

import {
  TaskBlockingTypes,
  TaskCompletionConditions,
  TaskCompletionTypes,
} from "@acme/utils";

export const completionDataTypeEnum = pgEnum("completion_type", [
  TaskCompletionTypes.Boolean,
  TaskCompletionTypes.WeightReps,
  TaskCompletionTypes.Time,
]);

export const completionConditionsEnum = pgEnum("completion_conditions", [
  TaskCompletionConditions.AllSubtasks,
  TaskCompletionConditions.AnySubtask,
]);

export const blockingTypeEnum = pgEnum("blocking_type", [
  TaskBlockingTypes.BLOCK_WHEN_OVERDUE,
  TaskBlockingTypes.NEVER_BLOCK,
  TaskBlockingTypes.BLOCK_WHEN_TWICE_OVERDUE,
]);

export const Task = pgTable("task", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  title: t.text().notNull(),
  description: t.text(),
  recurring: t.boolean().notNull().default(false),
  // Minutes between occurrences
  frequencyMinutes: t.integer(),
  lastCompleted: t.timestamp({ mode: "date", withTimezone: true }),
  completionPeriodBegins: t.timestamp({ mode: "date", withTimezone: true }),
  nextDue: t.timestamp({ mode: "date", withTimezone: true }).notNull(),
  prevDues: t
    .timestamp({ mode: "date", withTimezone: true })
    .array()
    .default([]),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => new Date()),
  creatorId: t
    .uuid()
    .notNull()
    .references(() => User.id),
  parentTaskId: t.uuid().references((): AnyPgColumn => Task.id),
  sortIndex: t.integer().notNull().default(0),
  isSet: t.boolean().notNull().default(false),
  numSets: t.integer().notNull().default(1),
  numCompletedSets: t.integer().notNull().default(0),
  completionDataType: completionDataTypeEnum()
    .notNull()
    .default(TaskCompletionTypes.Boolean),
  completionConditions: completionConditionsEnum()
    .notNull()
    .default(TaskCompletionConditions.AllSubtasks),
  blocking: blockingTypeEnum().notNull().default(TaskBlockingTypes.NEVER_BLOCK),
}));

export const TaskCompletion = pgTable("task_completion", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  taskId: t
    .uuid()
    .notNull()
    .references(() => Task.id),
  nextDue: t.timestamp({ mode: "date", withTimezone: true }).notNull(),
  completionDataType: completionDataTypeEnum().notNull(),
  completionData: t.jsonb(),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => new Date()),
}));

export const TaskRelations = relations(Task, ({ one, many }) => ({
  parentTask: one(Task, {
    fields: [Task.parentTaskId],
    references: [Task.id],
    relationName: "ParentTask",
  }),
  childTasks: many(Task, { relationName: "ParentTask" }),
}));

export const CreateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().max(256),
  description: z.string().max(256),
  recurring: z.boolean(),
  frequencyMinutes: z.number().optional(),
  nextDue: z.date(),
  completionDataType: z.enum([
    TaskCompletionTypes.Boolean,
    TaskCompletionTypes.WeightReps,
    TaskCompletionTypes.Time,
  ]),
});

export const CreateSubtaskSchema = CreateTaskSchema.extend({
  id: z.string().uuid(),
  title: z.string().max(256),
  description: z.string().max(256),
  parentTaskId: z.string().uuid(),
  sortIndex: z.number().optional(),
  completionDataType: z.enum([
    TaskCompletionTypes.Boolean,
    TaskCompletionTypes.WeightReps,
    TaskCompletionTypes.Time,
  ]),
  isSet: z.boolean(),
});

export const CreateSubtaskSetSchema = z.object({
  setTaskId: z.string().uuid(),
  childTaskId: z.string().uuid(),
  parentTaskId: z.string().uuid(),
  title: z.string().max(256),
  description: z.string().max(256),
  sortIndex: z.number().optional(),
  completionDataType: z.enum([
    TaskCompletionTypes.Boolean,
    TaskCompletionTypes.WeightReps,
    TaskCompletionTypes.Time,
  ]),
});

export const User = pgTable("user", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.varchar({ length: 255 }),
  email: t.varchar({ length: 255 }).notNull(),
  emailVerified: t.timestamp({ mode: "date", withTimezone: true }),
  image: t.varchar({ length: 255 }),
}));

export const UserRelations = relations(User, ({ many }) => ({
  accounts: many(Account),
}));

export const Account = pgTable(
  "account",
  (t) => ({
    userId: t
      .uuid()
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    type: t
      .varchar({ length: 255 })
      .$type<"email" | "oauth" | "oidc" | "webauthn">()
      .notNull(),
    provider: t.varchar({ length: 255 }).notNull(),
    providerAccountId: t.varchar({ length: 255 }).notNull(),
    refresh_token: t.varchar({ length: 255 }),
    access_token: t.text(),
    expires_at: t.integer(),
    token_type: t.varchar({ length: 255 }),
    scope: t.varchar({ length: 255 }),
    id_token: t.text(),
    session_state: t.varchar({ length: 255 }),
  }),
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const AccountRelations = relations(Account, ({ one }) => ({
  user: one(User, { fields: [Account.userId], references: [User.id] }),
}));

export const Session = pgTable("session", (t) => ({
  sessionToken: t.varchar({ length: 255 }).notNull().primaryKey(),
  userId: t
    .uuid()
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  expires: t.timestamp({ mode: "date", withTimezone: true }).notNull(),
}));

export const SessionRelations = relations(Session, ({ one }) => ({
  user: one(User, { fields: [Session.userId], references: [User.id] }),
}));

export const DomainBlocking = pgTable("domain_blocking", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  creatorId: t
    .uuid()
    .notNull()
    .references(() => User.id),
  domain: t.text().notNull(),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => new Date()),
}));

export const DomainBlockingRelations = relations(DomainBlocking, ({ one }) => ({
  creator: one(User, {
    fields: [DomainBlocking.creatorId],
    references: [User.id],
  }),
}));
