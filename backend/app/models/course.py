from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, Enum, DECIMAL, TIMESTAMP, func
from sqlalchemy.orm import relationship

from app.db.database import Base


class Course(Base):
    __tablename__ = "course"

    course_id = Column(Integer, primary_key=True, index=True)
    course_code = Column(String(20), unique=True, nullable=False)
    course_name = Column(String(100), nullable=False)
    dept_id = Column(Integer, ForeignKey("department.dept_id"))
    credits = Column(DECIMAL(3, 1), nullable=False)
    hours = Column(Integer, nullable=False)
    course_type = Column(Enum('必修', '选修', '公选'), nullable=False)
    description = Column(Text)
    status = Column(Boolean, default=True)

    # 关系
    department = relationship("Department", back_populates="courses")
    offerings = relationship("CourseOffering", back_populates="course")


class CourseOffering(Base):
    __tablename__ = "course_offering"

    offering_id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("course.course_id"))
    teacher_id = Column(Integer, ForeignKey("teacher.teacher_id"))
    semester = Column(String(20), nullable=False)
    max_students = Column(Integer, default=50)
    current_students = Column(Integer, default=0)
    status = Column(Boolean, default=True)

    # 关系
    course = relationship("Course", back_populates="offerings")
    teacher = relationship("Teacher", back_populates="course_offerings")
    enrollments = relationship("Enrollment", back_populates="offering")
    schedules = relationship("Schedule", back_populates="offering")


class Schedule(Base):
    __tablename__ = "schedule"

    schedule_id = Column(Integer, primary_key=True, index=True)
    offering_id = Column(Integer, ForeignKey("course_offering.offering_id"))
    classroom_id = Column(Integer, ForeignKey("classroom.classroom_id"))
    day_of_week = Column(Integer, nullable=False)  # 1-7 表示周一到周日
    start_time = Column(String(5), nullable=False)  # 格式 "HH:MM"
    end_time = Column(String(5), nullable=False)  # 格式 "HH:MM"
    weeks = Column(String(50), nullable=False)  # 例如 "1-16"表示第1到16周

    # 关系
    offering = relationship("CourseOffering", back_populates="schedules")
    classroom = relationship("Classroom", back_populates="schedules")


class Classroom(Base):
    __tablename__ = "classroom"

    classroom_id = Column(Integer, primary_key=True, index=True)
    room_no = Column(String(20), unique=True, nullable=False)
    building = Column(String(50), nullable=False)
    floor = Column(Integer)
    capacity = Column(Integer, nullable=False)
    room_type = Column(Enum('普通教室', '实验室', '多媒体教室', '机房'), nullable=False)
    equipment = Column(Text)
    status = Column(Integer, default=1)  # 0=停用, 1=可用, 2=维护中

    # 关系
    schedules = relationship("Schedule", back_populates="classroom") 