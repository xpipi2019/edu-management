from sqlalchemy import Column, Integer, String, Enum, Date, Text, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship

from app.db.database import Base


class StudentStatus(Base):
    __tablename__ = "student_status"

    status_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student.student_id"))
    status_type = Column(Enum('在读', '休学', '复学', '转学', '退学', '毕业'), nullable=False)
    effective_date = Column(Date, nullable=False)
    end_date = Column(Date)
    reason = Column(Text)
    handler_id = Column(Integer, ForeignKey("user.user_id"))
    created_at = Column(TIMESTAMP, server_default=func.now())

    # 关系
    student = relationship("Student", back_populates="status_records")
    handler = relationship("User")


class RewardPunishment(Base):
    __tablename__ = "reward_punishment"

    record_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student.student_id"))
    type = Column(Enum('奖励', '惩罚'), nullable=False)
    category = Column(String(50), nullable=False)
    description = Column(Text)
    occur_date = Column(Date, nullable=False)
    handler_id = Column(Integer, ForeignKey("user.user_id"))
    created_at = Column(TIMESTAMP, server_default=func.now())

    # 关系
    student = relationship("Student", back_populates="reward_punishments")
    handler = relationship("User") 