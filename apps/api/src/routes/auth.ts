import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { registerSchema } from '@repo/schema'
import { registerUser } from '../services'

const auth = new Hono()

auth.post('/register', zValidator('json', registerSchema), async (c) => {
  const data = c.req.valid('json')
  const result = await registerUser(data)
  return result.match(
    (user) => c.json(user, 201),
    (error) => {
      switch (error.kind) {
        case 'conflict': return c.json({ error: error.message }, 409)
        case 'db':
        case 'unknown':
        default: return c.json({ error: 'Internal Server Error' }, 500)
      }
    },
  )
})

export { auth }
