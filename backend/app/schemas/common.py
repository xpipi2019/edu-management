from typing import Any, Dict, Generic, List, Optional, TypeVar, Union
from pydantic import BaseModel, Field
from pydantic.generics import GenericModel

T = TypeVar('T')


# 标准API响应
class APIResponse(BaseModel):
    code: int = 0
    message: str = "操作成功"
    data: Optional[Any] = None


# 分页请求参数
class PaginationParams(BaseModel):
    page: int = Field(1, ge=1, description="页码")
    page_size: int = Field(20, ge=1, le=100, description="每页条数")


# 分页响应
class PaginatedResponse(GenericModel, Generic[T]):
    list: List[T]
    total: int
    page: int
    pageSize: int
    totalPages: int


# 批量删除请求
class BatchDeleteRequest(BaseModel):
    ids: List[int]


# ID响应
class IDResponse(BaseModel):
    id: int 