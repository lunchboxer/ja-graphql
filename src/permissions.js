import { shield, rule, or } from 'graphql-shield'

const noUsersExist = rule()(async (root, parameters, context) => {
  const users = await context.prisma.user.findFirst()
  return !users
})
const isAuthenticated = rule()(async (root, parameters, context) => {
  return !!context.user
})
const isAdmin = rule()(async (root, parameters, context) => {
  return context.user?.role === 'admin'
})
// const isThisUser = rule()(async (root, parameters, context) => {
//   return context.user?.id === parameters.id
// })

export const permissions = shield(
  {
    Query: {
      me: isAuthenticated,
    },
    Mutation: {
      createUser: or(isAdmin, noUsersExist),
      //     deleteUser: isAdmin,
      //     updateUser: or(isThisUser, isAdmin),
      //     changePassword: or(isThisUser, isAdmin),
      //     createStudent: isAuthenticated,
      //     updateStudent: isAuthenticated,
      //     deleteStudent: isAuthenticated,
    },
    // User: {
    //   role: isAdmin,
    // },
  },
  {
    Allowexternalerrors: true,
  },
)
