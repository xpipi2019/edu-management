from fastapi import APIRouter

from app.api.api_v1.endpoints import (
    auth, users, roles, permissions, departments, 
    teachers, students, courses, course_offerings,
    classrooms, schedules, student_status, reward_punishment,
    statistics
)

api_router = APIRouter()

# 认证相关
api_router.include_router(auth.router, prefix="/auth", tags=["认证"])

# 用户管理
api_router.include_router(users.router, prefix="/users", tags=["用户管理"])

# 角色管理
api_router.include_router(roles.router, prefix="/roles", tags=["角色管理"])

# 权限管理
api_router.include_router(permissions.router, prefix="/permissions", tags=["权限管理"])

# 部门管理
api_router.include_router(departments.router, prefix="/departments", tags=["部门管理"])

# 教师管理
api_router.include_router(teachers.router, prefix="/teachers", tags=["教师管理"])

# 学生管理
api_router.include_router(students.router, prefix="/students", tags=["学生管理"])

# 课程管理
api_router.include_router(courses.router, prefix="/courses", tags=["课程管理"])

# 开课管理
api_router.include_router(course_offerings.router, prefix="/course-offerings", tags=["开课管理"])

# 教室管理
api_router.include_router(classrooms.router, prefix="/classrooms", tags=["教室管理"])

# 排课管理
api_router.include_router(schedules.router, prefix="/schedules", tags=["排课管理"])

# 学籍管理
api_router.include_router(student_status.router, prefix="/student-status", tags=["学籍管理"])

# 奖惩管理
api_router.include_router(reward_punishment.router, prefix="/reward-punishments", tags=["奖惩管理"]) 

# 统计数据
api_router.include_router(statistics.router, prefix="/statistics", tags=["统计数据"]) 