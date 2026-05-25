import { Result, ResultAsync } from 'neverthrow'
import type { AppError } from './errors'

export type AppResult<T> = Result<T, AppError>
export type AppResultAsync<T> = ResultAsync<T, AppError>

const PG_UNIQUE_VIOLATION = '23505'

function isPgUniqueViolation(e: unknown): boolean {
  if (typeof e !== 'object' || e === null) return false
  if ('code' in e && e.code === PG_UNIQUE_VIOLATION) return true
  if ('cause' in e) {
    const { cause } = e
    if (typeof cause === 'object' && cause !== null && 'code' in cause && cause.code === PG_UNIQUE_VIOLATION) return true
  }
  return false
}

export function fromDb<T>(
  promise: Promise<T>,
  conflictMessage?: string,
): AppResultAsync<T> {
  return ResultAsync.fromPromise(promise, (e): AppError => {
    if (conflictMessage !== undefined && isPgUniqueViolation(e))
      return { kind: 'conflict', message: conflictMessage }
    return { kind: 'db', cause: e }
  })
}
