const { getUserId } = require('../utils')

module.exports.Query = {
  me: async (_, parameters, context) => {
    const id = getUserId(context)
    const user = await context.prisma.user.findUnique({
      where: {
        id,
      },
    })
    if (!user) throw new Error("Requested authenticated user doesn't exists.")
    return user
  },

  user: async (_, { id }, context) => {
    return context.prisma.user.findUnique({
      where: {
        id,
      },
    })
  },

  users: async (_, parameters, context) => {
    return context.prisma.user.findMany()
  },

  school: async (_, parameters, context) => {
    // Only one record is supported
    return context.prisma.school.findUnique({ where: { id: 1 } })
  },

  schoolYear: async (_, { id }, context) => {
    return context.prisma.schoolYear.findUnique({ where: { id } })
  },

  schoolYears: async (_, parameters, context) => {
    return context.prisma.schoolYear.findMany({
      // we're most likely to be using the latest one most
      orderBy: { startDate: 'desc' },
    })
  },
}
