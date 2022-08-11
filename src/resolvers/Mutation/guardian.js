export const guardian = {
  connectGuardian: (_, { guardianId, studentId }, { prisma }) => {
    return prisma.guardian.update({
      where: { id: guardianId },
      data: {
        students: {
          connect: { id: studentId },
        },
      },
    })
  },

  disconnectGuardian: (_, { guardianId, studentId }, { prisma }) => {
    return prisma.guardian.update({
      where: { id: guardianId },
      data: {
        students: {
          disconnect: { id: studentId },
        },
      },
    })
  },

  createGuardian: (_, { input }, { prisma }) => {
    const { studentId, ...parameters } = input
    return prisma.guardian.create({
      data: {
        ...parameters,
        students: {
          connect: { id: studentId },
        },
      },
    })
  },

  editGuardian: (_, { input }, { prisma }) => {
    const { id, ...data } = input
    return prisma.guardian.update({
      where: { id },
      data,
    })
  },

  deleteGuardian: (_, { id }, { prisma }) =>
    prisma.guardian.delete({ where: { id } }),
}
