from typing import List, Optional
from pydantic import BaseModel, Field, validator
from decimal import Decimal


# 课程基本模型
class CourseBase(BaseModel):
    course_code: str = Field(..., min_length=3)
    course_name: str = Field(..., min_length=2)
    dept_id: int
    credits: float = Field(..., gt=0)
    hours: int = Field(..., gt=0)
    course_type: str
    description: Optional[str] = None
    status: bool = True

    @validator('course_type')
    def validate_course_type(cls, v):
        allowed_types = ['必修', '选修', '公选']
        if v not in allowed_types:
            raise ValueError(f'课程类型必须是以下之一: {", ".join(allowed_types)}')
        return v


# 创建课程请求体
class CourseCreate(CourseBase):
    pass


# 更新课程请求体
class CourseUpdate(BaseModel):
    course_code: Optional[str] = None
    course_name: Optional[str] = None
    dept_id: Optional[int] = None
    credits: Optional[float] = None
    hours: Optional[int] = None
    course_type: Optional[str] = None
    description: Optional[str] = None
    status: Optional[bool] = None

    @validator('course_type')
    def validate_course_type(cls, v):
        if v is not None:
            allowed_types = ['必修', '选修', '公选']
            if v not in allowed_types:
                raise ValueError(f'课程类型必须是以下之一: {", ".join(allowed_types)}')
        return v


# 课程响应模型
class CourseResponse(CourseBase):
    course_id: int

    class Config:
        from_attributes = True


# 课程详情响应
class CourseDetail(CourseResponse):
    department: Optional["DepartmentResponse"] = None

    class Config:
        from_attributes = True


# 开课基本模型
class CourseOfferingBase(BaseModel):
    course_id: int
    teacher_id: int
    semester: str = Field(..., min_length=6)
    max_students: int = Field(50, ge=1)
    current_students: int = 0
    status: bool = True


# 创建开课请求体
class CourseOfferingCreate(CourseOfferingBase):
    pass


# 更新开课请求体
class CourseOfferingUpdate(BaseModel):
    teacher_id: Optional[int] = None
    semester: Optional[str] = None
    max_students: Optional[int] = None
    status: Optional[bool] = None


# 开课响应模型
class CourseOfferingResponse(CourseOfferingBase):
    offering_id: int

    class Config:
        from_attributes = True


# 开课详情响应
class CourseOfferingDetail(CourseOfferingResponse):
    course: Optional[CourseResponse] = None
    teacher: Optional["TeacherResponse"] = None

    class Config:
        from_attributes = True


# 开课信息列表响应（使用视图）
class CourseOfferingInfo(BaseModel):
    offering_id: int
    course_code: str
    course_name: str
    credits: float
    hours: int
    course_type: str
    teacher_name: str
    dept_name: Optional[str] = None
    semester: str
    max_students: int
    current_students: int
    enrollment_rate: float

    class Config:
        from_attributes = True


# 导入
from app.schemas.department import DepartmentResponse
from app.schemas.teacher import TeacherResponse

CourseDetail.update_forward_refs()
CourseOfferingDetail.update_forward_refs() 