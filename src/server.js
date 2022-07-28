const { createServer } = require('node:http')
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core')
const { WebSocketServer } = require('ws')
const { ApolloServer } = require('apollo-server-express')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const express = require('express')
const { useServer } = require('graphql-ws/lib/use/ws')
const fs = require('node:fs')
const path = require('node:path')
const { resolvers } = require('./resolvers')
const { createContext } = require('./context')
const { applyMiddleware } = require('graphql-middleware')
const { permissions } = require('./permissions')

const typeDefs = fs
  .readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8')
  .toString()

const schema = makeExecutableSchema({ typeDefs, resolvers })

const PORT = process.env.PORT || 4000

const app = express()
const httpServer = createServer(app)

async function start() {
  /** Create WS Server */
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  })

  /** hand-in created schema and have the WS Server start listening */
  const serverCleanup = useServer(
    {
      schema,
      context: createContext,
    },
    wsServer,
  )

  const server = new ApolloServer({
    schema: applyMiddleware(schema, permissions),
    // schema,
    context: createContext,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
  })

  await server.start()
  server.applyMiddleware({ app })

  httpServer.listen(PORT, () => {
    console.log('🚀 Server ready at http://localhost:4000/graphql')
    console.log('⏰ Subscriptions ready at http://localhost:4000/graphql')
  })
}

start()
