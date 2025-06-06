from typing import List, Optional
from pydantic import BaseModel, Field


# 权限基本模型
class PermissionBase(BaseModel):
    permission_name: str
    permission_code: str
    module: str
    description: Optional[str] = None
    status: bool = True


# 权限响应模型
class PermissionResponse(PermissionBase):
    permission_id: int

    class Config:
        from_attributes = True


# 角色基本模型
class RoleBase(BaseModel):
    role_name: str = Field(..., min_length=2)
    role_code: str = Field(..., min_length=2)
    description: Optional[str] = None
    status: bool = True


# 创建角色请求体
class RoleCreate(RoleBase):
    pass


# 更新角色请求体
class RoleUpdate(BaseModel):
    role_name: Optional[str] = None
    role_code: Optional[str] = None
    description: Optional[str] = None
    status: Optional[bool] = None


# 角色响应模型
class RoleResponse(RoleBase):
    role_id: int

    class Config:
        from_attributes = True


# 角色详情响应模型
class RoleDetail(RoleResponse):
    permissions: List[PermissionResponse] = []

    class Config:
        from_attributes = True


# 权限分配请求体
class AssignPermissions(BaseModel):
    permission_ids: List[int]


# 权限模块响应
class ModulePermissions(BaseModel):
    module: str
    permissions: List[PermissionResponse] 