import { Permission } from './permission'

export interface MenuItem {
  title: string
  icon?: string
  path?: string
  permission?: Permission | Permission[]
  children?: MenuItem[]
  hidden?: boolean
}

// 侧边栏菜单配置
export const SIDEBAR_MENU: MenuItem[] = [
  {
    title: '仪表盘',
    icon: 'House',
    path: '/dashboard'
  },
  {
    title: '系统管理',
    icon: 'Setting',
    permission: [Permission.USER_MANAGE, Permission.ROLE_MANAGE, Permission.DEPARTMENT_MANAGE, Permission.TEACHER_MANAGE, Permission.STUDENT_MANAGE],
    children: [
      {
        title: '用户管理',
        icon: 'User',
        path: '/admin/users',
        permission: Permission.USER_MANAGE
      },
      {
        title: '角色管理',
        icon: 'UserFilled',
        path: '/admin/roles',
        permission: Permission.ROLE_MANAGE
      },
      {
        title: '部门管理',
        icon: 'OfficeBuilding',
        path: '/admin/departments',
        permission: Permission.DEPARTMENT_MANAGE
      },
      {
        title: '教师管理',
        icon: 'Avatar',
        path: '/admin/teachers',
        permission: Permission.TEACHER_MANAGE
      },
      {
        title: '学生管理',
        icon: 'School',
        path: '/admin/students',
        permission: Permission.STUDENT_MANAGE
      }
    ]
  },
  {
    title: '课程管理',
    icon: 'Reading',
    permission: [Permission.COURSE_MANAGE, Permission.COURSE_OFFERING_MANAGE],
    children: [
      {
        title: '课程信息',
        icon: 'Document',
        path: '/academic/courses',
        permission: Permission.COURSE_MANAGE
      },
      {
        title: '开课管理',
        icon: 'Postcard',
        path: '/academic/course-offerings',
        permission: Permission.COURSE_OFFERING_MANAGE
      }
    ]
  },
  {
    title: '教学管理',
    icon: 'Calendar',
    permission: [Permission.SCHEDULE_MANAGE, Permission.CLASSROOM_MANAGE, Permission.GRADE_MANAGE],
    children: [
      {
        title: '排课管理',
        icon: 'Calendar',
        path: '/academic/schedules',
        permission: Permission.SCHEDULE_MANAGE
      },
      {
        title: '教室管理',
        icon: 'OfficeBuilding',
        path: '/academic/classrooms',
        permission: Permission.CLASSROOM_MANAGE
      },
      {
        title: '成绩管理',
        icon: 'EditPen',
        path: '/teacher/grades',
        permission: Permission.GRADE_MANAGE
      }
    ]
  },
  {
    title: '学生管理',
    icon: 'School',
    permission: [Permission.STUDENT_STATUS_MANAGE, Permission.REWARD_PUNISHMENT_MANAGE],
    children: [
      {
        title: '学籍管理',
        icon: 'School',
        path: '/academic/student-status',
        permission: Permission.STUDENT_STATUS_MANAGE
      },
      {
        title: '奖惩管理',
        icon: 'Trophy',
        path: '/academic/reward-punishment',
        permission: Permission.REWARD_PUNISHMENT_MANAGE
      }
    ]
  },
  {
    title: '我的课程',
    icon: 'Document',
    path: '/teacher/my-courses',
    permission: Permission.MY_COURSES_VIEW
  },
  {
    title: '选课中心',
    icon: 'Plus',
    path: '/student/courses',
    permission: Permission.MY_ENROLLMENT_VIEW
  },
  {
    title: '成绩查询',
    icon: 'View',
    path: '/student/grades',
    permission: Permission.MY_GRADE_VIEW
  },
  {
    title: '个人信息',
    icon: 'UserFilled',
    path: '/profile'
  }
]
