import { ResultAsync, err, ok } from 'neverthrow'
import { sign } from 'hono/jwt'
import { getUserByEmail } from '../crud/users'
import { getAuthByUserId } from '../crud/auth'
import { verifyPassword } from './auth'
import { fromDb, type AppResultAsync } from '../lib/result'
import type { AppError } from '../lib/errors'
import type { LoginInput } from '@repo/schema'

export function login(input: LoginInput): AppResultAsync<{ accessToken: string }> {
  const JWT_SECRET = process.env.JWT_SECRET
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not set')

  return fromDb(getUserByEmail(input.email))
    .andThen((user) =>
      user ? ok(user) : err<typeof user & {}, AppError>({ kind: 'unauthorized' }),
    )
    .andThen((user) =>
      fromDb(getAuthByUserId(user.id)).andThen((authRecord) =>
        authRecord
          ? ok({ userId: user.id, passwordHash: authRecord.passwordHash })
          : err<{ userId: string; passwordHash: string }, AppError>({ kind: 'unauthorized' }),
      ),
    )
    .andThen(({ userId, passwordHash }) =>
      verifyPassword(passwordHash, input.password).map(() => userId),
    )
    .andThen((userId) =>
      ResultAsync.fromPromise(
        sign(
          { sub: userId, exp: Math.floor(Date.now() / 1000) + 3600 },
          JWT_SECRET,
        ),
        (e): AppError => ({ kind: 'unknown', cause: e }),
      ),
    )
    .map((accessToken) => ({ accessToken }))
}
