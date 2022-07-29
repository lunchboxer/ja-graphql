export const Group = {
  students({ id }, _, context) {
    return context.prisma.group.findUnique({ where: { id } }).students()
  },

  teachers({ id }, _, context) {
    return context.prisma.group.findUnique({ where: { id } }).teachers()
  },

  schoolYear({ id }, _, context) {
    return context.prisma.group.findUnique({ where: { id } }).schoolYear()
  },
}
