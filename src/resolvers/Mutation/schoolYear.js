const { checkOrder, checkConflicts } = require('../validation')

module.exports.schoolYear = {
  createSchoolYear: async (_, { name, startDate, endDate }, context) => {
    await checkOrder(startDate, endDate, _, context)
    await checkConflicts(startDate, endDate, _, context)
    return context.prisma.schoolYear.create({
      data: { name, startDate, endDate },
    })
  },
  updateSchoolYear: async (_, parameters, context) => {
    await checkOrder(
      parameters.startDate,
      parameters.endDate,
      parameters.id,
      context,
    )
    await checkConflicts(
      parameters.startDate,
      parameters.endDate,
      parameters.id,
      context,
    )
    const { id, ...data } = parameters
    // check that no conflicts exist
    // check that dates are not in reverse order
    return context.prisma.schoolYear.update({
      where: {
        id,
      },
      data,
    })
  },
  deleteSchoolYear: async (_, { id }, context) => {
    return await context.prisma.schoolYear.delete({ where: { id } })
  },
}
