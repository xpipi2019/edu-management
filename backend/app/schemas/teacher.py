from datetime import date
from typing import List, Optional
from pydantic import BaseModel, Field


# 教师基本模型
class TeacherBase(BaseModel):
    teacher_no: str = Field(..., min_length=6)
    dept_id: int
    title: Optional[str] = None
    hire_date: Optional[date] = None
    status: bool = True


# 创建教师请求体
class TeacherCreate(TeacherBase):
    user_id: int


# 更新教师请求体
class TeacherUpdate(BaseModel):
    teacher_no: Optional[str] = None
    dept_id: Optional[int] = None
    title: Optional[str] = None
    hire_date: Optional[date] = None
    status: Optional[bool] = None


# 教师响应模型
class TeacherResponse(TeacherBase):
    teacher_id: int
    user_id: int

    class Config:
        from_attributes = True


# 教师详情响应
class TeacherDetail(TeacherResponse):
    user_info: Optional["UserResponse"] = None
    department: Optional["DepartmentResponse"] = None

    class Config:
        from_attributes = True


# 教师信息列表响应（使用视图）
class TeacherInfo(BaseModel):
    teacher_id: int
    teacher_no: str
    real_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    dept_name: Optional[str] = None
    title: Optional[str] = None
    hire_date: Optional[date] = None

    class Config:
        from_attributes = True


# 导入
from app.schemas.user import UserResponse
from app.schemas.department import DepartmentResponse

TeacherDetail.update_forward_refs() 