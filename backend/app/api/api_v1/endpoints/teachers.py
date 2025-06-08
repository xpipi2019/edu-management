from typing import Any, List
from sqlalchemy import text, func

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.api import deps
from app.db.database import get_db
from app.models.teacher import Teacher
from app.models.user import User
from app.models.department import Department
from app.models.course import CourseOffering
from app.schemas.common import APIResponse, PaginatedResponse
from app.schemas.teacher import (
    TeacherCreate, TeacherDetail, TeacherInfo, TeacherResponse, TeacherUpdate
)
import traceback

router = APIRouter()


@router.get("", response_model=APIResponse)
def list_teachers(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100, alias="page_size"),
    teacher_no: str = None,
    dept_id: int = None,
    title: str = None,
    status: bool = None,
    _: Any = Depends(deps.check_permissions(["TEACHER_VIEW"])),
) -> Any:
    """
    获取教师列表
    """
    try:
        # 使用ORM查询
        query = db.query(Teacher).options(
            joinedload(Teacher.user),
            joinedload(Teacher.department)
        )
        
        # 应用过滤条件
        if teacher_no:
            query = query.filter(Teacher.teacher_no.like(f"%{teacher_no}%"))
        if dept_id:
            query = query.filter(Teacher.dept_id == dept_id)
        if title:
            query = query.filter(Teacher.title.like(f"%{title}%"))
        if status is not None:
            query = query.filter(Teacher.status == status)
        
        # 计算总数（使用更新的方式获取计数）
        total = db.query(func.count(Teacher.teacher_id)).filter(
            *query.whereclause.clauses if hasattr(query, 'whereclause') and hasattr(query.whereclause, 'clauses') else []
        ).scalar() or 0
        
        # 强制应用分页
        if pageSize > 100:
            pageSize = 100  # 限制最大页大小
            
        # 添加排序，确保结果一致性
        query = query.order_by(Teacher.teacher_id)
        
        # 分页
        teachers = query.offset((page - 1) * pageSize).limit(pageSize).all()
        
        # 构建响应
        teacher_list = []
        for teacher in teachers:
            try:
                # 获取关联的课程数量
                course_count = db.query(CourseOffering).filter(
                    CourseOffering.teacher_id == teacher.teacher_id
                ).count()
                
                # 构建用户信息
                user_info = None
                if teacher.user:
                    user_info = {
                        "user_id": teacher.user.user_id,
                        "username": teacher.user.username,
                        "real_name": teacher.user.real_name,
                        "email": teacher.user.email,
                        "phone": teacher.user.phone,
                        "status": 1 if teacher.user.status else 0
                    }
                
                # 构建部门信息
                department_info = None
                if teacher.department:
                    department_info = {
                        "dept_id": teacher.department.dept_id,
                        "dept_name": teacher.department.dept_name,
                        "dept_code": teacher.department.dept_code
                    }
                
                teacher_data = {
                    "teacher_id": teacher.teacher_id,
                    "user_id": teacher.user_id,
                    "teacher_no": teacher.teacher_no,
                    "dept_id": teacher.dept_id,
                    "title": teacher.title or "",
                    "hire_date": teacher.hire_date.strftime("%Y-%m-%d") if teacher.hire_date else None,
                    "status": teacher.status,
                    "courseCount": course_count,
                    "created_at": teacher.created_at.isoformat() if hasattr(teacher, 'created_at') and teacher.created_at else None,
                    "updated_at": teacher.updated_at.isoformat() if hasattr(teacher, 'updated_at') and teacher.updated_at else None,
                    "createdAt": teacher.created_at.isoformat() if hasattr(teacher, 'created_at') and teacher.created_at else None,
                    "updatedAt": teacher.updated_at.isoformat() if hasattr(teacher, 'updated_at') and teacher.updated_at else None,
                    # 为前端表格提供直接访问的字段
                    "real_name": teacher.user.real_name if teacher.user else "",
                    "dept_name": teacher.department.dept_name if teacher.department else "",
                    "email": teacher.user.email if teacher.user else "",
                    "phone": teacher.user.phone if teacher.user else "",
                    # 关联对象信息
                    "user": user_info,
                    "department": department_info
                }
                teacher_list.append(teacher_data)
            except Exception as item_e:
                print(f"处理教师数据时出错: {str(item_e)}")
                # 继续处理下一条记录
        
        # 构建前端期望的响应格式
        response_data = {
            "list": teacher_list,
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
        error_msg = f"获取教师列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        # 返回友好的错误响应，而不是抛出500错误
        return APIResponse(
            code=500,
            message="获取教师列表失败",
            data={
                "list": [],
                "total": 0,
                "page": page,
                "pageSize": pageSize,
                "totalPages": 0
            }
        )


@router.post("", response_model=APIResponse)
def create_teacher(
    teacher_in: TeacherCreate,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["TEACHER_CREATE"])),
) -> Any:
    """
    创建新教师
    """
    # 检查教师编号是否存在
    teacher = db.query(Teacher).filter(Teacher.teacher_no == teacher_in.teacher_no).first()
    if teacher:
        raise HTTPException(
            status_code=400,
            detail="教师编号已存在"
        )
    
    # 检查用户是否存在
    user = db.query(User).filter(User.user_id == teacher_in.user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="用户不存在"
        )
    
    # 检查用户是否已经是教师
    teacher = db.query(Teacher).filter(Teacher.user_id == teacher_in.user_id).first()
    if teacher:
        raise HTTPException(
            status_code=400,
            detail="该用户已经是教师"
        )
    
    # 检查部门是否存在
    department = db.query(Department).filter(Department.dept_id == teacher_in.dept_id).first()
    if not department:
        raise HTTPException(
            status_code=404,
            detail="部门不存在"
        )
    
    # 创建新教师
    db_teacher = Teacher(
        teacher_no=teacher_in.teacher_no,
        user_id=teacher_in.user_id,
        dept_id=teacher_in.dept_id,
        title=teacher_in.title,
        hire_date=teacher_in.hire_date,
        status=teacher_in.status,
    )
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)
    
    return APIResponse(
        code=0,
        message="创建成功",
        data=TeacherResponse.from_orm(db_teacher)
    )


@router.get("/{teacher_id}", response_model=APIResponse)
def get_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["TEACHER_VIEW"])),
) -> Any:
    """
    获取教师详情
    """
    try:
        teacher = db.query(Teacher).options(
            joinedload(Teacher.user),
            joinedload(Teacher.department)
        ).filter(Teacher.teacher_id == teacher_id).first()
        
        if not teacher:
            raise HTTPException(
                status_code=404,
                detail="教师不存在"
            )
        
        # 构建详细响应
        result = {
            "teacher_id": teacher.teacher_id,
            "user_id": teacher.user_id,
            "teacher_no": teacher.teacher_no,
            "dept_id": teacher.dept_id,
            "dept_name": teacher.department.dept_name if teacher.department else "",
            "title": teacher.title,
            "hire_date": str(teacher.hire_date) if teacher.hire_date else None,
            "status": 1 if teacher.status else 0,
            "user_info": {
                "user_id": teacher.user.user_id,
                "username": teacher.user.username,
                "real_name": teacher.user.real_name,
                "email": teacher.user.email,
                "phone": teacher.user.phone,
                "status": 1 if teacher.user.status else 0
            } if teacher.user else {},
            "department": {
                "dept_id": teacher.department.dept_id,
                "dept_name": teacher.department.dept_name,
                "dept_code": teacher.department.dept_code
            } if teacher.department else {},
            "created_at": str(teacher.created_at) if hasattr(teacher, 'created_at') and teacher.created_at else "",
            "updated_at": str(teacher.updated_at) if hasattr(teacher, 'updated_at') and teacher.updated_at else "",
            "createdAt": str(teacher.created_at) if hasattr(teacher, 'created_at') and teacher.created_at else "",
            "updatedAt": str(teacher.updated_at) if hasattr(teacher, 'updated_at') and teacher.updated_at else ""
        }
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=result
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"获取教师详情失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return APIResponse(
            code=500,
            message=f"获取教师详情失败: {str(e)}",
            data=None
        )


@router.put("/{teacher_id}", response_model=APIResponse)
def update_teacher(
    teacher_id: int,
    teacher_in: TeacherUpdate,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["TEACHER_EDIT"])),
) -> Any:
    """
    更新教师信息
    """
    teacher = db.query(Teacher).filter(Teacher.teacher_id == teacher_id).first()
    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="教师不存在"
        )
    
    # 检查教师编号是否存在
    if teacher_in.teacher_no and teacher_in.teacher_no != teacher.teacher_no:
        existing_teacher = db.query(Teacher).filter(Teacher.teacher_no == teacher_in.teacher_no).first()
        if existing_teacher:
            raise HTTPException(
                status_code=400,
                detail="教师编号已存在"
            )
    
    # 检查部门是否存在
    if teacher_in.dept_id:
        department = db.query(Department).filter(Department.dept_id == teacher_in.dept_id).first()
        if not department:
            raise HTTPException(
                status_code=404,
                detail="部门不存在"
            )
    
    # 更新教师信息
    update_data = teacher_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(teacher, key, value)
    
    db.commit()
    db.refresh(teacher)
    
    return APIResponse(
        code=0,
        message="更新成功",
        data=TeacherResponse.from_orm(teacher)
    )


@router.delete("/{teacher_id}", response_model=APIResponse)
def delete_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["TEACHER_DELETE"])),
) -> Any:
    """
    删除教师
    """
    teacher = db.query(Teacher).filter(Teacher.teacher_id == teacher_id).first()
    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="教师不存在"
        )
    
    # 检查是否有关联的课程
    if teacher.course_offerings:
        raise HTTPException(
            status_code=400,
            detail="该教师有授课记录，无法删除"
        )
    
    db.delete(teacher)
    db.commit()
    
    return APIResponse(
        code=0,
        message="删除成功"
    )


@router.get("/by-user/{user_id}", response_model=APIResponse)
def get_teacher_by_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    token_permissions: Any = Depends(deps.check_permissions(["TEACHER_VIEW"], required=False)),
) -> Any:
    """
    根据用户ID获取教师信息
    """
    try:
        # 检查权限：当用户查询自己的信息时不进行权限检查，否则需要权限
        if current_user.user_id != user_id and not token_permissions:
            raise HTTPException(
                status_code=403,
                detail="权限不足"
            )
            
        teacher = db.query(Teacher).options(
            joinedload(Teacher.user),
            joinedload(Teacher.department)
        ).filter(Teacher.user_id == user_id).first()
        
        if not teacher:
            raise HTTPException(
                status_code=404,
                detail="该用户不是教师"
            )
        
        # 构建详细响应
        result = {
            "teacher_id": teacher.teacher_id,
            "user_id": teacher.user_id,
            "teacher_no": teacher.teacher_no,
            "dept_id": teacher.dept_id,
            "dept_name": teacher.department.dept_name if teacher.department else "",
            "title": teacher.title,
            "hire_date": str(teacher.hire_date) if teacher.hire_date else None,
            "status": 1 if teacher.status else 0,
            "user_info": {
                "user_id": teacher.user.user_id,
                "username": teacher.user.username,
                "real_name": teacher.user.real_name,
                "email": teacher.user.email,
                "phone": teacher.user.phone,
                "status": 1 if teacher.user.status else 0
            } if teacher.user else {},
            "department": {
                "dept_id": teacher.department.dept_id,
                "dept_name": teacher.department.dept_name,
                "dept_code": teacher.department.dept_code
            } if teacher.department else {},
            "created_at": str(teacher.created_at) if hasattr(teacher, 'created_at') and teacher.created_at else "",
            "updated_at": str(teacher.updated_at) if hasattr(teacher, 'updated_at') and teacher.updated_at else ""
        }
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=result
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"获取教师信息失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取教师信息失败: {str(e)}")


@router.get("/by-department/{dept_id}", response_model=APIResponse)
def get_teachers_by_department(
    dept_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["TEACHER_VIEW"])),
) -> Any:
    """
    根据部门ID获取教师列表
    """
    teachers = db.query(Teacher).filter(Teacher.dept_id == dept_id).all()
    teacher_responses = [TeacherResponse.from_orm(teacher) for teacher in teachers]
    
    return APIResponse(
        code=0,
        message="获取成功",
        data=teacher_responses
    )


@router.get("/info-list")
def get_teacher_info_list(
    db: Session = Depends(get_db),
    page: int = Query(1, description="页码", ge=1),
    pageSize: int = Query(20, description="每页条数", alias="page_size", ge=1, le=100),
    keyword: str = Query(None, description="关键词搜索"),
    _: Any = Depends(deps.check_permissions(["TEACHER_VIEW"])),
) -> Any:
    """
    获取教师信息列表（简化版，用于下拉选择）
    """
    try:
        # 验证并处理参数
        try:
            page = max(1, page)  # 确保页码至少为1
        except (TypeError, ValueError):
            page = 1
            
        try:
            pageSize = max(1, min(100, pageSize))  # 确保每页条数在1-100之间
        except (TypeError, ValueError):
            pageSize = 20
            
        print(f"教师信息列表查询参数: page={page}, pageSize={pageSize}, keyword={keyword}")
            
        # 使用ORM查询
        query = db.query(
            Teacher.teacher_id,
            Teacher.teacher_no,
            User.real_name
        ).join(User, Teacher.user_id == User.user_id)
        
        # 应用关键词搜索
        if keyword:
            query = query.filter(
                User.real_name.like(f"%{keyword}%") | 
                Teacher.teacher_no.like(f"%{keyword}%")
            )
        
        # 获取总数
        total = query.count()
        
        # 分页
        result = query.offset((page - 1) * pageSize).limit(pageSize).all()
        
        # 构建响应
        teacher_info_list = []
        for row in result:
            teacher_info = {
                "value": row[0],  # teacher_id
                "label": f"{row[1]} {row[2]}",  # teacher_no + real_name
                "teacher_id": row[0],
                "teacher_no": row[1],
                "real_name": row[2]
            }
            teacher_info_list.append(teacher_info)
        
        print(f"获取到 {len(teacher_info_list)} 位教师信息")
        
        # 计算总页数
        totalPages = (total + pageSize - 1) // pageSize
        
        # 构建分页响应
        result = {
            "list": teacher_info_list,
            "total": total,
            "page": page,
            "pageSize": pageSize,
            "totalPages": totalPages
        }
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=result
        )
    except Exception as e:
        error_msg = f"获取教师信息列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return APIResponse(
            code=0,
            message="获取成功（处理过程中有错误）",
            data={
                "list": [],
                "total": 0,
                "page": 1,
                "pageSize": 20,
                "totalPages": 0
            }
        )