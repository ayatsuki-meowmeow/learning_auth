import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { defineRelations } from 'drizzle-orm';

export const auth = pgTable('auth', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  passwordHash: varchar('password_hash').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const authRelations = defineRelations({ users, auth }, (r) => ({
  auth: {
    user: r.one.users({
      from: r.auth.userId,
      to: r.users.id,
    }),
  },
}));

export type AuthInsert = typeof auth.$inferInsert
export type AuthSelect = typeof auth.$inferSelect
