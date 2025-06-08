from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class Student(Base):
    __tablename__ = "student"

    student_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.user_id"), unique=True)
    student_no = Column(String(20), unique=True, nullable=False)
    dept_id = Column(Integer, ForeignKey("department.dept_id"))
    class_name = Column(String(50))
    grade = Column(Integer)
    enrollment_year = Column(Integer)
    graduation_year = Column(Integer)

    # 关系
    user = relationship("User", back_populates="student_info")
    department = relationship("Department", back_populates="students")
    enrollments = relationship("Enrollment", back_populates="student")
    status_records = relationship("StudentStatus", back_populates="student")
    reward_punishments = relationship("RewardPunishment", back_populates="student") 