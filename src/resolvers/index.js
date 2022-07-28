const { Mutation } = require('./Mutation')
const { Query } = require('./Query')
const { User } = require('./User')
const { SchoolYear } = require('./SchoolYear')

module.exports.resolvers = {
  Query,
  Mutation,
  User,
  SchoolYear,
}
