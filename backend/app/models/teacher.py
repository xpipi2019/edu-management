from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class Teacher(Base):
    __tablename__ = "teacher"

    teacher_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.user_id"), unique=True)
    teacher_no = Column(String(20), unique=True, nullable=False)
    dept_id = Column(Integer, ForeignKey("department.dept_id"))
    title = Column(String(20))
    hire_date = Column(Date)
    status = Column(Boolean, default=True)

    # 关系
    user = relationship("User", back_populates="teacher_info")
    department = relationship("Department", back_populates="teachers")
    course_offerings = relationship("CourseOffering", back_populates="teacher") 