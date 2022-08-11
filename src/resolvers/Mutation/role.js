export const role = {
  createRole: (_, { name }, { prisma }) =>
    prisma.role.create({ data: { name } }),

  renameRole: (_, { id, name }, { prisma }) =>
    prisma.role.update({
      where: { id },
      data: { name },
    }),

  deleteRole: (_, { id }, { prisma }) => prisma.role.delete({ where: { id } }),
}
