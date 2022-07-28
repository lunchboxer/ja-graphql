module.exports.school = {
  updateSchool: async (_, parameters, context) => {
    // if the school record exists, patch it
    // if the school record doesn't exist, create it.
    const upsertSchool = await context.prisma.school.upsert({
      where: {
        id: 1,
      },
      update: { ...parameters },
      create: { ...parameters },
    })
    return upsertSchool
  },
}
