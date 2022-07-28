const { PrismaClient } = require('@prisma/client')
const { PubSub } = require('graphql-subscriptions')

const prisma = new PrismaClient()
const pubsub = new PubSub()

function createContext(request) {
  return {
    ...request,
    prisma,
    pubsub,
  }
}

module.exports = {
  createContext,
}
