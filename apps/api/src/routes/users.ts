import { Hono } from 'hono'
import { getUsers, getUserById, deleteUser } from '../crud'

const users = new Hono()

users.get('/', async (c) => {
  const result = await getUsers()
  return c.json(result)
})

users.get('/:id', async (c) => {
  const user = await getUserById(c.req.param('id'))
  if (!user) return c.json({ error: 'Not found' }, 404)
  return c.json(user)
})

users.delete('/:id', async (c) => {
  const deleted = await deleteUser(c.req.param('id'))
  if (!deleted) return c.json({ error: 'Not found' }, 404)
  return new Response(null, { status: 204 })
})

export { users }
