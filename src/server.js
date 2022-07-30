import fastify from 'fastify'
import { applyMiddleware } from 'graphql-middleware'
import {
  getGraphQLParameters,
  processRequest,
  renderGraphiQL,
  shouldRenderGraphiQL,
  sendResult,
} from 'graphql-helix'

import { makeExecutableSchema } from '@graphql-tools/schema'
import { readFileSync } from 'node:fs'

import { resolvers } from './resolvers/index.js'
import { PrismaClient } from '@prisma/client'
import { getUser } from './utils.js'
import { permissions } from './permissions.js'

export const prisma = new PrismaClient()

const typeDefs = readFileSync(
  new URL('schema.graphql', import.meta.url),
  'utf8',
).toString()

const schema = makeExecutableSchema({ typeDefs, resolvers })
const schemaWithPermissions = applyMiddleware(
  schema,
  permissions.generate(schema),
)

const development = process.env.NODE_ENV === 'development'
const app = fastify({
  logger: development
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      }
    : undefined,
})

app.route({
  method: ['GET', 'POST'],
  url: '/graphql',
  async handler(originalRequest, originalResult) {
    // Determine whether we should render GraphiQL instead of returning an API response
    const request = {
      body: originalRequest.body,
      headers: originalRequest.headers,
      method: originalRequest.method,
      query: originalRequest.query,
    }
    if (shouldRenderGraphiQL(request)) {
      originalResult.type('text/html')
      originalResult.send(renderGraphiQL({}))
    } else {
      // Extract the Graphql parameters from the request
      const { operationName, query, variables } = getGraphQLParameters(request)

      // Validate and execute the query
      const result = await processRequest({
        operationName,
        query,
        variables,
        request,
        schema: schemaWithPermissions,
        contextFactory: async () => ({
          request,
          prisma,
          user: await getUser(request, prisma),
        }),
      })

      sendResult(result, originalResult.raw)
    }
  },
})

const port = process.env.PORT || 4000
const host = process.env.HOST || 'localhost'

app.listen({ port, host })
