// const { hash, compare } = require('bcrypt')
const { scryptSync, randomBytes } = require('node:crypto')
const { sign } = require('jsonwebtoken')
const { isValidEmail } = require('../../utils')

const encryptPassword = (password, salt) => {
  return scryptSync(password, salt, 32).toString('hex')
}
const hashPassword = password => {
  const salt = randomBytes(16).toString('hex')
  return encryptPassword(password, salt) + salt
}
const passwordMatches = (password, hash) => {
  const salt = hash.slice(64)
  const originalPassHash = hash.slice(0, 64)
  const currentPassHash = encryptPassword(password, salt)
  return originalPassHash === currentPassHash
}

module.exports.auth = {
  createUser: async (_, parameters, context) => {
    if (parameters.email && !isValidEmail(parameters.email)) {
      throw new Error('email address not valid')
    }
    // const hashedPassword = await hash(parameters.password, 10)
    const hashedPassword = hashPassword(parameters.password)
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
    if (!passwordMatches(password, user.password)) {
      throw new Error('Invalid password')
    }
    return {
      token: sign({ userId: user.id }, process.env.JWT_SECRET),
      user,
    }
  },
}
