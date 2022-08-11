import { createVerifier } from 'fast-jwt'

const verify = createVerifier({ key: process.env.JWT_SECRET })

export async function getUser(request, prisma) {
  // get token from headers
  const authorization =
    request.headers.authorization || request.headers.Authorization
  if (!authorization) return
  const token = authorization.replace('Bearer ', '')
  // see if the token is legit
  if (!token) return
  try {
    const verifiedToken = verify(token)
    const userId = verifiedToken && verifiedToken.userId
    if (!userId) return
    // get the authenticated user from the db
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          select: {
            name: true,
          },
        },
      },
    })
    user.roles = user.roles.map(role => role.name)
    return user
  } catch (error) {
    console.error(error)
  }
}

export function isValidEmail(email) {
  // Real validation sends a verification email. Just do a basic format check
  const mailFormatRegex = /^\S+@\S+\.\S+$/
  return email.match(mailFormatRegex)
}
