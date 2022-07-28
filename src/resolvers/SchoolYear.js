module.exports.SchoolYear = {
  groups(root, _, context) {
    return context.prisma.schoolYear
      .findUnique({
        where: { id: root.id },
      })
      .groups()
  },
}
