const { Mutation } = require('./Mutation')
const { Query } = require('./Query')
const { User } = require('./User')
const { SchoolYear } = require('./SchoolYear')
const { Group } = require('./Group')
const { Student } = require('./Student')
const { Guardian } = require('./Guardian')

module.exports.resolvers = {
  Query,
  Mutation,
  User,
  SchoolYear,
  Student,
  Group,
  Guardian,
}
