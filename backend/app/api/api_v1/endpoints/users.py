from typing import Any, List
import traceback

from fastapi import APIRouter, Depends, HTTPException, Query, Header, Request
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError

from app.api import deps
from app.core import security
from app.db.database import get_db
from app.models.user import User
from app.models.role import Role, user_role
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.department import Department
from app.schemas.common import APIResponse, BatchDeleteRequest, PaginatedResponse
from app.schemas.user import (
    AssignRoles, ResetPassword, UserCreate, UserDetail,
    UserResponse, UserUpdate
)

router = APIRouter()


@router.get("", response_model=APIResponse)
async def list_users(
    request: Request,
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    username: str = None,
    real_name: str = None,
    status: bool = None,
    authorization: str = Header(None),
    _: Any = Depends(deps.check_permissions(["USER_VIEW"])),
) -> Any:
    """
    获取用户列表
    """
    try:
        query = db.query(User).options(joinedload(User.roles))
        
        # 应用过滤条件
        if username:
            query = query.filter(User.username.like(f"%{username}%"))
        if real_name:
            query = query.filter(User.real_name.like(f"%{real_name}%"))
        if status is not None:
            query = query.filter(User.status == status)
        
        # 计算总数
        total = query.count()
        
        # 分页
        users = query.offset((page - 1) * page_size).limit(page_size).all()
        
        # 构建响应
        user_list = []
        for user in users:
            # 处理角色信息 - 只包含启用状态的角色
            roles = []
            active_roles_count = 0
            for role in user.roles:
                if not role.status:
                    continue
                    
                roles.append({
                    "role_id": role.role_id,
                    "role_name": role.role_name,
                    "role_code": role.role_code,
                    "description": role.description,
                    "status": role.status
                })
                active_roles_count += 1
            
            user_data = {
                "user_id": user.user_id,
                "username": user.username,
                "real_name": user.real_name,
                "email": user.email or "",
                "phone": user.phone or "",
                "status": 1 if user.status else 0,
                "roles": roles,
                "rolesCount": active_roles_count,  # 只计算启用状态的角色
                "created_at": str(user.created_at) if user.created_at else "",
                "updated_at": str(user.updated_at) if user.updated_at else ""
            }
            user_list.append(user_data)
            
        # 与前端期望的格式一致
        result = {
            "list": user_list,
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
        error_msg = f"获取用户列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取用户列表失败: {str(e)}")


@router.post("", response_model=APIResponse)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["USER_CREATE"])),
) -> Any:
    """
    创建新用户
    """
    try:
        # 检查用户名是否存在
        user = db.query(User).filter(User.username == user_in.username).first()
        if user:
            raise HTTPException(
                status_code=400,
                detail="用户名已存在"
            )
        
        # 检查邮箱是否存在
        if user_in.email:
            user = db.query(User).filter(User.email == user_in.email).first()
            if user:
                raise HTTPException(
                    status_code=400,
                    detail="邮箱已存在"
                )
        
        # 创建新用户
        from datetime import datetime
        current_time = datetime.now()
        
        # 创建用户对象并明确设置所有必要字段
        db_user = User(
            username=user_in.username,
            password=security.get_password_hash(user_in.password),
            email=user_in.email,
            phone=user_in.phone,
            real_name=user_in.real_name,
            status=user_in.status,
            created_at=current_time,
            updated_at=current_time
        )
        
        # 添加到会话
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # 构建符合Pydantic模型的响应
        user_response = UserResponse(
            user_id=db_user.user_id,
            username=db_user.username,
            email=db_user.email,
            phone=db_user.phone,
            real_name=db_user.real_name,
            status=db_user.status,
            created_at=str(db_user.created_at),
            updated_at=str(db_user.updated_at)
        )
        
        return APIResponse(
            code=0,
            message="创建成功",
            data=user_response
        )
    except Exception as e:
        db.rollback()  # 发生错误时回滚事务
        print(f"创建用户失败: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"创建用户失败: {str(e)}"
        )


@router.get("/{user_id}", response_model=APIResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    token_permissions: Any = Depends(deps.check_permissions(["USER_VIEW"], required=False)),
) -> Any:
    """
    获取用户详情
    """
    try:
        # 检查权限：当用户查询自己的信息时不进行权限检查，否则需要权限
        if current_user.user_id != user_id and not token_permissions:
            raise HTTPException(
                status_code=403,
                detail="权限不足"
            )
            
        user = db.query(User).options(joinedload(User.roles)).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=404,
                detail="用户不存在"
            )
        
        # 处理角色信息 - 只包含启用状态的角色
        roles_data = []
        for role in user.roles:
            if not role.status:
                continue
                
            role_data = {
                "role_id": role.role_id,
                "role_name": role.role_name,
                "role_code": role.role_code,
                "description": role.description,
                "status": role.status
            }
            roles_data.append(role_data)
        
        # 获取用户类型和其他关联信息
        user_type = "admin"  # 默认为管理员类型
        additional_info = {}
        
        # 检查是否为学生
        student = db.query(Student).options(
            joinedload(Student.department)
        ).filter(Student.user_id == user.user_id).first()
        if student:
            user_type = "student"
            additional_info = {
                "student_id": student.student_id,
                "student_no": student.student_no,
                "class_name": student.class_name or "",
                "grade": student.grade,
                "dept_id": student.dept_id,
                "dept_name": student.department.dept_name if student.department else ""
            }
        
        # 检查是否为教师
        teacher = db.query(Teacher).options(
            joinedload(Teacher.department)
        ).filter(Teacher.user_id == user.user_id).first()
        if teacher:
            user_type = "teacher"
            additional_info = {
                "teacher_id": teacher.teacher_id,
                "teacher_no": teacher.teacher_no,
                "title": teacher.title or "",
                "dept_id": teacher.dept_id,
                "dept_name": teacher.department.dept_name if teacher.department else ""
            }
        
        # 构建用户详情
        user_detail = {
            "user_id": user.user_id,
            "username": user.username,
            "real_name": user.real_name,
            "email": user.email or "",
            "phone": user.phone or "",
            "status": 1 if user.status else 0,
            "user_type": user_type,
            "roles": roles_data,
            "rolesCount": len(roles_data),  # 添加角色数量
            "created_at": str(user.created_at) if user.created_at else "",
            "updated_at": str(user.updated_at) if user.updated_at else "",
            **additional_info  # 添加角色特定信息
        }
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=user_detail
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"获取用户详情时出错: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return APIResponse(
            code=500,
            message=f"获取用户详情时出错: {str(e)}",
            data=None
        )


@router.put("/{user_id}", response_model=APIResponse)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["USER_UPDATE"])),
) -> Any:
    """
    更新用户信息
    """
    try:
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=404,
                detail="用户不存在"
            )
        
        # 检查邮箱是否存在
        if user_in.email and user_in.email != user.email:
            existing_user = db.query(User).filter(User.email == user_in.email).first()
            if existing_user:
                raise HTTPException(
                    status_code=400,
                    detail="邮箱已存在"
                )
        
        # 更新用户信息
        update_data = user_in.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(user, key, value)
        
        db.commit()
        db.refresh(user)
        
        # 构建响应
        user_response = UserResponse(
            user_id=user.user_id,
            username=user.username,
            email=user.email,
            phone=user.phone,
            real_name=user.real_name,
            status=user.status,
            created_at=str(user.created_at),
            updated_at=str(user.updated_at)
        )
        
        return APIResponse(
            code=0,
            message="更新成功",
            data=user_response
        )
    except HTTPException as e:
        # 直接重新抛出HTTP异常
        raise e
    except Exception as e:
        db.rollback()  # 发生错误时回滚事务
        print(f"更新用户失败: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"更新用户失败: {str(e)}"
        )


@router.delete("/{user_id}", response_model=APIResponse)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["USER_DELETE"])),
) -> Any:
    """
    删除用户
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="用户不存在"
        )
    
    db.delete(user)
    db.commit()
    
    return APIResponse(
        code=0,
        message="删除成功"
    )


@router.post("/batch-delete", response_model=APIResponse)
def batch_delete_users(
    request: BatchDeleteRequest,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["USER_DELETE"])),
) -> Any:
    """
    批量删除用户
    """
    db.query(User).filter(User.user_id.in_(request.ids)).delete(synchronize_session=False)
    db.commit()
    
    return APIResponse(
        code=0,
        message="批量删除成功"
    )


@router.put("/{user_id}/reset-password", response_model=APIResponse)
def reset_password(
    user_id: int,
    password_in: ResetPassword,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["USER_UPDATE"])),
) -> Any:
    """
    重置用户密码
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="用户不存在"
        )
    
    user.password = security.get_password_hash(password_in.new_password)
    db.commit()
    
    return APIResponse(
        code=0,
        message="密码重置成功"
    )


@router.put("/{user_id}/toggle-status", response_model=APIResponse)
def toggle_user_status(
    user_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["USER_UPDATE"])),
) -> Any:
    """
    切换用户状态
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="用户不存在"
        )
    
    user.status = not user.status
    db.commit()
    
    return APIResponse(
        code=0,
        message=f"用户已{'启用' if user.status else '禁用'}"
    )


@router.put("/{user_id}/assign-roles", response_model=APIResponse)
def assign_roles(
    user_id: int,
    roles_in: AssignRoles,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    _: Any = Depends(deps.check_permissions(["USER_UPDATE"])),
) -> Any:
    """
    分配用户角色
    """
    try:
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=404,
                detail="用户不存在"
            )
        
        # 获取角色
        roles = db.query(Role).filter(Role.role_id.in_(roles_in.role_ids)).all()
        
        # 分配角色
        user.roles = roles
        db.commit()
        db.refresh(user)
        
        # 处理角色信息 - 只包含启用状态的角色
        roles_data = []
        for role in user.roles:
            if not role.status:
                continue
                
            role_data = {
                    "role_id": role.role_id,
                    "role_name": role.role_name,
                    "role_code": role.role_code,
                "description": role.description,
                "status": role.status
            }
            roles_data.append(role_data)
        
        # 构建用户详情
        user_detail = {
            "user_id": user.user_id,
            "username": user.username,
            "real_name": user.real_name,
            "email": user.email or "",
            "phone": user.phone or "",
            "status": user.status,
            "roles": roles_data,
            "rolesCount": len(roles_data),  # 添加角色数量
            "created_at": str(user.created_at) if user.created_at else "",
            "updated_at": str(user.updated_at) if user.updated_at else ""
        }
        
        return APIResponse(
            code=0,
            message="角色分配成功",
            data=user_detail
        )
    except Exception as e:
        print(f"分配角色时出错: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"分配角色时出错: {str(e)}") 


@router.get("/me", response_model=APIResponse)
def get_current_user_info(
    current_user: User = Depends(deps.get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    获取当前用户的个人信息
    """
    try:
        # 从数据库重新查询用户，确保获取最新数据
        user = db.query(User).options(joinedload(User.roles)).filter(
            User.user_id == current_user.user_id
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=404,
                detail="用户不存在"
            )
        
        # 处理角色信息 - 只包含启用状态的角色
        roles_data = []
        for role in user.roles:
            if not role.status:
                continue
                
            role_data = {
                "role_id": role.role_id,
                "role_name": role.role_name,
                "role_code": role.role_code,
                "description": role.description,
                "status": role.status
            }
            roles_data.append(role_data)
        
        # 获取用户类型和其他关联信息
        user_type = "admin"  # 默认为管理员类型
        additional_info = {}
        
        # 检查是否为学生
        student = db.query(Student).options(
            joinedload(Student.department)
        ).filter(Student.user_id == user.user_id).first()
        if student:
            user_type = "student"
            additional_info = {
                "student_id": student.student_id,
                "student_no": student.student_no,
                "class_name": student.class_name or "",
                "grade": student.grade,
                "dept_id": student.dept_id,
                "dept_name": student.department.dept_name if student.department else ""
            }
        
        # 检查是否为教师
        teacher = db.query(Teacher).options(
            joinedload(Teacher.department)
        ).filter(Teacher.user_id == user.user_id).first()
        if teacher:
            user_type = "teacher"
            additional_info = {
                "teacher_id": teacher.teacher_id,
                "teacher_no": teacher.teacher_no,
                "title": teacher.title or "",
                "dept_id": teacher.dept_id,
                "dept_name": teacher.department.dept_name if teacher.department else ""
            }
        
        # 构建用户信息响应
        user_info = {
            "user_id": user.user_id,
            "username": user.username,
            "real_name": user.real_name,
            "email": user.email or "",
            "phone": user.phone or "",
            "status": user.status,
            "user_type": user_type,
            "roles": roles_data,
            "rolesCount": len(roles_data),  # 添加角色数量
            "created_at": str(user.created_at) if user.created_at else "",
            "updated_at": str(user.updated_at) if user.updated_at else "",
            **additional_info  # 添加角色特定信息
        }
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=user_info
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"获取个人信息失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return APIResponse(
            code=500,
            message=f"获取个人信息失败: {str(e)}",
            data=None
        ) 