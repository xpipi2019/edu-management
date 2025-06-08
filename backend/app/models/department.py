from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class Department(Base):
    __tablename__ = "department"

    dept_id = Column(Integer, primary_key=True, index=True)
    dept_name = Column(String(50), nullable=False)
    dept_code = Column(String(20), unique=True, nullable=False)
    parent_id = Column(Integer, ForeignKey("department.dept_id"))
    description = Column(Text)
    status = Column(Boolean, default=True)

    # 关系
    parent = relationship("Department", remote_side=[dept_id], backref="children")
    teachers = relationship("Teacher", back_populates="department")
    students = relationship("Student", back_populates="department")
    courses = relationship("Course", back_populates="department") 