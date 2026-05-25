import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { loginSchema } from '@repo/schema'
import { login } from '../services'

const sessions = new Hono()

sessions.post('/', zValidator('json', loginSchema), async (c) => {
  const data = c.req.valid('json')
  const result = await login(data)
  return result.match(
    (res) => c.json(res, 200),
    (error) => {
      switch (error.kind) {
        case 'unauthorized': return c.json({ error: 'Invalid credentials' }, 401)
        case 'conflict': return c.json({ error: error.message }, 409)
        case 'db':
        case 'unknown': return c.json({ error: 'Internal Server Error' }, 500)
      }
    },
  )
})

export { sessions }
