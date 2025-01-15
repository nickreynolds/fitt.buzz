import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { pgTable, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const Task = pgTable("task", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  title: t.text().notNull(),
  description: t.text(),
  recurring: t.boolean().notNull().default(false),
  // Hours between occurrences
  frequencyHours: t.integer(),
  lastCompleted: t.timestamp({ mode: "date", withTimezone: true }),
  completionPeriodBegins: t.timestamp({ mode: "date", withTimezone: true }),
  nextDue: t.timestamp({ mode: "date", withTimezone: true }).notNull(),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => new Date()),
  creatorId: t
    .uuid()
    .notNull()
    .references(() => User.id),
  parentTaskId: t.uuid().references((): AnyPgColumn => Task.id),
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
  title: z.string().max(256),
  description: z.string().max(256),
  recurring: z.boolean(),
  frequencyHours: z.number().optional(),
  nextDue: z.date(),
});

export const CreateSubtaskSchema = z.object({
  title: z.string().max(256),
  description: z.string().max(256),
  parentTaskId: z.string().uuid(),
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
