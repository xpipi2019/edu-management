from sqlalchemy import Boolean, Column, Integer, String, Text, TIMESTAMP, func, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base
# 我们不直接导入user_role，而是引用字符串


class User(Base):
    __tablename__ = "user"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    email = Column(String(100), unique=True, index=True)
    phone = Column(String(11))
    real_name = Column(String(20), nullable=False)
    status = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # 关系
    roles = relationship(
        "Role", 
        secondary="user_role", 
        back_populates="users",
        primaryjoin="and_(User.user_id==user_role.c.user_id)",
        secondaryjoin="and_(Role.role_id==user_role.c.role_id)"
    )
    teacher_info = relationship("Teacher", uselist=False, back_populates="user")
    student_info = relationship("Student", uselist=False, back_populates="user") 