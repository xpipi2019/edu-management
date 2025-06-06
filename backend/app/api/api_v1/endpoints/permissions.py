from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.db.database import get_db
from app.models.role import Permission
from app.schemas.common import APIResponse, PaginatedResponse
from app.schemas.role import PermissionResponse, ModulePermissions

router = APIRouter()


@router.get("", response_model=APIResponse)
def list_permissions(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    permission_name: str = None,
    permission_code: str = None,
    module: str = None,
    _: Any = Depends(deps.check_permissions(["ROLE_VIEW"])),
) -> Any:
    """
    获取权限列表
    """
    query = db.query(Permission)
    
    # 应用过滤条件
    if permission_name:
        query = query.filter(Permission.permission_name.like(f"%{permission_name}%"))
    if permission_code:
        query = query.filter(Permission.permission_code.like(f"%{permission_code}%"))
    if module:
        query = query.filter(Permission.module == module)
    
    # 计算总数
    total = query.count()
    
    # 分页
    permissions = query.offset((page - 1) * page_size).limit(page_size).all()
    
    # 构建响应
    permission_responses = [PermissionResponse.from_orm(permission) for permission in permissions]
    paginated_response = PaginatedResponse(
        list=permission_responses,
        total=total,
        page=page,
        pageSize=page_size,
        totalPages=(total + page_size - 1) // page_size
    )
    
    return APIResponse(
        code=0,
        message="获取成功",
        data=paginated_response
    )


@router.get("/all", response_model=APIResponse)
def get_all_permissions(
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["ROLE_VIEW"])),
) -> Any:
    """
    获取所有权限（不分页）
    """
    # 获取所有权限，包括启用和禁用状态的
    permissions = db.query(Permission).all()
    permission_responses = [PermissionResponse.from_orm(permission) for permission in permissions]
    
    return APIResponse(
        code=0,
        message="获取成功",
        data=permission_responses
    )


@router.get("/by-module", response_model=APIResponse)
def get_permissions_by_module(
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["ROLE_VIEW"])),
) -> Any:
    """
    按模块获取权限
    """
    # 获取所有权限，包括启用和禁用状态的
    permissions = db.query(Permission).all()
    
    # 按模块分组
    modules_dict: Dict[str, List[PermissionResponse]] = {}
    for permission in permissions:
        module = permission.module
        if module not in modules_dict:
            modules_dict[module] = []
        modules_dict[module].append(PermissionResponse.from_orm(permission))
    
    # 直接返回字典
    return APIResponse(
        code=0,
        message="获取成功",
        data=modules_dict
    )


@router.get("/modules", response_model=APIResponse)
def get_permission_modules(
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["ROLE_VIEW"])),
) -> Any:
    """
    获取所有权限模块
    """
    modules = db.query(Permission.module).distinct().all()
    module_list = [module[0] for module in modules]
    
    return APIResponse(
        code=0,
        message="获取成功",
        data=module_list
    ) 