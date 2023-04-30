import { FastifyReply } from 'fastify/types/reply'
import { FastifyRequest } from 'fastify/types/request'

export async function checkSessionIdExist(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const { sessionId } = req.cookies

  if (!sessionId) {
    return res.status(401).send({ error: 'Not authorized!' })
  }
}
