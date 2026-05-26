import { ResultAsync, err, ok } from 'neverthrow'
import { db } from '../db'
import { users, auth } from '../db/schema'
import type { RegisterInput } from '@repo/schema'
import type { UserSelect } from '../db/schema'
import { fromDb, type AppResultAsync } from '../lib/result'
import type { AppError } from '../lib/errors'

export function verifyPassword(hash: string, password: string): AppResultAsync<void> {
  return ResultAsync.fromPromise(
    Bun.password.verify(password, hash),
    (e): AppError => ({ kind: 'unknown', cause: e }),
  ).andThen((isMatch) =>
    isMatch ? ok<void, AppError>(undefined) : err<void, AppError>({ kind: 'unauthorized' }),
  )
}

export function registerUser(input: RegisterInput): AppResultAsync<UserSelect> {
  const task = async () => {
    const passwordHash = await Bun.password.hash(input.password, { algorithm: 'argon2id' })

    return db.transaction(async (tx) => {
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

  return fromDb(task(), 'Email already registered')
}
