module.exports.group = {
  createGroup: async (_, parameters, context) => {
    return context.prisma.group.create({
      data: parameters,
    })
  },
}
