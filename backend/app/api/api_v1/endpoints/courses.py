from typing import Any, List
import traceback

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.api import deps
from app.db.database import get_db
from app.models.course import Course, CourseOffering
from app.models.department import Department
from app.schemas.common import APIResponse, PaginatedResponse
from app.schemas.course import (
    CourseCreate, CourseDetail, CourseResponse, CourseUpdate
)

router = APIRouter()


@router.get("", response_model=APIResponse)
def list_courses(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    course_code: str = None,
    course_name: str = None,
    dept_id: int = None,
    course_type: str = None,
    status: bool = None,
    _: Any = Depends(deps.check_permissions(["COURSE_VIEW"])),
) -> Any:
    """
    获取课程列表
    """
    try:
        query = db.query(Course).options(joinedload(Course.department))
        
        # 应用过滤条件
        if course_code:
            query = query.filter(Course.course_code.like(f"%{course_code}%"))
        if course_name:
            query = query.filter(Course.course_name.like(f"%{course_name}%"))
        if dept_id:
            query = query.filter(Course.dept_id == dept_id)
        if course_type:
            # 转换前端传入的课程类型为数据库存储的类型
            type_mapping = {
                "REQUIRED": "必修",
                "ELECTIVE": "选修",
                "PUBLIC": "公选",
                "PROFESSIONAL": "专业课"
            }
            db_course_type = type_mapping.get(course_type)
            if db_course_type:
                query = query.filter(Course.course_type == db_course_type)
        if status is not None:
            query = query.filter(Course.status == status)
        
        # 计算总数
        total = query.count()
        
        # 分页
        courses = query.offset((page - 1) * page_size).limit(page_size).all()
        
        # 构建响应
        course_list = []
        for course in courses:
            # 获取关联的开课数量
            offering_count = db.query(CourseOffering).filter(
                CourseOffering.course_id == course.course_id
            ).count()
            
            # 数据库类型到前端类型的映射
            db_to_frontend_type = {
                "必修": "REQUIRED",
                "选修": "ELECTIVE",
                "公选": "PUBLIC",
                "专业课": "PROFESSIONAL"
            }
            
            # 构建响应
            course_data = {
                "course_id": course.course_id,
                "id": course.course_id,
                "course_code": course.course_code,
                "code": course.course_code,
                "course_name": course.course_name,
                "name": course.course_name,
                "credits": float(course.credits),
                "hours": course.hours,
                "course_type": course.course_type,
                "type": db_to_frontend_type.get(course.course_type, "ELECTIVE"),
                "description": course.description or "",
                "status": 1 if course.status else 0,
                "dept_id": course.dept_id,
                "dept_name": course.department.dept_name if course.department else "",
                "offeringCount": offering_count,
                "created_at": str(course.created_at) if hasattr(course, 'created_at') and course.created_at else "",
                "updated_at": str(course.updated_at) if hasattr(course, 'updated_at') and course.updated_at else "",
                "createdAt": str(course.created_at) if hasattr(course, 'created_at') and course.created_at else "",
                "updatedAt": str(course.updated_at) if hasattr(course, 'updated_at') and course.updated_at else ""
            }
            course_list.append(course_data)
            
        # 与前端期望的格式一致
        result = {
            "list": course_list,
            "total": total,
            "page": page,
            "pageSize": page_size,
            "totalPages": (total + page_size - 1) // page_size
        }
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=result
        )
    except Exception as e:
        error_msg = f"获取课程列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return APIResponse(
            code=500,
            message=f"获取课程列表失败: {str(e)}",
            data=None
        )


@router.post("", response_model=APIResponse)
def create_course(
    course_in: CourseCreate,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["COURSE_CREATE"])),
) -> Any:
    """
    创建新课程
    """
    # 检查课程代码是否存在
    course = db.query(Course).filter(Course.course_code == course_in.course_code).first()
    if course:
        raise HTTPException(
            status_code=400,
            detail="课程代码已存在"
        )
    
    # 检查部门是否存在
    department = db.query(Department).filter(Department.dept_id == course_in.dept_id).first()
    if not department:
        raise HTTPException(
            status_code=404,
            detail="部门不存在"
        )
    
    # 前端类型到数据库类型的映射
    type_mapping = {
        "REQUIRED": "必修",
        "ELECTIVE": "选修",
        "PUBLIC": "公选",
        "PROFESSIONAL": "专业课"
    }
    
    # 转换课程类型
    course_type = type_mapping.get(course_in.course_type, "选修")
    
    # 创建新课程
    db_course = Course(
        course_code=course_in.course_code,
        course_name=course_in.course_name,
        dept_id=course_in.dept_id,
        credits=course_in.credits,
        hours=course_in.hours,
        course_type=course_type,
        description=course_in.description,
        status=course_in.status,
    )
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    
    # 准备返回数据，按照前端期望的格式
    result = {
        "course_id": db_course.course_id,
        "id": db_course.course_id,
        "course_code": db_course.course_code,
        "code": db_course.course_code,
        "course_name": db_course.course_name,
        "name": db_course.course_name,
        "credits": float(db_course.credits),
        "hours": db_course.hours,
        "course_type": db_course.course_type,
        "type": course_in.course_type,  # 返回前端使用的类型格式
        "description": db_course.description or "",
        "status": 1 if db_course.status else 0,
        "dept_id": db_course.dept_id,
        "dept_name": department.dept_name,
        "created_at": str(db_course.created_at) if hasattr(db_course, 'created_at') and db_course.created_at else "",
        "updated_at": str(db_course.updated_at) if hasattr(db_course, 'updated_at') and db_course.updated_at else "",
        "createdAt": str(db_course.created_at) if hasattr(db_course, 'created_at') and db_course.created_at else "",
        "updatedAt": str(db_course.updated_at) if hasattr(db_course, 'updated_at') and db_course.updated_at else ""
    }
    
    return APIResponse(
        code=0,
        message="创建成功",
        data=result
    )


@router.get("/{course_id}", response_model=APIResponse)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["COURSE_VIEW"])),
) -> Any:
    """
    获取课程详情
    """
    course = db.query(Course).options(joinedload(Course.department)).filter(Course.course_id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=404,
            detail="课程不存在"
        )
    
    # 数据库类型到前端类型的映射
    db_to_frontend_type = {
        "必修": "REQUIRED",
        "选修": "ELECTIVE",
        "公选": "PUBLIC",
        "专业课": "PROFESSIONAL"
    }
    
    # 构建响应
    result = {
        "course_id": course.course_id,
        "id": course.course_id,
        "course_code": course.course_code,
        "code": course.course_code,
        "course_name": course.course_name,
        "name": course.course_name,
        "credits": float(course.credits),
        "hours": course.hours,
        "course_type": course.course_type,
        "type": db_to_frontend_type.get(course.course_type, "ELECTIVE"),
        "description": course.description or "",
        "status": 1 if course.status else 0,
        "dept_id": course.dept_id,
        "dept_name": course.department.dept_name if course.department else "",
        "created_at": str(course.created_at) if hasattr(course, 'created_at') and course.created_at else "",
        "updated_at": str(course.updated_at) if hasattr(course, 'updated_at') and course.updated_at else "",
        "createdAt": str(course.created_at) if hasattr(course, 'created_at') and course.created_at else "",
        "updatedAt": str(course.updated_at) if hasattr(course, 'updated_at') and course.updated_at else ""
    }
    
    return APIResponse(
        code=0,
        message="获取成功",
        data=result
    )


@router.put("/{course_id}", response_model=APIResponse)
def update_course(
    course_id: int,
    course_in: CourseUpdate,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["COURSE_UPDATE"])),
) -> Any:
    """
    更新课程信息
    """
    course = db.query(Course).filter(Course.course_id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=404,
            detail="课程不存在"
        )
    
    # 检查课程代码是否存在
    if course_in.course_code and course_in.course_code != course.course_code:
        existing_course = db.query(Course).filter(Course.course_code == course_in.course_code).first()
        if existing_course:
            raise HTTPException(
                status_code=400,
                detail="课程代码已存在"
            )
    
    # 检查部门是否存在
    if course_in.dept_id:
        department = db.query(Department).filter(Department.dept_id == course_in.dept_id).first()
        if not department:
            raise HTTPException(
                status_code=404,
                detail="部门不存在"
            )
    
    # 前端类型到数据库类型的映射
    type_mapping = {
        "REQUIRED": "必修",
        "ELECTIVE": "选修",
        "PUBLIC": "公选",
        "PROFESSIONAL": "专业课"
    }
    
    # 准备更新数据
    update_data = course_in.dict(exclude_unset=True)
    
    # 如果有课程类型，进行转换
    if "course_type" in update_data:
        update_data["course_type"] = type_mapping.get(update_data["course_type"], "选修")
    
    # 更新课程信息
    for key, value in update_data.items():
        setattr(course, key, value)
    
    db.commit()
    db.refresh(course)
    
    # 准备返回数据，按照前端期望的格式
    department = db.query(Department).filter(Department.dept_id == course.dept_id).first()
    
    # 数据库类型到前端类型的映射
    db_to_frontend_type = {
        "必修": "REQUIRED",
        "选修": "ELECTIVE",
        "公选": "PUBLIC",
        "专业课": "PROFESSIONAL"
    }
    
    result = {
        "course_id": course.course_id,
        "id": course.course_id,
        "course_code": course.course_code,
        "code": course.course_code,
        "course_name": course.course_name,
        "name": course.course_name,
        "credits": float(course.credits),
        "hours": course.hours,
        "course_type": course.course_type,
        "type": db_to_frontend_type.get(course.course_type, "ELECTIVE"),  # 使用映射
        "description": course.description or "",
        "status": 1 if course.status else 0,
        "dept_id": course.dept_id,
        "dept_name": department.dept_name if department else "",
        "created_at": str(course.created_at) if hasattr(course, 'created_at') and course.created_at else "",
        "updated_at": str(course.updated_at) if hasattr(course, 'updated_at') and course.updated_at else "",
        "createdAt": str(course.created_at) if hasattr(course, 'created_at') and course.created_at else "",
        "updatedAt": str(course.updated_at) if hasattr(course, 'updated_at') and course.updated_at else ""
    }
    
    return APIResponse(
        code=0,
        message="更新成功",
        data=result
    )


@router.delete("/{course_id}", response_model=APIResponse)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["COURSE_DELETE"])),
) -> Any:
    """
    删除课程
    """
    course = db.query(Course).filter(Course.course_id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=404,
            detail="课程不存在"
        )
    
    # 检查是否有关联的开课记录
    if course.offerings:
        raise HTTPException(
            status_code=400,
            detail="该课程有开课记录，无法删除"
        )
    
    db.delete(course)
    db.commit()
    
    return APIResponse(
        code=0,
        message="删除成功"
    )


@router.get("/by-department/{dept_id}", response_model=APIResponse)
def get_courses_by_department(
    dept_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["COURSE_VIEW"])),
) -> Any:
    """
    根据部门ID获取课程列表
    """
    courses = db.query(Course).filter(Course.dept_id == dept_id, Course.status == True).all()
    course_responses = [CourseResponse.from_orm(course) for course in courses]
    
    return APIResponse(
        code=0,
        message="获取成功",
        data=course_responses
    )


@router.get("/by-type/{type}", response_model=APIResponse)
def get_courses_by_type(
    type: str,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["COURSE_VIEW"])),
) -> Any:
    """
    根据类型获取课程列表
    """
    allowed_types = ['必修', '选修', '公选']
    if type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"课程类型必须是以下之一: {', '.join(allowed_types)}"
        )
    
    courses = db.query(Course).filter(Course.course_type == type, Course.status == True).all()
    course_responses = [CourseResponse.from_orm(course) for course in courses]
    
    return APIResponse(
        code=0,
        message="获取成功",
        data=course_responses
    ) 