export const Guardian = {
  students: ({ id }, _, { prisma }) =>
    prisma.guardian.findUnique({ where: { id } }).students(),
}
