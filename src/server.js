import fastify from 'fastify'
import lru from 'tiny-lru'
import { applyMiddleware } from 'graphql-middleware'
import { getGraphQLParameters, processRequest, sendResult } from 'graphql-helix'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { renderPlaygroundPage } from 'graphql-playground-html'
import { readFileSync } from 'node:fs'
import { parse, validate } from 'graphql'
import { PrismaClient } from '@prisma/client'
import { resolvers } from './resolvers/index.js'
import { getUser } from './utils.js'
import { permissions } from './permissions.js'

const cache = lru(1000, 60 * 60 * 1000)

const checkOrigin = origin => {
  if (!process.env.ALLOWED_ORIGINS) return false
  if (process.env.ALLOWED_ORIGINS === '*') return '*'
  const allowedOrigins = process.env.ALLOWED_ORIGINS.split(' ')
  return allowedOrigins.includes(origin) && origin
}
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

// CORS stuff
app.options('/graphql', (request, response) => {
  const origin = checkOrigin(request.headers.origin)
  if (origin === false) {
    response.code('403')
    response.send()
    return
  }
  response.headers({
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization,content-type',
    'Access-Control-Max-Age': 60 * 60 * 24,
  })
  response.send()
})

app.get('/graphql', (request, response) => {
  response.type('text/html')
  response.send(renderPlaygroundPage({ endpoint: '/graphql' }))
})

app.post('/graphql', async (request, response) => {
  const { operationName, query, variables } = getGraphQLParameters(request)
  const cacheKey = query || ''
  const cached = cache.get(cacheKey)
  let document = cached?.document
  let validationErrors = cached?.validationErrors
  const result = await processRequest({
    operationName,
    query,
    variables,
    request,
    schema: schemaWithPermissions,
    parse: (source, options) => {
      if (!document) {
        document = parse(source, options)
        cache.set(cacheKey, { document })
      }
      return document
    },
    validate: (schema, documentAST, rules, typeInfo, options) => {
      if (!validationErrors) {
        validationErrors = validate(
          schema,
          documentAST,
          rules,
          typeInfo,
          options,
        )
        cache.set(cacheKey, { document, validationErrors })
      }
      return validationErrors
    },
    contextFactory: async () => ({
      request,
      prisma,
      user: await getUser(request, prisma),
    }),
  })
  // CORS stuff
  const origin = checkOrigin(request.headers.origin)
  if (origin === false) {
    response.statusCode = '403'
    response.send()
    return
  } else {
    const corsHeaders = [
      { name: 'Access-Control-Allow-Origin', value: origin },
      { name: 'Access-Control-Allow-Methods', value: 'POST, GET, OPTIONS' },
      {
        name: 'access-control-allow-headers',
        value: 'authorization,content-type',
      },
      { name: 'access-control-max-age', value: 60 * 60 * 24 },
    ]
    result.headers = [...result.headers, ...corsHeaders]
  }

  sendResult(result, response.raw)
})

const port = process.env.PORT || 4000
const host = process.env.HOST || 'localhost'

app.listen({ port, host })
