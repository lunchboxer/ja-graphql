require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const fs = require('node:fs')
const path = require('node:path')
const { resolvers } = require('./resolvers')

const prisma = new PrismaClient()

const typeDefs = fs
  .readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8')
  .toString()

const schema = makeExecutableSchema({ typeDefs, resolvers })

const port = process.env.PORT || 4000

const server = new WebSocketServer({
  port,
  path: '/graphql',
})

useServer(
  {
    schema,
    context: (ctx, msg, args) => {
      return { ...ctx, prisma }
    },
  },
  server,
)

console.log(`listening on port ${port}`)
