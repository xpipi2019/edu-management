"""
@fileoverview 教育管理系统后端API主入口文件
@description FastAPI应用初始化，配置CORS中间件和路由
@author muelovo
@version 1.0.0
@date 2025-06-09
@license MIT
@copyright © 2025 muelovo. All rights reserved.
"""

from app.api.api_v1.api import api_router
from app.core.config import settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="学校管理系统API",
    description="学校管理系统后端API",
    version="1.0.0",
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源，生产环境应当限制
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Type", "Authorization"],
)

# 包含API路由
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {"message": "欢迎使用学校管理系统API"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
