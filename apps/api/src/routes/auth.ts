import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { registerSchema } from '@repo/schema'
import { registerUser } from '../services'

const auth = new Hono()

auth.post('/register', zValidator('json', registerSchema), async (c) => {
  const data = c.req.valid('json')
  const user = await registerUser(data)
  return c.json(user, 201)
})

export { auth }
