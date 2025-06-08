from sqlalchemy import Column, Integer, ForeignKey, TIMESTAMP, Boolean, DECIMAL, func
from sqlalchemy.orm import relationship

from app.db.database import Base


class Enrollment(Base):
    __tablename__ = "enrollment"

    enrollment_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student.student_id"))
    offering_id = Column(Integer, ForeignKey("course_offering.offering_id"))
    enrollment_date = Column(TIMESTAMP, server_default=func.now())
    status = Column(Boolean, default=True)  # 0: 退选, 1: 已选, 2: 待审批

    # 关系
    student = relationship("Student", back_populates="enrollments")
    offering = relationship("CourseOffering", back_populates="enrollments")
    grade = relationship("Grade", uselist=False, back_populates="enrollment")


class Grade(Base):
    __tablename__ = "grade"

    grade_id = Column(Integer, primary_key=True, index=True)
    enrollment_id = Column(Integer, ForeignKey("enrollment.enrollment_id"), unique=True)
    usual_score = Column(DECIMAL(5, 2))
    exam_score = Column(DECIMAL(5, 2))
    final_score = Column(DECIMAL(5, 2))
    grade_point = Column(DECIMAL(3, 2))
    recorded_by = Column(Integer, ForeignKey("teacher.teacher_id"))
    recorded_at = Column(TIMESTAMP, server_default=func.now())

    # 关系
    enrollment = relationship("Enrollment", back_populates="grade")
    recorder = relationship("Teacher") 