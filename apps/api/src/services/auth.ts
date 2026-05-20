import { db } from '../db'
import { users, auth } from '../db/schema'
import type { RegisterInput } from '@repo/schema'
import type { UserSelect } from '../db/schema'

export async function registerUser(input: RegisterInput): Promise<UserSelect> {
  const passwordHash = await Bun.password.hash(input.password, { algorithm: 'argon2id' })

  return await db.transaction(async (tx) => {
    const [user] = await tx.insert(users).values({
      name: input.name,
      email: input.email,
    }).returning()

    if (!user) throw new Error('Failed to create user')

    await tx.insert(auth).values({
      userId: user.id,
      passwordHash,
    })

    return user
  })
}
