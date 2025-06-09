"""
@fileoverview 教育管理系统后端配置文件
@description 定义应用的全局配置、数据库连接和环境变量
@author muelovo
@version 1.0.0
@date 2025-06-09
@license MIT
@copyright © 2025 muelovo. All rights reserved.
"""

import os
from typing import Any, Dict, Optional

from pydantic import MySQLDsn, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # 数据库配置
    DATABASE_URL: Optional[MySQLDsn] = (
        "mysql+pymysql://root:tiger@localhost:3306/school_management_system"
    )

    @validator("DATABASE_URL", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return MySQLDsn.build(
            scheme="mysql+pymysql",
            username=values.get("MYSQL_USER", "root"),
            password=values.get("MYSQL_PASSWORD", "tiger"),
            host=values.get("MYSQL_HOST", "localhost"),
            port=values.get("MYSQL_PORT", "3306"),
            path=f"/{values.get('MYSQL_DB', 'school_management_system')}",
        )

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
