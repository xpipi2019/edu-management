"""
@fileoverview 教育管理系统后端数据库配置
@description SQLAlchemy数据库引擎、会话管理和数据库初始化
@author muelovo
@version 1.0.0
@date 2025-06-09
@license MIT
@copyright © 2025 muelovo. All rights reserved.
"""

from app.core.config import settings
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 这里使用绝对路径创建数据库
SQLALCHEMY_DATABASE_URL = f"sqlite:///{settings.DATABASE_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    获取数据库会话
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def clear_db():
    """
    清空数据库（测试用）
    """
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def init_db():
    """
    初始化数据库
    """
    Base.metadata.create_all(bind=engine)
    print("数据库初始化完成")
