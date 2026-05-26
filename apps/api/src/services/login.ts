import { ResultAsync, err, ok } from 'neverthrow'
import { sign } from 'hono/jwt'
import { getUserByEmail } from '../crud/users'
import { getAuthByUserId } from '../crud/auth'
import { verifyPassword } from './auth'
import { fromDb, type AppResultAsync } from '../lib/result'
import type { AppError } from '../lib/errors'
import type { LoginInput } from '@repo/schema'
import type { AuthSelect } from '../db/schema'

const _jwtSecret = process.env.JWT_SECRET
if (!_jwtSecret) throw new Error('JWT_SECRET is not set')
const JWT_SECRET: string = _jwtSecret

const DUMMY_HASH = await Bun.password.hash('dummy', { algorithm: 'argon2id' })

export function login(input: LoginInput): AppResultAsync<{ accessToken: string }> {
  return fromDb(getUserByEmail(input.email))
    .andThen((user) => {
      const authPromise: Promise<AuthSelect | undefined> = user
        ? getAuthByUserId(user.id)
        : Promise.resolve(undefined)

      return fromDb(authPromise).andThen((authRecord) => {
        const hash = authRecord?.passwordHash ?? DUMMY_HASH
        return verifyPassword(hash, input.password).andThen(() => {
          if (!user || !authRecord) return err<string, AppError>({ kind: 'unauthorized' })
          return ok(user.id)
        })
      })
    })
    .andThen((userId) =>
      ResultAsync.fromPromise(
        sign(
          { sub: userId, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 },
          JWT_SECRET,
        ),
        (e): AppError => ({ kind: 'unknown', cause: e }),
      ),
    )
    .map((accessToken) => ({ accessToken }))
}
