import { auth } from './auth.js'
import { school } from './school.js'
import { schoolYear } from './schoolYear.js'
import { student } from './student.js'
import { role } from './role.js'
import { guardian } from './guardian.js'

export const Mutation = {
  ...auth,
  ...school,
  ...schoolYear,
  ...student,
  ...role,
  ...guardian,
}
