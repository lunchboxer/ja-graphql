import { Mutation } from './Mutation/index.js'
import { Query } from './Query.js'
import { User } from './User.js'
import { SchoolYear } from './SchoolYear.js'
import { Group } from './Group.js'
import { Student } from './Student.js'
import { Guardian } from './Guardian.js'
import { Role } from './Role.js'

export const resolvers = {
  Query,
  Mutation,
  User,
  SchoolYear,
  Student,
  Group,
  Guardian,
  Role,
}
