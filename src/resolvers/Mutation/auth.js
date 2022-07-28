const { hash, compare } = require('bcrypt')
const { sign } = require('jsonwebtoken')
const { isValidEmail } = require('../../utils')

module.exports.auth = {
  createUser: async (_, parameters, context) => {
    if (parameters.email && !isValidEmail(parameters.email)) {
      throw new Error('email address not valid')
    }
    const hashedPassword = await hash(parameters.password, 10)
    const user = await context.prisma.user.create({
      data: { ...parameters, password: hashedPassword },
    })
    return {
      token: sign({ userId: user.id }, process.env.JWT_SECRET),
      user,
    }
  },

  login: async (_, { username, password }, context) => {
    const user = await context.prisma.user.findUnique({
      where: {
        username,
      },
    })
    if (!user) {
      throw new Error(`No user found for username: ${username}`)
    }
    const passwordValid = await compare(password, user.password)
    if (!passwordValid) {
      throw new Error('Invalid password')
    }
    return {
      token: sign({ userId: user.id }, process.env.JWT_SECRET),
      user,
    }
  },
}
