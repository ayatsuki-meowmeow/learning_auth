export type AppError =
  | { kind: 'conflict'; message: string }
  | { kind: 'unauthorized' }
  | { kind: 'db'; cause: unknown }
  | { kind: 'unknown'; cause: unknown }
