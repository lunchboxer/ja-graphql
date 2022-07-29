import jwt from 'jsonwebtoken'

export async function getUser(request, prisma) {
  // get token from hearders
  const authorization =
    request.headers.authorization || request.headers.Authorization
  if (!authorization) return
  const token = authorization.replace('Bearer ', '')
  // see if the token is legit
  const verifiedToken = jwt.verify(token, process.env.JWT_SECRET)
  const userId = verifiedToken && verifiedToken.userId
  if (!userId) return
  // get the authenticated user from the db
  const user = await prisma.user.findUnique({ where: { id: userId } })
  return user
}

export function isValidEmail(email) {
  // Real validation sends a verification email. Just do a basic format check
  const mailFormatRegex = /^\S+@\S+\.\S+$/
  return email.match(mailFormatRegex)
}
