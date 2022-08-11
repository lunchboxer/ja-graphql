export const Role = {
  users: (root, _, context) => {
    return context.prisma.role
      .findUnique({
        where: { id: root.id },
      })
      .users()
  },
}
