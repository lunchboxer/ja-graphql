const { auth } = require('./auth')
const { school } = require('./school')
const { schoolYear } = require('./schoolYear')

module.exports.Mutation = {
  ...auth,
  ...school,
  ...schoolYear,
}
