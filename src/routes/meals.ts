/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { checkSessionIdExist } from '../middlewares/checkSessionId'

export async function mealsRoutes(app: FastifyInstance) {
  // CRIA USER
  app.post('/users', async (req, res) => {
    const createUserSchema = z.object({
      name: z.string(),
      email: z.string(),
    })

    const { name, email } = createUserSchema.parse(req.body)

    let { sessionId } = req.cookies

    if (!sessionId) {
      sessionId = randomUUID()

      res.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 60 * 24 * 7, // 7days
      })
    }

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    })

    return res.status(201).send('Sucess')
  })
  // LISTA USER
  app.get('/users', { preHandler: [checkSessionIdExist] }, async (req, res) => {
    const users = await knex('users').select('')

    return { users }
  })
  // CRIA REFEIÇÃO
  app.post(
    '/meals',
    { preHandler: [checkSessionIdExist] },
    async (req, res) => {
      const createMealSchema = z.object({
        name: z.string(),
        description: z.string(),
        onTheDiet: z.enum(['sim', 'não']),
      })

      const { name, description, onTheDiet } = createMealSchema.parse(req.body)
      const { sessionId } = req.cookies
      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        onTheDiet,
        user_id: sessionId,
      })

      return res.status(201).send('Sucess')
    },
  )
  // LISTA REFEIÇÃO
  app.get('/meals', { preHandler: [checkSessionIdExist] }, async (req, res) => {
    const { sessionId } = req.cookies
    const meals = await knex('meals').select('').where('user_id', sessionId)
    return { meals }
  })
  // TOTAL DE REFEIÇÕES
  app.get(
    '/totalmeals',
    { preHandler: [checkSessionIdExist] },
    async (req, res) => {
      const { sessionId } = req.cookies
      return await knex('meals')
        .count('id', { as: 'Total de Refeições' })
        .where('user_id', sessionId)
    },
  )
  // REFEIÇÕES DENTRO DA DIETA
  app.get(
    '/indiet',
    { preHandler: [checkSessionIdExist] },
    async (req, res) => {
      const { sessionId } = req.cookies

      return await knex('meals').count('id', { as: 'Dentro da Dieta' }).where({
        user_id: sessionId,
        onTheDiet: 'sim',
      })
    },
  )
  // REFEIÇÕES FORA DA DIETA
  app.get(
    '/outdiet',
    { preHandler: [checkSessionIdExist] },
    async (req, res) => {
      const { sessionId } = req.cookies

      return await knex('meals').count('id', { as: 'Fora da Dieta' }).where({
        user_id: sessionId,
        onTheDiet: 'não',
      })
    },
  )
  // RETORNA UMA REFEIÇÃO ESPECIFICA
  app.get(
    '/meals/:id',
    { preHandler: [checkSessionIdExist] },
    async (req, res) => {
      const createIdParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = createIdParamsSchema.parse(req.params)

      const meal = await knex('meals').where({ id })

      return { meal }
    },
  )
  // APAGA UMA REFEIÇÃO
  app.delete(
    '/meals/:id',
    { preHandler: [checkSessionIdExist] },
    async (req, res) => {
      const createIdParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = createIdParamsSchema.parse(req.params)

      await knex('meals').delete().where({ id })

      return res.status(200).send('Removed')
    },
  )

  app.patch('/meals/:id', async (req, res) => {
    const createIdParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = createIdParamsSchema.parse(req.params)

    const createMealSchema = z.object({
      name: z.string(),
      description: z.string(),
      onTheDiet: z.enum(['sim', 'não']),
    })

    const { name, description, onTheDiet } = createMealSchema.parse(req.body)
    await knex('meals')
      .update({
        name,
        description,
        onTheDiet,
      })
      .where({ id })

    return res.status(200).send('Updated')
  })
}
