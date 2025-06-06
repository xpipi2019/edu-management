from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status, Body, Header, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session, joinedload
import traceback
import logging

from jose import jwt, JWTError

from app.api import deps
from app.core import security
from app.core.config import settings
from app.db.database import get_db
from app.models.user import User
from app.models.role import Role, Permission
from app.schemas.common import APIResponse
from app.schemas.user import ChangePassword, Token, UserDetail, Login

# 业务状态码
class BUSINESS_CODE:
    SUCCESS = 0
    FAIL = 1
    UNAUTHORIZED = 401
    FORBIDDEN = 403
    NOT_FOUND = 404
    VALIDATION_ERROR = 422
    SERVER_ERROR = 500

router = APIRouter()


@router.post("/login", response_model=APIResponse)
def login(
    db: Session = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    用户登录 (表单提交方式)
    """
    try:
        # 记录登录尝试
        print(f"登录尝试: 用户名={form_data.username}")
        
        # 使用joinedload预加载roles关系
        user = db.query(User).options(joinedload(User.roles)).filter(User.username == form_data.username).first()
        if not user:
            print(f"用户不存在: {form_data.username}")
            return APIResponse(
                code=BUSINESS_CODE.UNAUTHORIZED,
                message="用户名或密码不正确",
                data=None
            )
        
        # 检查密码
        password_match = security.verify_password(form_data.password, user.password)
        print(f"密码验证: {password_match}")
        
        if not password_match:
            return APIResponse(
                code=BUSINESS_CODE.UNAUTHORIZED,
                message="用户名或密码不正确",
                data=None
            )
        
        if not user.status:
            return APIResponse(
                code=BUSINESS_CODE.FORBIDDEN,
                message="用户已被禁用",
                data=None
            )

        # 生成访问令牌
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = security.create_access_token(
            user.user_id, expires_delta=access_token_expires
        )
        print(f"生成令牌成功")

        # 获取用户权限
        permissions = set()
        roles_data = []
        
        # 检查是否为超级管理员
        is_super_admin = any(role.role_code == 'SUPER_ADMIN' for role in user.roles if role.status)
        
        # 处理角色数据
        for role in user.roles:
            if role.status:  # 只考虑激活状态的角色
                # 添加角色数据
                role_data = {
                    "role_id": role.role_id,
                    "role_name": role.role_name,
                    "role_code": role.role_code,
                    "description": role.description,
                    "status": role.status
                }
                roles_data.append(role_data)
        
        if is_super_admin:
            # 为超级管理员添加所有可能的权限常量
            permissions.update([
                # 用户管理
                "USER_MANAGE", "USER_CREATE", "USER_UPDATE", "USER_DELETE", "USER_VIEW", "USER_EDIT",
                # 角色管理
                "ROLE_MANAGE", "ROLE_CREATE", "ROLE_UPDATE", "ROLE_DELETE", "ROLE_VIEW", "ROLE_EDIT",
                # 教师管理
                "TEACHER_MANAGE", "TEACHER_CREATE", "TEACHER_VIEW", "TEACHER_EDIT", "TEACHER_DELETE",
                # 学生管理
                "STUDENT_MANAGE", "STUDENT_CREATE", "STUDENT_VIEW", "STUDENT_EDIT", "STUDENT_DELETE",
                # 课程管理
                "COURSE_MANAGE", "COURSE_CREATE", "COURSE_UPDATE", "COURSE_DELETE", "COURSE_VIEW", "COURSE_EDIT",
                # 开课管理
                "COURSE_OFFERING_MANAGE", "COURSE_OFFERING_CREATE", "COURSE_OFFERING_UPDATE",
                "COURSE_OFFERING_DELETE", "COURSE_OFFERING_VIEW", "COURSE_OFFERING_EDIT",
                # 选课管理
                "ENROLLMENT_MANAGE", "ENROLLMENT_APPROVE", "ENROLLMENT_VIEW", "ENROLLMENT_CREATE", 
                "ENROLLMENT_EDIT", "ENROLLMENT_DELETE",
                # 成绩管理
                "GRADE_MANAGE", "GRADE_INPUT", "GRADE_UPDATE", "GRADE_VIEW", "GRADE_EDIT",
                # 排课管理
                "SCHEDULE_MANAGE", "SCHEDULE_CREATE", "SCHEDULE_UPDATE", "SCHEDULE_DELETE",
                "SCHEDULE_VIEW", "SCHEDULE_EDIT",
                # 学籍管理
                "STUDENT_STATUS_MANAGE", "STUDENT_STATUS_UPDATE", "STUDENT_STATUS_VIEW",
                # 奖惩管理
                "REWARD_PUNISHMENT_MANAGE", "REWARD_PUNISHMENT_CREATE", "REWARD_PUNISHMENT_UPDATE",
                "REWARD_PUNISHMENT_DELETE", "REWARD_PUNISHMENT_VIEW",
                # 教室管理
                "CLASSROOM_MANAGE", "CLASSROOM_CREATE", "CLASSROOM_UPDATE", "CLASSROOM_DELETE",
                "CLASSROOM_VIEW", "CLASSROOM_EDIT",
                # 部门管理
                "DEPARTMENT_MANAGE", "DEPARTMENT_CREATE", "DEPARTMENT_UPDATE", "DEPARTMENT_DELETE",
                "DEPARTMENT_VIEW", "DEPARTMENT_EDIT",
                # 教师业务
                "MY_COURSES_VIEW", "STUDENT_LIST_VIEW",
                # 学生业务
                "MY_ENROLLMENT_VIEW", "MY_GRADE_VIEW", "MY_SCHEDULE_VIEW"
            ])
            print(f"用户是超级管理员，授予所有系统权限，共 {len(permissions)} 个权限")
        else:
            # 不是超级管理员，则从角色权限中获取
            if hasattr(user, 'roles') and user.roles:
                for role in user.roles:
                    # 收集该角色的所有权限
                    if hasattr(role, 'permissions') and role.permissions:
                        for perm in role.permissions:
                            if perm.status:  # 只添加启用的权限
                                permissions.add(perm.permission_code)

        # 转换权限集合为列表
        permissions_list = list(permissions)
        
        # 打印完整的角色和权限信息，用于调试
        print("===================== 用户角色和权限详情 =====================")
        print(f"用户ID: {user.user_id}, 用户名: {user.username}")
        if user.roles:
            print(f"角色数量: {len(user.roles)}")
            for i, role in enumerate(user.roles):
                print(f"角色 {i+1}: {role.role_name} (code: {role.role_code}, status: {role.status})")
                if hasattr(role, 'permissions') and role.permissions:
                    print(f"  权限数量: {len(role.permissions)}")
                    for j, perm in enumerate(role.permissions):
                        print(f"  权限 {j+1}: {perm.permission_name} (code: {perm.permission_code}, status: {perm.status})")
                else:
                    print(f"  该角色没有权限")
        else:
            print("用户没有角色")

        print("================== 最终权限列表 ==================")
        print(f"权限列表长度: {len(permissions_list)}")
        print(f"权限列表前10项: {permissions_list[:10] if len(permissions_list) > 0 else '无权限'}")
        print("======================================================")
        
        # 构建用户详情
        user_info = {
            "user_id": user.user_id,
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
            "real_name": user.real_name,
            "status": user.status,
            "created_at": str(user.created_at),
            "updated_at": str(user.updated_at),
            "roles": roles_data,
            "permissions": list(permissions)
        }
        
        print(f"用户详情构建成功，角色数量: {len(roles_data)}, 权限数量: {len(permissions)}")

        # 构建与前端期望格式完全一致的响应
        token_data = {
            "access_token": access_token,
            "token": access_token,  # 前端兼容性字段
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": user_info,  # 将user_info改为user，以适配前端期望的格式
            "refresh_token": access_token  # 添加refresh_token字段，保持与前端的兼容性
        }
        
        print(f"令牌数据构建成功")

        return APIResponse(
            code=0,
            message="登录成功",
            data=token_data
        )
    except Exception as e:
        # 记录详细错误信息
        error_msg = f"登录异常: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        
        # 返回统一格式的错误响应，避免500错误
        return APIResponse(
            code=BUSINESS_CODE.SERVER_ERROR,
            message=f"登录失败: {str(e)}",
            data=None
        )


@router.post("/login/json", response_model=APIResponse)
def login_json(
    login_data: Login,
    db: Session = Depends(get_db)
) -> Any:
    """
    用户登录 (JSON提交方式)
    """
    try:
        # 记录登录尝试
        print(f"JSON登录尝试: 用户名={login_data.username}")
        
        # 使用joinedload预加载roles关系和permissions关系
        user = db.query(User).options(
            joinedload(User.roles).joinedload(Role.permissions)
        ).filter(User.username == login_data.username).first()
        
        if not user:
            print(f"用户不存在: {login_data.username}")
            return APIResponse(
                code=BUSINESS_CODE.UNAUTHORIZED,
                message="用户名或密码不正确",
                data=None
            )
            
        # 调试: 检查user.roles和permissions的原始数据
        print(f"User roles count: {len(user.roles) if user.roles else 0}")
        if user.roles:
            for role in user.roles:
                print(f"Role: {role.role_name} ({role.role_code}), Status: {role.status}")
                if hasattr(role, 'permissions'):
                    print(f"  Permissions count: {len(role.permissions) if role.permissions else 0}")
                    if role.permissions:
                        for perm in role.permissions:
                            print(f"    Permission: {perm.permission_name} ({perm.permission_code}), Status: {perm.status}")
                else:
                    print("  No permissions attribute")
        
        # 检查密码
        password_match = security.verify_password(login_data.password, user.password)
        print(f"密码验证: {password_match}")
        
        if not password_match:
            return APIResponse(
                code=BUSINESS_CODE.UNAUTHORIZED,
                message="用户名或密码不正确",
                data=None
            )
        
        if not user.status:
            return APIResponse(
                code=BUSINESS_CODE.FORBIDDEN,
                message="用户已被禁用",
                data=None
            )

        # 生成访问令牌
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = security.create_access_token(
            user.user_id, expires_delta=access_token_expires
        )
        print(f"生成令牌成功")

        # 从用户的所有角色中获取权限
        permissions_set = set()
            
        # 检查是否为超级管理员
        is_super_admin = any(role.role_code == 'SUPER_ADMIN' for role in user.roles if role.status)
        
        if is_super_admin:
            # 为超级管理员添加所有可能的权限常量
            permissions_set.update([
                # 用户管理
                "USER_MANAGE", "USER_CREATE", "USER_UPDATE", "USER_DELETE", "USER_VIEW", "USER_EDIT",
                # 角色管理
                "ROLE_MANAGE", "ROLE_CREATE", "ROLE_UPDATE", "ROLE_DELETE", "ROLE_VIEW", "ROLE_EDIT",
                # 教师管理
                "TEACHER_MANAGE", "TEACHER_CREATE", "TEACHER_VIEW", "TEACHER_EDIT", "TEACHER_DELETE",
                # 学生管理
                "STUDENT_MANAGE", "STUDENT_CREATE", "STUDENT_VIEW", "STUDENT_EDIT", "STUDENT_DELETE",
                # 课程管理
                "COURSE_MANAGE", "COURSE_CREATE", "COURSE_UPDATE", "COURSE_DELETE", "COURSE_VIEW", "COURSE_EDIT",
                # 开课管理
                "COURSE_OFFERING_MANAGE", "COURSE_OFFERING_CREATE", "COURSE_OFFERING_UPDATE",
                "COURSE_OFFERING_DELETE", "COURSE_OFFERING_VIEW", "COURSE_OFFERING_EDIT",
                # 选课管理
                "ENROLLMENT_MANAGE", "ENROLLMENT_APPROVE", "ENROLLMENT_VIEW", "ENROLLMENT_CREATE", 
                "ENROLLMENT_EDIT", "ENROLLMENT_DELETE",
                # 成绩管理
                "GRADE_MANAGE", "GRADE_INPUT", "GRADE_UPDATE", "GRADE_VIEW", "GRADE_EDIT",
                # 排课管理
                "SCHEDULE_MANAGE", "SCHEDULE_CREATE", "SCHEDULE_UPDATE", "SCHEDULE_DELETE",
                "SCHEDULE_VIEW", "SCHEDULE_EDIT",
                # 学籍管理
                "STUDENT_STATUS_MANAGE", "STUDENT_STATUS_UPDATE", "STUDENT_STATUS_VIEW",
                # 奖惩管理
                "REWARD_PUNISHMENT_MANAGE", "REWARD_PUNISHMENT_CREATE", "REWARD_PUNISHMENT_UPDATE",
                "REWARD_PUNISHMENT_DELETE", "REWARD_PUNISHMENT_VIEW",
                # 教室管理
                "CLASSROOM_MANAGE", "CLASSROOM_CREATE", "CLASSROOM_UPDATE", "CLASSROOM_DELETE",
                "CLASSROOM_VIEW", "CLASSROOM_EDIT",
                # 部门管理
                "DEPARTMENT_MANAGE", "DEPARTMENT_CREATE", "DEPARTMENT_UPDATE", "DEPARTMENT_DELETE",
                "DEPARTMENT_VIEW", "DEPARTMENT_EDIT",
                # 教师业务
                "MY_COURSES_VIEW", "STUDENT_LIST_VIEW",
                # 学生业务
                "MY_ENROLLMENT_VIEW", "MY_GRADE_VIEW", "MY_SCHEDULE_VIEW"
            ])
            print(f"用户是超级管理员，授予所有系统权限，共 {len(permissions_set)} 个权限")
        else:
            # 不是超级管理员，则从角色权限中获取
            if hasattr(user, 'roles') and user.roles:
                for role in user.roles:
                    # 收集该角色的所有权限
                    if hasattr(role, 'permissions') and role.permissions:
                        for perm in role.permissions:
                            if perm.status:  # 只添加启用的权限
                                permissions_set.add(perm.permission_code)
            
        # 转换权限集合为列表（无论是否为超级管理员，都在这里进行转换）
        permissions_list = list(permissions_set)
        
        # 打印完整的角色和权限信息，用于调试
        print("===================== 用户角色和权限详情 =====================")
        print(f"用户ID: {user.user_id}, 用户名: {user.username}")
        if user.roles:
            print(f"角色数量: {len(user.roles)}")
            for i, role in enumerate(user.roles):
                print(f"角色 {i+1}: {role.role_name} (code: {role.role_code}, status: {role.status})")
                if hasattr(role, 'permissions') and role.permissions:
                    print(f"  权限数量: {len(role.permissions)}")
                    for j, perm in enumerate(role.permissions):
                        print(f"  权限 {j+1}: {perm.permission_name} (code: {perm.permission_code}, status: {perm.status})")
                else:
                    print(f"  该角色没有权限")
        else:
            print("用户没有角色")

        print("================== 最终权限列表 ==================")
        print(f"权限列表长度: {len(permissions_list)}")
        print(f"权限列表前10项: {permissions_list[:10] if len(permissions_list) > 0 else '无权限'}")
        print("======================================================")
            
        # 构建用户信息对象，与前端期望格式完全一致
        user_info = {
            "user_id": user.user_id,
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
            "real_name": user.real_name,
            "status": user.status,
            "created_at": str(user.created_at),
            "updated_at": str(user.updated_at),
            "roles": [{"role_id": role.role_id, "role_name": role.role_name, "role_code": role.role_code} for role in user.roles if role.status],
            "permissions": permissions_list
        }
        
        print(f"用户详情构建成功，角色数量: {len(user.roles)}, 权限数量: {len(permissions_list)}")

        # 构建与前端期望格式完全一致的响应
        token_data = {
            "access_token": access_token,
            "token": access_token,  # 前端兼容性字段
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": user_info,  # 将user_info改为user，以适配前端期望的格式
            "refresh_token": access_token  # 添加refresh_token字段，保持与前端的兼容性
        }
        
        print(f"令牌数据构建成功")

        return APIResponse(
            code=0,
            message="登录成功",
            data=token_data
        )
    except Exception as e:
        # 记录详细错误信息
        error_msg = f"登录异常: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        
        # 返回统一格式的错误响应，避免500错误
        return APIResponse(
            code=BUSINESS_CODE.SERVER_ERROR,
            message=f"登录失败: {str(e)}",
            data=None
        )


@router.post("/logout", response_model=APIResponse)
def logout() -> Any:
    """
    用户登出
    """
    try:
        # 由于使用的是JWT，实际无需后端处理登出
        # 前端负责清除令牌
        return APIResponse(
            code=0,
            message="登出成功"
        )
    except Exception as e:
        error_msg = f"登出失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"登出失败: {str(e)}")


@router.get("/profile", response_model=APIResponse)
def get_profile(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    获取当前用户信息
    """
    try:
        # 重新查询用户信息，确保加载最新的角色和权限数据
        db = next(get_db())
        user = db.query(User).options(
            joinedload(User.roles).joinedload(Role.permissions)
        ).filter(User.user_id == current_user.user_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # 构建角色信息
        roles_data = []
        permissions_set = set()
        
        # 检查是否为超级管理员
        is_super_admin = any(role.role_code == 'SUPER_ADMIN' for role in user.roles if role.status)
        
        if user.roles:
            for role in user.roles:
                role_data = {
                    "role_id": role.role_id,
                    "role_name": role.role_name,
                    "role_code": role.role_code,
                    "description": role.description,
                    "status": role.status
                }
                
                roles_data.append(role_data)
        
        if is_super_admin:
            # 为超级管理员添加所有可能的权限常量
            permissions_set.update([
                # 用户管理
                "USER_MANAGE", "USER_CREATE", "USER_UPDATE", "USER_DELETE", "USER_VIEW", "USER_EDIT",
                # 角色管理
                "ROLE_MANAGE", "ROLE_CREATE", "ROLE_UPDATE", "ROLE_DELETE", "ROLE_VIEW", "ROLE_EDIT",
                # 教师管理
                "TEACHER_MANAGE", "TEACHER_CREATE", "TEACHER_VIEW", "TEACHER_EDIT", "TEACHER_DELETE",
                # 学生管理
                "STUDENT_MANAGE", "STUDENT_CREATE", "STUDENT_VIEW", "STUDENT_EDIT", "STUDENT_DELETE",
                # 课程管理
                "COURSE_MANAGE", "COURSE_CREATE", "COURSE_UPDATE", "COURSE_DELETE", "COURSE_VIEW", "COURSE_EDIT",
                # 开课管理
                "COURSE_OFFERING_MANAGE", "COURSE_OFFERING_CREATE", "COURSE_OFFERING_UPDATE",
                "COURSE_OFFERING_DELETE", "COURSE_OFFERING_VIEW", "COURSE_OFFERING_EDIT",
                # 选课管理
                "ENROLLMENT_MANAGE", "ENROLLMENT_APPROVE", "ENROLLMENT_VIEW", "ENROLLMENT_CREATE", 
                "ENROLLMENT_EDIT", "ENROLLMENT_DELETE",
                # 成绩管理
                "GRADE_MANAGE", "GRADE_INPUT", "GRADE_UPDATE", "GRADE_VIEW", "GRADE_EDIT",
                # 排课管理
                "SCHEDULE_MANAGE", "SCHEDULE_CREATE", "SCHEDULE_UPDATE", "SCHEDULE_DELETE",
                "SCHEDULE_VIEW", "SCHEDULE_EDIT",
                # 学籍管理
                "STUDENT_STATUS_MANAGE", "STUDENT_STATUS_UPDATE", "STUDENT_STATUS_VIEW",
                # 奖惩管理
                "REWARD_PUNISHMENT_MANAGE", "REWARD_PUNISHMENT_CREATE", "REWARD_PUNISHMENT_UPDATE",
                "REWARD_PUNISHMENT_DELETE", "REWARD_PUNISHMENT_VIEW",
                # 教室管理
                "CLASSROOM_MANAGE", "CLASSROOM_CREATE", "CLASSROOM_UPDATE", "CLASSROOM_DELETE",
                "CLASSROOM_VIEW", "CLASSROOM_EDIT",
                # 部门管理
                "DEPARTMENT_MANAGE", "DEPARTMENT_CREATE", "DEPARTMENT_UPDATE", "DEPARTMENT_DELETE",
                "DEPARTMENT_VIEW", "DEPARTMENT_EDIT",
                # 教师业务
                "MY_COURSES_VIEW", "STUDENT_LIST_VIEW",
                # 学生业务
                "MY_ENROLLMENT_VIEW", "MY_GRADE_VIEW"
            ])
            print(f"用户是超级管理员，授予所有系统权限，共 {len(permissions_set)} 个权限")
        else:
            # 不是超级管理员，则从角色权限中获取
            if hasattr(user, 'roles') and user.roles:
                for role in user.roles:
                    # 收集该角色的所有权限
                    if hasattr(role, 'permissions') and role.permissions:
                        for perm in role.permissions:
                            if perm.status:  # 只添加启用的权限
                                permissions_set.add(perm.permission_code)
        
        # 转换权限集合为列表
        permissions_list = list(permissions_set)
        print(f"用户权限列表: {permissions_list[:10] if permissions_list else '空'}")
        
        # 构建用户信息对象
        user_info = {
            "user_id": user.user_id,
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
            "real_name": user.real_name,
            "status": user.status,
            "created_at": str(user.created_at),
            "updated_at": str(user.updated_at),
            "roles": roles_data,
            "permissions": permissions_list
        }
        
        # 检查用户是否有关联的学生或教师信息
        if hasattr(user, 'student_info') and user.student_info:
            user_info["user_type"] = "student"
            user_info["student_id"] = user.student_info.student_id
        elif hasattr(user, 'teacher_info') and user.teacher_info:
            user_info["user_type"] = "teacher"
            user_info["teacher_id"] = user.teacher_info.teacher_id
        else:
            user_info["user_type"] = "admin"
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=user_info  # 直接返回user_info对象
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"获取用户信息失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取用户信息失败: {str(e)}")


@router.post("/change-password", response_model=APIResponse)
def change_password(
    password_data: ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    修改密码
    """
    if not security.verify_password(password_data.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="当前密码不正确")
    
    current_user.password = security.get_password_hash(password_data.new_password)
    db.commit()
    
    return APIResponse(
        code=0,
        message="密码修改成功"
    )


@router.post("/refresh", response_model=APIResponse)
def refresh_token(
    refresh_token: str = Body(..., embed=True),
    db: Session = Depends(get_db)
) -> Any:
    """
    刷新访问令牌
    """
    try:
        # 验证刷新令牌
        try:
            payload = jwt.decode(
                refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            user_id: str = payload.get("sub")
            if user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="无效的刷新令牌",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的刷新令牌",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # 查询用户
        user = db.query(User).options(
            joinedload(User.roles).joinedload(Role.permissions)
        ).filter(User.user_id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="用户不存在",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.status:
            raise HTTPException(status_code=400, detail="用户已被禁用")
        
        # 生成新的访问令牌
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = security.create_access_token(
            user.user_id, expires_delta=access_token_expires
        )
        
        # 构建用户详情（复用login_json中的代码）
        roles_data = []
        permissions_set = set()
        
        # 检查是否为超级管理员
        is_super_admin = any(role.role_code == 'SUPER_ADMIN' for role in user.roles if role.status)
        
        if user.roles:
            for role in user.roles:
                role_data = {
                    "role_id": role.role_id,
                    "role_name": role.role_name,
                    "role_code": role.role_code,
                    "description": role.description,
                    "status": role.status
                }
                
                roles_data.append(role_data)
        
        if is_super_admin:
            # 为超级管理员添加所有可能的权限常量
            permissions_set.update([
                # 用户管理
                "USER_MANAGE", "USER_CREATE", "USER_UPDATE", "USER_DELETE", "USER_VIEW", "USER_EDIT",
                # 角色管理
                "ROLE_MANAGE", "ROLE_CREATE", "ROLE_UPDATE", "ROLE_DELETE", "ROLE_VIEW", "ROLE_EDIT",
                # 教师管理
                "TEACHER_MANAGE", "TEACHER_CREATE", "TEACHER_VIEW", "TEACHER_EDIT", "TEACHER_DELETE",
                # 学生管理
                "STUDENT_MANAGE", "STUDENT_CREATE", "STUDENT_VIEW", "STUDENT_EDIT", "STUDENT_DELETE",
                # 课程管理
                "COURSE_MANAGE", "COURSE_CREATE", "COURSE_UPDATE", "COURSE_DELETE", "COURSE_VIEW", "COURSE_EDIT",
                # 开课管理
                "COURSE_OFFERING_MANAGE", "COURSE_OFFERING_CREATE", "COURSE_OFFERING_UPDATE",
                "COURSE_OFFERING_DELETE", "COURSE_OFFERING_VIEW", "COURSE_OFFERING_EDIT",
                # 选课管理
                "ENROLLMENT_MANAGE", "ENROLLMENT_APPROVE", "ENROLLMENT_VIEW", "ENROLLMENT_CREATE", 
                "ENROLLMENT_EDIT", "ENROLLMENT_DELETE",
                # 成绩管理
                "GRADE_MANAGE", "GRADE_INPUT", "GRADE_UPDATE", "GRADE_VIEW", "GRADE_EDIT",
                # 排课管理
                "SCHEDULE_MANAGE", "SCHEDULE_CREATE", "SCHEDULE_UPDATE", "SCHEDULE_DELETE",
                "SCHEDULE_VIEW", "SCHEDULE_EDIT",
                # 学籍管理
                "STUDENT_STATUS_MANAGE", "STUDENT_STATUS_UPDATE", "STUDENT_STATUS_VIEW",
                # 奖惩管理
                "REWARD_PUNISHMENT_MANAGE", "REWARD_PUNISHMENT_CREATE", "REWARD_PUNISHMENT_UPDATE",
                "REWARD_PUNISHMENT_DELETE", "REWARD_PUNISHMENT_VIEW",
                # 教室管理
                "CLASSROOM_MANAGE", "CLASSROOM_CREATE", "CLASSROOM_UPDATE", "CLASSROOM_DELETE",
                "CLASSROOM_VIEW", "CLASSROOM_EDIT",
                # 部门管理
                "DEPARTMENT_MANAGE", "DEPARTMENT_CREATE", "DEPARTMENT_UPDATE", "DEPARTMENT_DELETE",
                "DEPARTMENT_VIEW", "DEPARTMENT_EDIT",
                # 教师业务
                "MY_COURSES_VIEW", "STUDENT_LIST_VIEW",
                # 学生业务
                "MY_ENROLLMENT_VIEW", "MY_GRADE_VIEW"
            ])
            print(f"用户是超级管理员，授予所有系统权限，共 {len(permissions_set)} 个权限")
        else:
            # 收集所有角色的权限
            if hasattr(user, 'roles') and user.roles:
                for role in user.roles:
                    # 收集该角色的所有权限
                    if hasattr(role, 'permissions') and role.permissions:
                        for perm in role.permissions:
                            if perm.status:  # 只添加启用的权限
                                permissions_set.add(perm.permission_code)
                
        # 转换权限集合为列表（无论是否为超级管理员，都在这里进行转换）
        permissions_list = list(permissions_set)
        
        # 打印完整的角色和权限信息，用于调试
        print("===================== 用户角色和权限详情 =====================")
        print(f"用户ID: {user.user_id}, 用户名: {user.username}")
        if user.roles:
            print(f"角色数量: {len(user.roles)}")
            for i, role in enumerate(user.roles):
                print(f"角色 {i+1}: {role.role_name} (code: {role.role_code}, status: {role.status})")
                if hasattr(role, 'permissions') and role.permissions:
                    print(f"  权限数量: {len(role.permissions)}")
                    for j, perm in enumerate(role.permissions):
                        print(f"  权限 {j+1}: {perm.permission_name} (code: {perm.permission_code}, status: {perm.status})")
                else:
                    print(f"  该角色没有权限")
        else:
            print("用户没有角色")

        print("================== 最终权限列表 ==================")
        print(f"权限列表长度: {len(permissions_list)}")
        print(f"权限列表前10项: {permissions_list[:10] if len(permissions_list) > 0 else '无权限'}")
        print("======================================================")
            
        # 构建用户信息对象，与前端期望格式完全一致
        user_info = {
            "user_id": user.user_id,
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
            "real_name": user.real_name,
            "status": user.status,
            "created_at": str(user.created_at),
            "updated_at": str(user.updated_at),
            "roles": roles_data,
            "permissions": permissions_list
        }
        
        # 构建响应
        token_data = {
            "access_token": access_token,
            "token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": user_info,
            "refresh_token": access_token
        }
        
        return APIResponse(
            code=0,
            message="刷新令牌成功",
            data=token_data
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"刷新令牌失败: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"刷新令牌失败: {str(e)}"
        ) 