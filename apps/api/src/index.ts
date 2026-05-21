import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { swaggerUI } from '@hono/swagger-ui'
import { join } from 'path'
import { users } from './routes/users'
import { auth } from './routes/auth'
import { ConflictError } from './lib/errors'

const app = new Hono()

app.use(cors())

app.onError((err, c) => {
  if (err instanceof ConflictError) {
    return c.json({ error: err.message }, 409)
  }
  return c.json({ error: 'Internal Server Error' }, 500)
})

app.get('/openapi.yaml', async (c) => {
  const file = Bun.file(join(import.meta.dir, '../../../openapi.yaml'))
  return new Response(await file.text(), {
    headers: { 'Content-Type': 'text/yaml' },
  })
})

app.get('/doc', swaggerUI({ url: '/openapi.yaml' }))

app.route('/users', users)
app.route('/auth', auth)

export default {
  port: 8080,
  fetch: app.fetch,
}
