module.exports.Guardian = {
  students({ id }, _, context) {
    return context.prisma.guardian.findUnique({ where: { id } }).students()
  },
}
