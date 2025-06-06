from typing import Any, List
import traceback

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from app.api import deps
from app.db.database import get_db
from app.models.course import Course, CourseOffering, Schedule
from app.models.teacher import Teacher
from app.models.enrollment import Enrollment
from app.models.student import Student
from app.schemas.common import APIResponse, PaginatedResponse
from app.schemas.course import (
    CourseOfferingCreate, CourseOfferingDetail, CourseOfferingInfo,
    CourseOfferingResponse, CourseOfferingUpdate
)

# 定义状态枚举
class OfferingStatus:
    INACTIVE = 0
    ACTIVE = 1

router = APIRouter()


@router.get("", response_model=APIResponse)
def list_course_offerings(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100, alias="page_size"),
    course_id: int = None,
    teacher_id: int = None,
    semester: str = None,
    status: bool = None,
    _: Any = Depends(deps.check_permissions(["COURSE_OFFERING_VIEW"])),
) -> Any:
    """
    获取开课列表
    """
    try:
        # 创建一个包含关联对象的查询
        query = db.query(CourseOffering).options(
            joinedload(CourseOffering.course),
            joinedload(CourseOffering.teacher).joinedload(Teacher.user)
        )
        
        # 应用过滤条件
        if course_id:
            query = query.filter(CourseOffering.course_id == course_id)
        if teacher_id:
            query = query.filter(CourseOffering.teacher_id == teacher_id)
        if semester:
            query = query.filter(CourseOffering.semester == semester)
        if status is not None:
            query = query.filter(CourseOffering.status == status)
        
        # 计算总数
        total = query.count()
        
        # 分页
        offerings = query.offset((page - 1) * pageSize).limit(pageSize).all()
        
        # 构建响应
        offering_list = []
        for offering in offerings:
            # 获取已选课程人数
            enrolled_count = db.query(Enrollment).filter(
                Enrollment.offering_id == offering.offering_id,
                Enrollment.status == True
            ).count()
            
            # 获取排课信息
            schedules_query = db.query(Schedule).filter(Schedule.offering_id == offering.offering_id).all()
            schedules = []
            for schedule in schedules_query:
                classroom_info = ""
                if hasattr(schedule, 'classroom') and schedule.classroom:
                    classroom_info = f"{schedule.classroom.building}-{schedule.classroom.room_no}"
                
                schedule_data = {
                    "id": schedule.schedule_id,
                    "day_of_week": schedule.day_of_week,
                    "start_time": schedule.start_time,
                    "end_time": schedule.end_time,
                    "weeks": schedule.weeks
                }
                schedules.append(schedule_data)
            
            # 状态映射
            status_map = {
                True: OfferingStatus.ACTIVE,
                False: OfferingStatus.INACTIVE
            }
            
            # 从学期中解析学年
            academic_year = ""
            if offering.semester:
                parts = offering.semester.split('-')
                if len(parts) > 1:
                    academic_year = parts[0]

            offering_data = {
                "offering_id": offering.offering_id,
                "course_id": offering.course_id,
                "course": {
                    "id": offering.course.course_id if offering.course else 0,
                    "course_code": offering.course.course_code if offering.course else "",
                    "course_name": offering.course.course_name if offering.course else ""
                },
                "teacher_id": offering.teacher_id,
                "teacher": {
                    "id": offering.teacher_id if offering.teacher else 0,
                    "user": {
                        "real_name": offering.teacher.user.real_name if offering.teacher and offering.teacher.user else ""
                    }
                },
                "semester": offering.semester,
                "academic_year": academic_year,
                "max_students": offering.max_students,
                "current_students": enrolled_count,
                "status": status_map.get(offering.status, 0),
                "schedules": schedules,
                "createdAt": offering.created_at.isoformat() if hasattr(offering, 'created_at') and offering.created_at else None
            }
            offering_list.append(offering_data)
            
        # 构建前端期望的响应格式
        response_data = {
            "list": offering_list,
            "total": total,
            "page": page,
            "pageSize": pageSize,
            "totalPages": (total + pageSize - 1) // pageSize
        }
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=response_data
        )
    except Exception as e:
        error_msg = f"获取开课列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取开课列表失败: {str(e)}")


@router.post("", response_model=APIResponse)
def create_course_offering(
    offering_data: dict,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["COURSE_OFFERING_MANAGE"])),
) -> Any:
    """
    创建新开课
    """
    try:
        # 检查必要参数
        required_fields = ["course_id", "teacher_id", "semester", "max_students"]
        for field in required_fields:
            if field not in offering_data or offering_data[field] is None:
                raise HTTPException(status_code=400, detail=f"缺少参数: {field}")
        
        # 验证课程信息
        course = db.query(Course).filter(
            Course.course_id == offering_data["course_id"]
        ).first()
        if not course:
            raise HTTPException(status_code=404, detail="课程不存在")
        
        # 验证教师信息
        teacher = db.query(Teacher).options(
            joinedload(Teacher.user)
        ).filter(
            Teacher.teacher_id == offering_data["teacher_id"]
        ).first()
        if not teacher:
            raise HTTPException(status_code=404, detail="教师不存在")
        
        # 检查是否已存在相同开课记录
        existing = db.query(CourseOffering).filter(
            CourseOffering.course_id == offering_data["course_id"],
            CourseOffering.teacher_id == offering_data["teacher_id"],
            CourseOffering.semester == offering_data["semester"]
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="该课程在本学期已由该教师开课")
        
        # 创建新开课
        new_offering = CourseOffering(
            course_id=offering_data["course_id"],
            teacher_id=offering_data["teacher_id"],
            semester=offering_data["semester"],
            max_students=offering_data["max_students"],
            current_students=0,  # 初始选课人数为0
            status=offering_data.get("status", True)
        )
        
        db.add(new_offering)
        db.commit()
        db.refresh(new_offering)
        
        # 从学期中解析学年
        academic_year = ""
        if new_offering.semester:
            parts = new_offering.semester.split('-')
            if len(parts) > 1:
                academic_year = parts[0]
        
        # 构建响应
        result = {
            "offering_id": new_offering.offering_id,
            "course_id": new_offering.course_id,
            "course": {
                "id": course.course_id,
                "course_code": course.course_code,
                "course_name": course.course_name
            },
            "teacher_id": new_offering.teacher_id,
            "teacher": {
                "id": teacher.teacher_id,
                "user": {
                    "real_name": teacher.user.real_name if teacher.user else ""
                }
            },
            "semester": new_offering.semester,
            "academic_year": academic_year,
            "max_students": new_offering.max_students,
            "current_students": 0,
            "status": new_offering.status,
            "schedules": []
        }
        
        return APIResponse(
            code=0,
            message="创建成功",
            data=result
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"创建开课失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"创建开课失败: {str(e)}")


@router.get("/{offering_id}", response_model=APIResponse)
def get_course_offering(
    offering_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["COURSE_OFFERING_VIEW"])),
) -> Any:
    """
    获取开课详情
    """
    try:
        offering = db.query(CourseOffering).options(
            joinedload(CourseOffering.course),
            joinedload(CourseOffering.teacher).joinedload(Teacher.user)
        ).filter(CourseOffering.offering_id == offering_id).first()
        
        if not offering:
            raise HTTPException(status_code=404, detail="开课记录不存在")
        
        # 获取已选课程人数
        enrolled_count = db.query(Enrollment).filter(
            Enrollment.offering_id == offering.offering_id,
            Enrollment.status == True
        ).count()
        
        # 获取排课信息
        schedules_query = db.query(Schedule).filter(Schedule.offering_id == offering_id).all()
        schedules = []
        for schedule in schedules_query:
            classroom_info = ""
            if hasattr(schedule, 'classroom') and schedule.classroom:
                classroom_info = f"{schedule.classroom.building}-{schedule.classroom.room_no}"
            
            schedule_data = {
                "id": schedule.schedule_id,
                "day_of_week": schedule.day_of_week,
                "start_time": schedule.start_time,
                "end_time": schedule.end_time,
                "weeks": schedule.weeks
            }
            schedules.append(schedule_data)
        
        # 从学期中解析学年
        academic_year = ""
        if offering.semester:
            parts = offering.semester.split('-')
            if len(parts) > 1:
                academic_year = parts[0]
        
        # 状态映射
        status_map = {
            True: OfferingStatus.ACTIVE,
            False: OfferingStatus.INACTIVE
        }
        
        result = {
            "offering_id": offering.offering_id,
            "course_id": offering.course_id,
            "course": {
                "id": offering.course.course_id if offering.course else 0,
                "course_code": offering.course.course_code if offering.course else "",
                "course_name": offering.course.course_name if offering.course else "",
                "credits": float(offering.course.credits) if offering.course else 0,
                "hours": offering.course.hours if offering.course else 0,
                "type": offering.course.course_type if offering.course else "",
                "description": offering.course.description or ""
            },
            "teacher_id": offering.teacher_id,
            "teacher": {
                "id": offering.teacher_id if offering.teacher else 0,
                "user": {
                    "real_name": offering.teacher.user.real_name if offering.teacher and offering.teacher.user else ""
                }
            },
            "semester": offering.semester,
            "academic_year": academic_year,
            "max_students": offering.max_students,
            "current_students": enrolled_count,
            "status": status_map.get(offering.status, 0),
            "schedules": schedules,
            "createdAt": offering.created_at.isoformat() if hasattr(offering, 'created_at') and offering.created_at else None
        }
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=result
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"获取开课详情失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取开课详情失败: {str(e)}")


@router.put("/{offering_id}", response_model=APIResponse)
def update_course_offering(
    offering_id: int,
    offering_data: dict,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["COURSE_OFFERING_MANAGE"])),
) -> Any:
    """
    更新开课信息
    """
    try:
        offering = db.query(CourseOffering).filter(CourseOffering.offering_id == offering_id).first()
        if not offering:
            raise HTTPException(status_code=404, detail="开课记录不存在")
        
        # 如果更新了教师，验证教师信息
        if "teacher_id" in offering_data and offering_data["teacher_id"] != offering.teacher_id:
            teacher = db.query(Teacher).filter(
                Teacher.teacher_id == offering_data["teacher_id"]
            ).first()
            if not teacher:
                raise HTTPException(status_code=404, detail="教师不存在")
            
            # 检查是否已存在相同开课记录
            existing = db.query(CourseOffering).filter(
                CourseOffering.course_id == offering.course_id,
                CourseOffering.teacher_id == offering_data["teacher_id"],
                CourseOffering.semester == offering.semester,
                CourseOffering.offering_id != offering_id
            ).first()
            
            if existing:
                raise HTTPException(status_code=400, detail="该课程在本学期已由该教师开课")
        
        # 更新字段
        update_fields = ["teacher_id", "max_students", "status"]
        for field in update_fields:
            if field in offering_data:
                setattr(offering, field, offering_data[field])
        
        db.commit()
        db.refresh(offering)
        
        # 重新加载关联数据
        offering = db.query(CourseOffering).options(
            joinedload(CourseOffering.course),
            joinedload(CourseOffering.teacher).joinedload(Teacher.user)
        ).filter(CourseOffering.offering_id == offering_id).first()
        
        # 获取已选课程人数
        enrolled_count = db.query(Enrollment).filter(
            Enrollment.offering_id == offering.offering_id,
            Enrollment.status == True
        ).count()
        
        # 获取排课信息
        schedules_query = db.query(Schedule).filter(Schedule.offering_id == offering_id).all()
        schedules = []
        for schedule in schedules_query:
            classroom_info = ""
            if hasattr(schedule, 'classroom') and schedule.classroom:
                classroom_info = f"{schedule.classroom.building}-{schedule.classroom.room_no}"
            
            schedule_data = {
                "id": schedule.schedule_id,
                "day_of_week": schedule.day_of_week,
                "start_time": schedule.start_time,
                "end_time": schedule.end_time,
                "weeks": schedule.weeks
            }
            schedules.append(schedule_data)
        
        # 从学期中解析学年
        academic_year = ""
        if offering.semester:
            parts = offering.semester.split('-')
            if len(parts) > 1:
                academic_year = parts[0]
        
        # 构建响应
        result = {
            "offering_id": offering.offering_id,
            "course_id": offering.course_id,
            "course": {
                "id": offering.course.course_id if offering.course else 0,
                "course_code": offering.course.course_code if offering.course else "",
                "course_name": offering.course.course_name if offering.course else ""
            },
            "teacher_id": offering.teacher_id,
            "teacher": {
                "id": offering.teacher_id,
                "user": {
                    "real_name": offering.teacher.user.real_name if offering.teacher and offering.teacher.user else ""
                }
            },
            "semester": offering.semester,
            "academic_year": academic_year,
            "max_students": offering.max_students,
            "current_students": enrolled_count,
            "status": offering.status,
            "schedules": schedules,
            "createdAt": offering.created_at.isoformat() if hasattr(offering, 'created_at') and offering.created_at else None
        }
        
        return APIResponse(
            code=0,
            message="更新成功",
            data=result
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"更新开课失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"更新开课失败: {str(e)}")


@router.delete("/{offering_id}", response_model=APIResponse)
def delete_course_offering(
    offering_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["COURSE_OFFERING_MANAGE"])),
) -> Any:
    """
    删除开课
    """
    try:
        offering = db.query(CourseOffering).filter(CourseOffering.offering_id == offering_id).first()
        if not offering:
            raise HTTPException(status_code=404, detail="开课记录不存在")
        
        # 检查是否有学生选课
        enrollments = db.query(Enrollment).filter(
            Enrollment.offering_id == offering_id,
            Enrollment.status == True
        ).count()
        
        if enrollments > 0:
            raise HTTPException(status_code=400, detail=f"该课程已有{enrollments}名学生选课，无法删除")
        
        # 检查是否有排课记录
        schedules = db.query(Schedule).filter(
            Schedule.offering_id == offering_id
        ).count()
        
        if schedules > 0:
            raise HTTPException(status_code=400, detail=f"该课程已有排课记录，无法删除")
        
        db.delete(offering)
        db.commit()
        
        return APIResponse(
            code=0,
            message="删除成功"
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"删除开课失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"删除开课失败: {str(e)}")


@router.get("/by-course/{course_id}", response_model=APIResponse)
def get_offerings_by_course(
    course_id: int,
    db: Session = Depends(get_db),
    semester: str = None,
    _: Any = Depends(deps.check_permissions(["COURSE_OFFERING_VIEW"])),
) -> Any:
    """
    根据课程获取开课列表
    """
    try:
        # 验证课程信息
        course = db.query(Course).filter(Course.course_id == course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="课程不存在")
        
        # 创建查询
        query = db.query(CourseOffering).options(
            joinedload(CourseOffering.teacher).joinedload(Teacher.user)
        ).filter(CourseOffering.course_id == course_id)
        
        if semester:
            query = query.filter(CourseOffering.semester == semester)
        
        offerings = query.all()
        
        # 构建响应
        offering_list = []
        for offering in offerings:
            # 获取已选课程人数
            enrolled_count = db.query(Enrollment).filter(
                Enrollment.offering_id == offering.offering_id,
                Enrollment.status == True
            ).count()
            
            offering_data = {
                "id": offering.offering_id,
                "course_id": offering.course_id,
                "course_code": course.course_code,
                "course_name": course.course_name,
                "teacher_id": offering.teacher_id,
                "teacher_name": offering.teacher.user.real_name if offering.teacher and offering.teacher.user else None,
                "semester": offering.semester,
                "max_students": offering.max_students,
                "current_students": enrolled_count,
                "status": offering.status
            }
            offering_list.append(offering_data)
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=offering_list
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"获取开课列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取开课列表失败: {str(e)}")


@router.get("/by-teacher/{teacher_id}", response_model=APIResponse)
def get_offerings_by_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    semester: str = None,
    _: Any = Depends(deps.check_permissions(["COURSE_OFFERING_VIEW"])),
) -> Any:
    """
    根据教师获取开课列表
    """
    try:
        # 验证教师信息
        teacher = db.query(Teacher).filter(Teacher.teacher_id == teacher_id).first()
        if not teacher:
            raise HTTPException(status_code=404, detail="教师不存在")
        
        # 创建查询
        query = db.query(CourseOffering).options(
            joinedload(CourseOffering.course)
        ).filter(CourseOffering.teacher_id == teacher_id)
        
        if semester:
            query = query.filter(CourseOffering.semester == semester)
        
        offerings = query.all()
        
        # 构建响应
        offering_list = []
        for offering in offerings:
            # 获取已选课程人数
            enrolled_count = db.query(Enrollment).filter(
                Enrollment.offering_id == offering.offering_id,
                Enrollment.status == True
            ).count()
            
            offering_data = {
                "id": offering.offering_id,
                "course_id": offering.course_id,
                "course_code": offering.course.course_code if offering.course else None,
                "course_name": offering.course.course_name if offering.course else None,
                "teacher_id": offering.teacher_id,
                "semester": offering.semester,
                "max_students": offering.max_students,
                "current_students": enrolled_count,
                "status": offering.status
            }
            offering_list.append(offering_data)
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=offering_list
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"获取开课列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取开课列表失败: {str(e)}")


@router.get("/by-semester/{semester}", response_model=APIResponse)
def get_offerings_by_semester(
    semester: str,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["COURSE_OFFERING_VIEW"])),
) -> Any:
    """
    根据学期获取开课列表
    """
    try:
        # 创建查询
        offerings = db.query(CourseOffering).options(
            joinedload(CourseOffering.course),
            joinedload(CourseOffering.teacher).joinedload(Teacher.user)
        ).filter(CourseOffering.semester == semester).all()
        
        # 构建响应
        offering_list = []
        for offering in offerings:
            # 获取已选课程人数
            enrolled_count = db.query(Enrollment).filter(
                Enrollment.offering_id == offering.offering_id,
                Enrollment.status == True
            ).count()
            
            offering_data = {
                "id": offering.offering_id,
                "course_id": offering.course_id,
                "course_code": offering.course.course_code if offering.course else None,
                "course_name": offering.course.course_name if offering.course else None,
                "teacher_id": offering.teacher_id,
                "teacher_name": offering.teacher.user.real_name if offering.teacher and offering.teacher.user else None,
                "semester": offering.semester,
                "max_students": offering.max_students,
                "current_students": enrolled_count,
                "status": offering.status
            }
            offering_list.append(offering_data)
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=offering_list
        )
    except Exception as e:
        error_msg = f"获取开课列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取开课列表失败: {str(e)}")


@router.get("/enrollment/{offering_id}", response_model=APIResponse)
def get_enrollment_list(
    offering_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["COURSE_OFFERING_VIEW", "ENROLLMENT_VIEW"])),
) -> Any:
    """
    获取课程选课学生列表
    """
    try:
        # 验证开课信息
        offering = db.query(CourseOffering).filter(
            CourseOffering.offering_id == offering_id
        ).first()
        
        if not offering:
            raise HTTPException(status_code=404, detail="开课记录不存在")
        
        # 查询选课学生
        enrollments = db.query(Enrollment).options(
            joinedload(Enrollment.student).joinedload(Student.user),
            joinedload(Enrollment.student).joinedload(Student.department)
        ).filter(
            Enrollment.offering_id == offering_id,
            Enrollment.status == True
        ).all()
        
        # 构建响应
        student_list = []
        for enrollment in enrollments:
            student = enrollment.student
            if student and student.user:
                student_data = {
                    "enrollment_id": enrollment.enrollment_id,
                    "student_id": student.student_id,
                    "student_no": student.student_no,
                    "student_name": student.user.real_name,
                    "department": student.department.dept_name if student.department else None,
                    "class_name": student.class_name,
                    "grade": student.grade,
                    "enrollment_time": str(enrollment.enrollment_time),
                    "score": enrollment.score
                }
                student_list.append(student_data)
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=student_list
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"获取选课学生列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取选课学生列表失败: {str(e)}")


@router.get("/semesters", response_model=APIResponse)
def get_semesters(
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["COURSE_OFFERING_VIEW"])),
) -> Any:
    """
    获取所有学期列表
    """
    try:
        # 查询所有不同的学期
        semesters = db.query(CourseOffering.semester).distinct().order_by(desc(CourseOffering.semester)).all()
        semester_list = [semester[0] for semester in semesters]
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=semester_list
        )
    except Exception as e:
        error_msg = f"获取学期列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取学期列表失败: {str(e)}")


@router.get("/info-list", response_model=APIResponse)
def get_course_offering_info_list(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100, alias="page_size"),
    semester: str = None,
    course_id: int = None,
    teacher_id: int = None,
    _: Any = Depends(deps.check_permissions(["COURSE_OFFERING_VIEW"])),
) -> Any:
    """
    获取开课信息列表（详细信息）
    """
    try:
        # 创建一个包含关联对象的查询
        query = db.query(CourseOffering).options(
            joinedload(CourseOffering.course),
            joinedload(CourseOffering.teacher).joinedload(Teacher.user)
        )
        
        # 应用过滤条件
        if semester:
            query = query.filter(CourseOffering.semester == semester)
        if course_id:
            query = query.filter(CourseOffering.course_id == course_id)
        if teacher_id:
            query = query.filter(CourseOffering.teacher_id == teacher_id)
        
        # 计算总数
        total = query.count()
        
        # 分页
        offerings = query.offset((page - 1) * pageSize).limit(pageSize).all()
        
        # 构建响应
        offering_list = []
        for offering in offerings:
            # 获取已选课程人数
            enrolled_count = db.query(Enrollment).filter(
                Enrollment.offering_id == offering.offering_id,
                Enrollment.status == True
            ).count()
            
            # 计算选课率
            enrollment_rate = 0
            if offering.max_students > 0:
                enrollment_rate = round((enrolled_count / offering.max_students) * 100, 2)
            
            offering_data = {
                "offering_id": offering.offering_id,
                "course_code": offering.course.course_code if offering.course else "",
                "course_name": offering.course.course_name if offering.course else "",
                "credits": float(offering.course.credits) if offering.course else 0,
                "hours": offering.course.hours if offering.course else 0,
                "course_type": offering.course.course_type if offering.course else "",
                "teacher_name": offering.teacher.user.real_name if offering.teacher and offering.teacher.user else "",
                "dept_name": offering.teacher.department.dept_name if offering.teacher and offering.teacher.department else "",
                "semester": offering.semester,
                "max_students": offering.max_students,
                "current_students": enrolled_count,
                "enrollment_rate": enrollment_rate
            }
            
            offering_list.append(offering_data)
        
        # 构建前端期望的响应格式
        response_data = {
            "list": offering_list,
            "total": total,
            "page": page,
            "pageSize": pageSize,
            "totalPages": (total + pageSize - 1) // pageSize
        }
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=response_data
        )
    except Exception as e:
        error_msg = f"获取开课信息列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取开课信息列表失败: {str(e)}") 