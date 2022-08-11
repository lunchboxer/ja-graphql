import { pinyin } from 'pinyin-pro'

export async function disconnectOtherGroupsThisSchoolYear(
  studentId,
  newGroupId,
  database,
) {
  // check which groups student is already in, ignoring the new one if already in
  const existingGroups = await database.student.findUnique({
    where: { id: studentId },
    select: {
      groups: {
        where: {
          id: {
            not: newGroupId,
          },
        },
        select: {
          name: true,
          id: true,
          schoolYearId: true,
        },
      },
    },
  })
  if (existingGroups.groups.length === 0) return
  // put the results in a form that can be used to disconnec from old groups
  const idObjectsArray = existingGroups.groups.map(g => ({ id: g.id }))
  await database.student.update({
    where: { id: studentId },
    data: {
      groups: {
        disconnect: idObjectsArray,
      },
    },
  })
}

export const student = {
  createStudent: async (_, { input }, context) => {
    const { groupId, ...parameters } = input
    return context.prisma.student.create({
      data: { ...parameters },
      groups: {
        connect: { id: groupId },
      },
    })
  },

  updateStudent: async (_, { input }, context) => {
    const { groupId, id, ...parameters } = input
    if (parameters.chineseName && !parameters.pinyinName) {
      const pinyinString = pinyin(parameters.chineseName, { mode: 'surname' })
      parameters.pinyinName =
        pinyinString.charAt(0).toUpperCase() + pinyinString.slice(1)
    }
    await disconnectOtherGroupsThisSchoolYear(id, groupId, context.prisma)
    return context.prisma.student.update({
      where: { id },
      data: {
        ...parameters,
        groups: {
          connect: { id: groupId },
        },
      },
    })
  },

  deleteStudent: async (_, { id }, context) => {
    return context.prisma.student.delete({ where: { id } })
  },
}
