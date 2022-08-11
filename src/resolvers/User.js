export const User = {
  groups: (root, _, context) => {
    return context.prisma.user
      .findUnique({
        where: { id: root.id },
      })
      .groups()
  },
  roles: async (root, _, context) => {
    const wholeRoles = await context.prisma.user
      .findUnique({
        where: { id: root.id },
      })
      .roles()
    return wholeRoles?.map(role => role.name)
  },
  studentId: async (root, _, context) => {
    const student = await context.prisma.user
      .findUnique({
        where: { id: root.id },
      })
      .student()
    return student?.id
  },
}
