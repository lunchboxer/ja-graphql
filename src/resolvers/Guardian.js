export const Guardian = {
  students({ id }, _, context) {
    return context.prisma.guardian.findUnique({ where: { id } }).students()
  },
}
