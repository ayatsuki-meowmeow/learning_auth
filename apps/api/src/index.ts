import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { swaggerUI } from '@hono/swagger-ui'
import { join } from 'path'
import { users } from './routes/users'
import { auth } from './routes/auth'
import { sessions } from './routes/sessions'
const app = new Hono()

app.use(cors())

app.onError((_err, c) => {
  return c.json({ error: 'Internal Server Error' }, 500)
})

app.get('/openapi.yaml', async () => {
  const file = Bun.file(join(import.meta.dir, '../../../openapi.yaml'))
  return new Response(await file.text(), {
    headers: { 'Content-Type': 'text/yaml' },
  })
})

app.get('/doc', swaggerUI({ url: '/openapi.yaml' }))

app.route('/users', users)
app.route('/auth', auth)
app.route('/sessions', sessions)

export default {
  port: 8080,
  fetch: app.fetch,
}
