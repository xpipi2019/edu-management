"""
@fileoverview 教育管理系统后端安全模块
@description 提供密码加密、JWT令牌生成和验证等安全功能
@author muelovo
@version 1.0.0
@date 2025-06-09
@license MIT
@copyright © 2025 muelovo. All rights reserved.
"""

from datetime import datetime, timedelta
from typing import Any, Optional, Union

from app.core.config import settings
from jose import jwt
from passlib.context import CryptContext

# 密码上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# 验证密码
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# 创建密码哈希
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


# 创建JWT访问令牌
def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt
