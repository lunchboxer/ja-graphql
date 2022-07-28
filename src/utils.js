const { verify } = require('jsonwebtoken')

const getUserId = context => {
  const Authorization = context.req.get('authorization')
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')
    const verifiedToken = verify(token, process.env.JWT_SECRET)
    return verifiedToken && verifiedToken.userId
  }
}

const isValidEmail = email => {
  // A technically accurate regex for email validation would be incredibly long.
  // Instead we just want to check if the string is probably an email address to
  // catch a few common typing errors. Real validation uses verification emails.
  const mailFormatRegex = /^\S+@\S+\.\S+$/
  return email.match(mailFormatRegex)
}

module.exports = {
  getUserId,
  isValidEmail,
}
