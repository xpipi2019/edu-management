from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, Boolean, func, ForeignKey, Table
from sqlalchemy.orm import relationship

from app.db.database import Base

# 角色-权限关联表
role_permission = Table(
    "role_permission",
    Base.metadata,
    Column("role_id", Integer, ForeignKey("role.role_id"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permission.permission_id"), primary_key=True),
    Column("assigned_at", TIMESTAMP, server_default=func.now())
)

# 用户-角色关联表
user_role = Table(
    "user_role",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("user.user_id"), primary_key=True),
    Column("role_id", Integer, ForeignKey("role.role_id"), primary_key=True),
    Column("assigned_at", TIMESTAMP, server_default=func.now()),
    Column("assigned_by", Integer, ForeignKey("user.user_id"))
)


class Role(Base):
    __tablename__ = "role"

    role_id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(50), unique=True, nullable=False)
    role_code = Column(String(20), unique=True, nullable=False)
    description = Column(Text)
    status = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # 关系
    users = relationship(
        "User", 
        secondary="user_role", 
        back_populates="roles",
        primaryjoin="and_(Role.role_id==user_role.c.role_id)",
        secondaryjoin="and_(User.user_id==user_role.c.user_id)"
    )
    permissions = relationship("Permission", secondary=role_permission, back_populates="roles")


class Permission(Base):
    __tablename__ = "permission"

    permission_id = Column(Integer, primary_key=True, index=True)
    permission_name = Column(String(50), nullable=False)
    permission_code = Column(String(50), unique=True, nullable=False)
    module = Column(String(20), nullable=False)
    description = Column(Text)
    status = Column(Boolean, default=True)

    # 关系
    roles = relationship("Role", secondary=role_permission, back_populates="permissions") 