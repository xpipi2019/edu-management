import type { MockMethod } from 'vite-plugin-mock'
import auth from './auth'
import user from './user'
import course from './course'
import enrollment from './enrollment'
import grade from './grade'
import role from './role'
import permission from './permission'
import schedule from './schedule'
import classroom from './classroom'
import department from './department'
import studentStatus from './student-status'
import rewardPunishment from './reward-punishment'

export default [
  ...auth,
  ...user,
  ...course,
  ...enrollment,
  ...grade,
  ...role,
  ...permission,
  ...schedule,
  ...classroom,
  ...department,
  ...studentStatus,
  ...rewardPunishment
] as MockMethod[]
