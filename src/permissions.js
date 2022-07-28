const { rule, shield, or } = require('graphql-shield')
const { getUserId } = require('./utils')

// Rules

const isAuthenticatedUser = rule()((root, parameters, context) => {
  const userId = getUserId(context)
  return Boolean(userId)
})
// this needs to be tested
const isAdmin = rule()(async (root, parameters, context) => {
  const userId = getUserId(context)
  const adminUser = await context.prisma.user.findUnique({
    where: { id: userId, role: 'admin' },
  })
  return !!adminUser
})
const isThisUser = rule()((root, parameters, context) => {
  const userId = getUserId(context)
  return userId === context.id
})
const noUsersExist = rule()(async (root, parameters, context) => {
  const users = await context.prisma.user.findFirst()
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
