import { checkOrder, checkConflicts } from '../validation.js'

export const schoolYear = {
  createSchoolYear: async (_, { input }, context) => {
    const { name, startDate, endDate } = input
    await checkOrder(startDate, endDate, _, context)
    await checkConflicts(startDate, endDate, _, context)
    return context.prisma.schoolYear.create({
      data: { name, startDate, endDate },
    })
  },
  updateSchoolYear: async (_, { input }, context) => {
    const { id, startDate, endDate } = input
    await checkOrder(startDate, endDate, id, context)
    await checkConflicts(startDate, endDate, id, context)
    return context.prisma.schoolYear.update({
      where: {
        id,
      },
      data: { startDate, endDate },
    })
  },
  deleteSchoolYear: async (_, { id }, context) => {
    return await context.prisma.schoolYear.delete({ where: { id } })
  },
}
