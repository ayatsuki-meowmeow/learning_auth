import { eq } from 'drizzle-orm'
import { db } from '../db'
import { auth, AuthInsert, AuthSelect } from '../db/schema'

export async function getAuthByUserId(userId: string): Promise<AuthSelect | undefined> {
  const [record] = await db.select().from(auth).where(eq(auth.userId, userId))
  return record
}

export async function createAuth(data: AuthInsert): Promise<AuthSelect> {
  const [record] = await db.insert(auth).values(data).returning()
  if (!record) throw new Error('Failed to create auth')
  return record
}
