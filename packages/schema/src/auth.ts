import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
})

export type RegisterInput = z.infer<typeof registerSchema>
