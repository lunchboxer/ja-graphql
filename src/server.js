import express from 'express'
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

const app = express()
app.use(express.json())

app.use('/graphql', async (expressRequest, expressResult) => {
  // Determine whether we should render GraphiQL instead of returning an API response
  const request = {
    body: expressRequest.body,
    headers: expressRequest.headers,
    method: expressRequest.method,
    query: expressRequest.query,
  }
  if (shouldRenderGraphiQL(request)) {
    expressResult.send(renderGraphiQL())
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

    sendResult(result, expressResult)
  }
})

const port = process.env.PORT || 4000

app.listen(port, () => {
  console.log(`GraphQL server is running on port ${port}.`)
})
