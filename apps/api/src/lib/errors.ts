export type AppError =
  | { kind: 'conflict'; message: string }
  | { kind: 'db'; cause: unknown }
  | { kind: 'unknown'; cause: unknown }
