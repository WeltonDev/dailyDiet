import fastify from 'fastify'
import { mealsRoutes } from './routes/meals'
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(mealsRoutes)
app.register(cookie)
