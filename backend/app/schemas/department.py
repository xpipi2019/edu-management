from typing import List, Optional
from pydantic import BaseModel, Field


# 部门基本模型
class DepartmentBase(BaseModel):
    dept_name: str = Field(..., min_length=2)
    dept_code: str = Field(..., min_length=2)
    parent_id: Optional[int] = None
    description: Optional[str] = None
    status: bool = True


# 创建部门请求体
class DepartmentCreate(DepartmentBase):
    pass


# 更新部门请求体
class DepartmentUpdate(BaseModel):
    dept_name: Optional[str] = None
    dept_code: Optional[str] = None
    parent_id: Optional[int] = None
    description: Optional[str] = None
    status: Optional[bool] = None


# 部门响应模型
class DepartmentResponse(DepartmentBase):
    dept_id: int

    class Config:
        from_attributes = True


# 部门树节点
class DepartmentNode(DepartmentResponse):
    children: List["DepartmentNode"] = []

    class Config:
        from_attributes = True


# 前向引用更新
DepartmentNode.update_forward_refs() 