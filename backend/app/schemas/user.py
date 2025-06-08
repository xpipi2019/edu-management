from typing import List, Optional, Any, Dict, Union
from pydantic import BaseModel, EmailStr, Field

# 不再直接导入RoleResponse
# from app.schemas.role import RoleResponse


# 基本用户模型
class UserBase(BaseModel):
    username: str = Field(..., min_length=3)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    real_name: str = Field(..., min_length=2)
    status: Optional[bool] = True


# 创建用户时的请求体
class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


# 更新用户时的请求体
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    real_name: Optional[str] = None
    status: Optional[bool] = None


# 修改密码请求体
class ChangePassword(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)


# 重置密码请求体
class ResetPassword(BaseModel):
    new_password: str = Field(..., min_length=6)


# 角色分配请求体
class AssignRoles(BaseModel):
    role_ids: List[int]


# 用户响应模型
class UserResponse(UserBase):
    user_id: int
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


# 用户详情响应模型
class UserDetail(UserResponse):
    # 使用更通用的字典类型，避免循环导入
    roles: List[Dict[str, Any]] = []

    class Config:
        from_attributes = True


# 登录请求体
class Login(BaseModel):
    username: str
    password: str


# Token响应模型
class Token(BaseModel):
    access_token: str
    token: str  # 添加token字段作为access_token的别名
    token_type: str = "bearer"
    expires_in: int
    user_info: Dict[str, Any]  # 使用Dict类型避免循环引用问题

    def __init__(self, **data):
        super().__init__(**data)
        # 确保token字段与access_token保持一致
        if "access_token" in data and "token" not in data:
            self.token = data["access_token"]

# 更新forward refs
UserDetail.update_forward_refs() 