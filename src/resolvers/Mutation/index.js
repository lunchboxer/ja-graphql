import { auth } from './auth.js'
import { school } from './school.js'
import { schoolYear } from './schoolYear.js'

export const Mutation = {
  ...auth,
  ...school,
  ...schoolYear,
}
