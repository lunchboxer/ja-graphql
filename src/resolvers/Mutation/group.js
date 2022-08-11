export const group = {
  createGroup: (_, { name, grade, schoolYearId }, { prisma }) =>
    prisma.group.create({
      data: { name, grade },
      schoolYear: {
        connect: { id: schoolYearId },
      },
    }),

  updateGroup: (_, { input }, { prisma }) => {
    const { id, ...data } = input
    prisma.group.update({ where: { id }, data })
  },

  deleteGroup: (_, { id }, { prisma }) =>
    prisma.group.delete({ where: { id } }),
}
