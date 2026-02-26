import type { FastifyInstance } from 'fastify'

export async function registerErrorHandler(app: FastifyInstance): Promise<void> {
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error)

    const statusCode = error.statusCode ?? 500
    const message = statusCode < 500 ? error.message : 'An unexpected error occurred'

    return reply.status(statusCode).send({
      status: 'error',
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    })
  })
}
