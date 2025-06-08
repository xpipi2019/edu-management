from typing import Generator, Optional
import traceback

from fastapi import Depends, HTTPException, status, Header, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.db.database import get_db
from app.models.user import User
from app.models.role import Role, Permission
from app.schemas.user import UserDetail

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


def get_current_user(
    db: Session = Depends(get_db), 
    token: str = Depends(oauth2_scheme),
    authorization: str = Header(None)
) -> User:
    """
    从JWT令牌获取当前用户
    """
    try:
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无法验证凭据",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        # 如果oauth2_scheme没有提供token，则尝试从header中获取
        if token == "undefined" and authorization and authorization.startswith("Bearer "):
            token = authorization.replace("Bearer ", "")
        
        if not token or token == "undefined":
            raise credentials_exception
            
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            user_id: str = payload.get("sub")
            if user_id is None:
                raise credentials_exception
        except (JWTError, ValidationError):
            raise credentials_exception
        
        # 使用joinedload预加载roles关系
        user = db.query(User).options(joinedload(User.roles)).filter(User.user_id == user_id).first()
        
        if user is None:
            raise credentials_exception
        if not user.status:
            raise HTTPException(status_code=400, detail="用户已被禁用")
            
        return user
    except Exception as e:
        print(traceback.format_exc())
        raise


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    获取当前活跃用户
    """
    if not current_user.status:
        raise HTTPException(status_code=400, detail="用户已被禁用")
    return current_user


def check_permissions(required_permissions: list = None, required: bool = True):
    """
    检查用户是否具有所需权限
    """
    def permissions_checker(
        db: Session = Depends(get_db),
        current_user: Optional[User] = Depends(get_current_user)
    ):
        try:
            # 如果不需要权限，直接通过
            if not required_permissions:
                return True
            
            # 确保current_user非空
            if not current_user:
                if required:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="未认证用户",
                    )
                return False
            
            # 超级管理员自动拥有所有权限
            try:
                if current_user.username == "admin":
                    return True
                
                if hasattr(current_user, 'roles'):
                    for role in current_user.roles:
                        if hasattr(role, 'role_code') and hasattr(role, 'status') and role.status and role.role_code == "SUPER_ADMIN":
                            return True
            except Exception as e:
                print(f"检查超级管理员权限时出错: {str(e)}")
                # 继续执行，不中断检查
            
            # 为了确保权限被正确加载，在这里重新查询用户并加载完整的权限关系
            user_with_permissions = None
            try:
                user_with_permissions = db.query(User).options(
                    joinedload(User.roles).joinedload(Role.permissions)
                ).filter(User.user_id == current_user.user_id).first()
            except Exception as e:
                print(f"获取用户权限时出错: {str(e)}\n{traceback.format_exc()}")
                # 如果查询失败但不要求权限，则返回False
                if not required:
                    return False
                
                # 容错处理：如果无法获取权限信息，但用户已通过认证，可以选择允许访问
                # 或者返回更友好的错误信息，而不是500错误
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="无法验证权限，请重试",
                )
            
            if not user_with_permissions:
                if required:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="用户不存在",
                    )
                return False
            
            # 获取用户所有权限代码
            user_permissions = set()
            try:
                if hasattr(user_with_permissions, 'roles') and user_with_permissions.roles:
                    for role in user_with_permissions.roles:
                        # 安全地检查role.status
                        if not hasattr(role, 'status') or not role.status:
                            continue
                        
                        # 如果是超级管理员角色，授予所有权限
                        if hasattr(role, 'role_code') and role.role_code == "SUPER_ADMIN":
                            return True
                        
                        # 安全地检查和处理权限
                        if hasattr(role, "permissions") and role.permissions:
                            for permission in role.permissions:
                                if (hasattr(permission, "permission_code") and 
                                    hasattr(permission, 'status') and 
                                    permission.status):
                                    user_permissions.add(permission.permission_code)
            except Exception as e:
                print(f"处理用户权限时出错: {str(e)}")
                # 如果处理权限出错但不要求权限，则返回False
                if not required:
                    return False
                
                # 容错处理
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="权限验证错误，请重试",
                )
            
            # 检查是否有所需权限
            for permission in required_permissions:
                if permission in user_permissions:
                    return True
            
            # 没有权限
            if required:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="权限不足",
                )
            return False
        except HTTPException:
            raise
        except Exception as e:
            print(f"权限检查失败: {str(e)}\n{traceback.format_exc()}")
            if required:
                # 返回403而不是500，对用户更友好
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="权限检查失败，请重试",
                )
            return False
    
    return permissions_checker
