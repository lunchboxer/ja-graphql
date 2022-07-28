const { rule, shield, or } = require('graphql-shield')
const { getUserId } = require('./utils')

// Rules

const isAuthenticatedUser = rule()((root, parameters, context) => {
  const userId = getUserId(context)
  return Boolean(userId)
})
const isAdmin = rule()((root, parameters, context) => {
  const userId = getUserId(context)
  return context.prisma.$exists.user({ id: userId, role: 'admin' })
})
const isThisUser = rule()((root, parameters, context) => {
  const userId = getUserId(context)
  return userId === context.id
})
const noUsersExist = rule()(async (root, parameters, context) => {
  const users = await context.prisma.$exists.user()
  return !users
})

// Permissions

module.exports.permissions = shield(
  {
    Query: {
      me: isAuthenticatedUser,
    },
    Mutation: {
      createUser: or(isAdmin, noUsersExist),
      // deleteUser: isAdmin,
      // updateUser: or(isThisUser, isAdmin),
      // changePassword: or(isThisUser, isAdmin),
      // createStudent: isAuthenticatedUser,
      // updateStudent: isAuthenticatedUser,
      // deleteStudent: isAuthenticatedUser,
    },
    User: {
      //  role: isAdmin,
    },
  },
  {
    allowExternalErrors: true,
  },
)
