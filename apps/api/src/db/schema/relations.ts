import { relations } from 'drizzle-orm';
import { auth } from './auth';
import { users } from './users';

export const authRelations = relations(auth, ({ one }) => ({
  user: one(users, {
    fields: [auth.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ one }) => ({
  auth: one(auth, {
    fields: [users.id],
    references: [auth.userId],
  }),
}));
