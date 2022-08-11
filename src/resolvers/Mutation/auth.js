import { scryptSync, randomBytes } from 'node:crypto'
import { createSigner } from 'fast-jwt'
import { isValidEmail } from '../../utils.js'

const sign = createSigner({ key: process.env.JWT_SECRET })

function encryptPassword(password, salt) {
  return scryptSync(password, salt, 32).toString('hex')
}
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  return encryptPassword(password, salt) + salt
}

function passwordMatches(password, hash) {
  const salt = hash.slice(64)
  const originalPassHash = hash.slice(0, 64)
  const currentPassHash = encryptPassword(password, salt)
  return originalPassHash === currentPassHash
}

export const auth = {
  createInitialAdmin: async (_, { input }, context) => {
    if (input.email && !isValidEmail(input.email)) {
      throw new Error('email address not valid')
    }
    const hashedPassword = hashPassword(input.password)
    const usernameTaken = await context.prisma.user.findFirst({
      where: { username: input.username },
    })
    if (usernameTaken) throw new Error('Username already exists')

    const user = await context.prisma.user.create({
      data: { ...input, password: hashedPassword },
      roles: {
        connectOrCreate: {
          where: {
            name: 'admin',
          },
          create: {
            name: 'admin',
          },
        },
      },
    })
    return {
      token: sign({ userId: user.id }),
      user,
    }
  },

  createUser: async (_, { input }, context) => {
    const { role, password, ...parameters } = input
    if (parameters.email && !isValidEmail(parameters.email)) {
      throw new Error('email address not valid')
    }
    const hashedPassword = hashPassword(parameters.password)
    const usernameTaken = await context.prisma.user.findFirst({
      where: { username: parameters.username },
    })
    if (usernameTaken) throw new Error('Username already exists')

    return context.prisma.user.create({
      data: { ...parameters, password: hashedPassword },
      roles: {
        connectOrCreate: {
          where: {
            name: role,
          },
          create: {
            name: role,
          },
        },
      },
    })
  },

  updateUser: async (_, { input }, { prisma }) => {
    const { id, role, ...data } = input
    return prisma.user.update({
      where: { id },
      data,
      roles: {
        connectOrCreate: {
          where: {
            name: role,
          },
          create: {
            name: role,
          },
        },
      },
    })
  },

  changePassword: async (_, { id, newPassword, oldPassword }, context) => {
    const user = await context.prisma.user.findUnique({ where: { id } })
    if (!passwordMatches(oldPassword, user.password)) {
      throw new Error('Invalid password')
    }
    const hashedPassword = hashPassword(newPassword)
    return context.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    })
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
      token: sign({ userId: user.id }),
      user,
    }
  },

  deleteUser: (_, { id }, { prisma }) => prisma.user.delete({ where: id }),

  assignRole: (_, { userId, role }, { prisma }) =>
    prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          connectOrCreate: {
            create: { name: role },
            where: { name: role },
          },
        },
      },
    }),

  unassignRole: (_, { userId, role }, { prisma }) =>
    prisma.user.update({
      where: { id: userId },
      data: {
        roles: { disconnect: { name: role } },
      },
    }),
}
