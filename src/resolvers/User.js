module.exports.User = {
  groups(root, _, context) {
    return context.prisma.user
      .findUnique({
        where: { id: root.id },
      })
      .groups()
  },
}
