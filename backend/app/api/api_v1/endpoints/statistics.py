from typing import Any
import traceback

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api import deps
from app.db.database import get_db
from app.models.user import User
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.course import Course, CourseOffering
from app.models.enrollment import Enrollment
from app.schemas.common import APIResponse

router = APIRouter()


@router.get("/overview", response_model=APIResponse)
def get_system_overview(
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["USER_VIEW"])),
) -> Any:
    """
    获取系统概览统计数据
    """
    try:
        # 活跃用户数
        active_users = db.query(func.count(User.user_id)).filter(User.status == 1).scalar() or 0
        
        # 学生总数
        total_students = db.query(func.count(Student.student_id)).scalar() or 0
        
        # 活跃教师数
        active_teachers = db.query(func.count(Teacher.teacher_id)).filter(Teacher.status == 1).scalar() or 0
        
        # 活跃课程数
        active_courses = db.query(func.count(Course.course_id)).filter(Course.status == 1).scalar() or 0
        
        # 当前开课数
        current_offerings = db.query(func.count(CourseOffering.offering_id)).filter(CourseOffering.status == 1).scalar() or 0
        
        # 总选课数
        total_enrollments = db.query(func.count(Enrollment.enrollment_id)).scalar() or 0
        
        # 构建响应数据
        stats = {
            "activeUsers": active_users,
            "totalStudents": total_students,
            "activeTeachers": active_teachers,
            "activeCourses": active_courses,
            "currentOfferings": current_offerings,
            "totalEnrollments": total_enrollments
        }
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=stats
        )
    except Exception as e:
        error_msg = f"获取系统概览统计数据失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return APIResponse(
            code=500,
            message=f"获取系统概览统计数据失败: {str(e)}",
            data=None
        )


@router.get("/dashboard", response_model=APIResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    获取仪表盘统计数据，根据用户角色返回不同的数据
    """
    try:
        # 检查当前用户的角色，返回适合的数据
        is_admin = False
        is_teacher = False
        is_student = False
        
        for role in current_user.roles:
            if not role.status:
                continue
            if role.role_code == "SUPER_ADMIN" or role.role_code == "ACADEMIC_ADMIN":
                is_admin = True
            elif role.role_code == "TEACHER":
                is_teacher = True
            elif role.role_code == "STUDENT":
                is_student = True
        
        stats = {}
        
        if is_admin:
            # 与overview接口相同的数据
            active_users = db.query(func.count(User.user_id)).filter(User.status == 1).scalar() or 0
            total_students = db.query(func.count(Student.student_id)).scalar() or 0
            active_teachers = db.query(func.count(Teacher.teacher_id)).filter(Teacher.status == 1).scalar() or 0
            active_courses = db.query(func.count(Course.course_id)).filter(Course.status == 1).scalar() or 0
            
            stats = {
                "activeUsers": active_users,
                "totalStudents": total_students,
                "activeTeachers": active_teachers,
                "activeCourses": active_courses
            }
        elif is_teacher:
            # 查询该教师的教授课程数、学生数等
            teacher = db.query(Teacher).filter(Teacher.user_id == current_user.user_id).first()
            if teacher:
                course_count = db.query(func.count(CourseOffering.offering_id)).filter(
                    CourseOffering.teacher_id == teacher.teacher_id,
                    CourseOffering.status == 1
                ).scalar() or 0
                
                # 查询该教师课程的选课学生数
                student_count = db.query(func.count(Enrollment.enrollment_id)).join(
                    CourseOffering, Enrollment.offering_id == CourseOffering.offering_id
                ).filter(
                    CourseOffering.teacher_id == teacher.teacher_id,
                    Enrollment.status == 1
                ).scalar() or 0
                
                stats = {
                    "myCourseCount": course_count,
                    "myStudentCount": student_count
                }
        elif is_student:
            # 查询该学生的选课数、已修学分等
            student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
            if student:
                course_count = db.query(func.count(Enrollment.enrollment_id)).filter(
                    Enrollment.student_id == student.student_id,
                    Enrollment.status == 1
                ).scalar() or 0
                
                # 计算总学分
                completed_credits = 0  # 这里需要根据实际数据模型计算已修学分
                
                stats = {
                    "myCourseCount": course_count,
                    "myCredits": completed_credits
                }
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=stats
        )
    except Exception as e:
        error_msg = f"获取仪表盘统计数据失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return APIResponse(
            code=500,
            message=f"获取仪表盘统计数据失败: {str(e)}",
            data=None
        ) 