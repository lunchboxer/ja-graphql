module.exports.Group = {
  students({ id }, _, context) {
    return context.prisma.group.findUnique({ where: { id } }).students()
  },

  teachers({ id }, _, context) {
    return context.prisma.group.findUnique({ where: { id } }).teachers()
  },

  schoolyear({ id }, _, context) {
    return context.prisma.group.findUnique({ where: { id } }).schoolYear()
  },
}
