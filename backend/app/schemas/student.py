from typing import List, Optional
from pydantic import BaseModel, Field


# 学生基本模型
class StudentBase(BaseModel):
    student_no: str = Field(..., min_length=6)
    dept_id: int
    class_name: Optional[str] = None
    grade: Optional[int] = None
    enrollment_year: Optional[int] = None
    graduation_year: Optional[int] = None


# 创建学生请求体
class StudentCreate(StudentBase):
    user_id: int


# 更新学生请求体
class StudentUpdate(BaseModel):
    student_no: Optional[str] = None
    dept_id: Optional[int] = None
    class_name: Optional[str] = None
    grade: Optional[int] = None
    enrollment_year: Optional[int] = None
    graduation_year: Optional[int] = None


# 学生响应模型
class StudentResponse(StudentBase):
    student_id: int
    user_id: int

    class Config:
        from_attributes = True


# 学生详情响应
class StudentDetail(StudentResponse):
    user_info: Optional["UserResponse"] = None
    department: Optional["DepartmentResponse"] = None

    class Config:
        from_attributes = True


# 学生信息列表响应（使用视图）
class StudentInfo(BaseModel):
    student_id: int
    student_no: str
    real_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    dept_name: Optional[str] = None
    class_name: Optional[str] = None
    grade: Optional[int] = None
    enrollment_year: Optional[int] = None
    graduation_year: Optional[int] = None

    class Config:
        from_attributes = True


# 成绩单响应
class TranscriptItem(BaseModel):
    course_code: str
    course_name: str
    credits: float
    semester: str
    final_score: float
    grade_point: float
    grade_level: str


# 学生成绩单
class StudentTranscript(BaseModel):
    student_no: str
    student_name: str
    total_credits: float
    gpa: float
    courses: List[TranscriptItem]


# 导入
from app.schemas.user import UserResponse
from app.schemas.department import DepartmentResponse

StudentDetail.update_forward_refs() 