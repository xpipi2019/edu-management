from typing import Any, List
import traceback

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.api import deps
from app.db.database import get_db
from app.models.role import Role, Permission, role_permission
from app.schemas.common import APIResponse, PaginatedResponse
from app.schemas.role import (
    AssignPermissions, RoleCreate, RoleDetail, RoleResponse, RoleUpdate
)

router = APIRouter()


@router.get("", response_model=APIResponse)
def list_roles(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role_name: str = None,
    role_code: str = None,
    status: bool = None,
    _: Any = Depends(deps.check_permissions(["ROLE_VIEW"])),
) -> Any:
    """
    获取角色列表
    """
    try:
        # 使用joinedload预加载permissions关系，提高查询效率
        query = db.query(Role).options(joinedload(Role.permissions))
        
        # 应用过滤条件
        if role_name:
            query = query.filter(Role.role_name.like(f"%{role_name}%"))
        if role_code:
            query = query.filter(Role.role_code.like(f"%{role_code}%"))
        if status is not None:
            query = query.filter(Role.status == status)
        
        # 计算总数
        total = query.count()
        
        # 分页
        roles = query.offset((page - 1) * page_size).limit(page_size).all()
        
        # 构建响应
        role_list = []
        for role in roles:
            # 获取权限数量 - 只计算启用的权限
            active_permissions = [p for p in role.permissions if p.status]
            
            # 构建所有权限的ID列表，包括启用和禁用的
            permissions_simple = [{"permission_id": p.permission_id} for p in role.permissions]
            
            role_data = {
                "role_id": role.role_id,
                "role_name": role.role_name,
                "role_code": role.role_code,
                "description": role.description or "",
                "status": role.status,
                "permissions": permissions_simple,  # 提供完整的权限ID列表
                "permissionsCount": len(active_permissions),  # 只计算启用的权限数量
                "created_at": str(role.created_at) if role.created_at else "",
                "createdAt": str(role.created_at) if role.created_at else "",
                "updatedAt": ""  # Role模型中没有updated_at属性，设置为空字符串
            }
            role_list.append(role_data)
            
        # 与前端期望的格式一致
        result = {
            "list": role_list,
            "total": total,
            "page": page,
            "pageSize": page_size,
            "totalPages": (total + page_size - 1) // page_size
        }
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=result
        )
    except Exception as e:
        error_msg = f"获取角色列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return APIResponse(
            code=500,
            message=f"获取角色列表失败: {str(e)}",
            data=None
        )


@router.get("/all", response_model=APIResponse)
def get_all_roles(
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["ROLE_VIEW"])),
) -> Any:
    """
    获取所有角色（不分页）
    """
    roles = db.query(Role).filter(Role.status == True).all()
    role_responses = [RoleResponse.from_orm(role) for role in roles]
    
    return APIResponse(
        code=0,
        message="获取成功",
        data=role_responses
    )


@router.post("", response_model=APIResponse)
def create_role(
    role_in: RoleCreate,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["ROLE_CREATE"])),
) -> Any:
    """
    创建新角色
    """
    try:
        # 检查角色代码是否存在
        role = db.query(Role).filter(Role.role_code == role_in.role_code).first()
        if role:
            raise HTTPException(
                status_code=400,
                detail="角色代码已存在"
            )
        
        # 创建新角色
        from datetime import datetime
        current_time = datetime.now()
        
        db_role = Role(
            role_name=role_in.role_name,
            role_code=role_in.role_code,
            description=role_in.description,
            status=role_in.status,
            created_at=current_time
        )
        db.add(db_role)
        db.commit()
        db.refresh(db_role)
        
        # 构建响应
        role_response = RoleResponse(
            role_id=db_role.role_id,
            role_name=db_role.role_name,
            role_code=db_role.role_code,
            description=db_role.description,
            status=db_role.status
        )
        
        return APIResponse(
            code=0,
            message="创建成功",
            data=role_response
        )
    except HTTPException as e:
        # 直接重新抛出HTTP异常
        raise e
    except Exception as e:
        db.rollback()  # 发生错误时回滚事务
        print(f"创建角色失败: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"创建角色失败: {str(e)}"
        )


@router.get("/{role_id}", response_model=APIResponse)
def get_role(
    role_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["ROLE_VIEW"])),
) -> Any:
    """
    获取角色详情
    """
    try:
        # 使用joinedload预加载permissions关系
        role = db.query(Role).options(
            joinedload(Role.permissions)
        ).filter(Role.role_id == role_id).first()
        
        if not role:
            raise HTTPException(status_code=404, detail="角色不存在")
        
        # 返回所有权限，但只计算启用状态的权限数量
        active_permissions = [p for p in role.permissions if p.status]
        
        # 构建符合前端期望的响应格式
        role_data = {
            "role_id": role.role_id,
            "role_name": role.role_name,
            "role_code": role.role_code,
            "description": role.description or "",
            "status": role.status,
            "created_at": str(role.created_at) if role.created_at else "",
            "createdAt": str(role.created_at) if role.created_at else "",
            "updatedAt": "",  # Role模型中没有updated_at属性，设置为空字符串
            "permissions": [],
            "permissionsCount": len(active_permissions)
        }
        
        # 添加所有权限详细信息，包括禁用的权限
        for permission in role.permissions:
            permission_data = {
                "permission_id": permission.permission_id,
                "permission_name": permission.permission_name,
                "permission_code": permission.permission_code,
                "module": permission.module,
                "description": permission.description or "",
                "status": permission.status
            }
            role_data["permissions"].append(permission_data)
        
        return APIResponse(
            code=0, 
            message="获取成功", 
            data=role_data
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"获取角色详情失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return APIResponse(
            code=500,
            message=f"获取角色详情失败: {str(e)}",
            data=None
        )


@router.put("/{role_id}", response_model=APIResponse)
def update_role(
    role_id: int,
    role_in: RoleUpdate,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["ROLE_UPDATE"])),
) -> Any:
    """
    更新角色信息
    """
    role = db.query(Role).filter(Role.role_id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=404,
            detail="角色不存在"
        )
    
    # 检查角色名是否存在
    if role_in.role_name and role_in.role_name != role.role_name:
        existing_role = db.query(Role).filter(Role.role_name == role_in.role_name).first()
        if existing_role:
            raise HTTPException(
                status_code=400,
                detail="角色名已存在"
            )
    
    # 检查角色代码是否存在
    if role_in.role_code and role_in.role_code != role.role_code:
        existing_role = db.query(Role).filter(Role.role_code == role_in.role_code).first()
        if existing_role:
            raise HTTPException(
                status_code=400,
                detail="角色代码已存在"
            )
    
    # 更新角色信息
    update_data = role_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(role, key, value)
    
    db.commit()
    db.refresh(role)
    
    return APIResponse(
        code=0,
        message="更新成功",
        data=RoleResponse.from_orm(role)
    )


@router.delete("/{role_id}", response_model=APIResponse)
def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["ROLE_DELETE"])),
) -> Any:
    """
    删除角色
    """
    role = db.query(Role).filter(Role.role_id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=404,
            detail="角色不存在"
        )
    
    # 检查角色是否有关联用户
    if role.users:
        raise HTTPException(
            status_code=400,
            detail="该角色已分配给用户，无法删除"
        )
    
    db.delete(role)
    db.commit()
    
    return APIResponse(
        code=0,
        message="删除成功"
    )


@router.get("/{role_id}/permissions", response_model=APIResponse)
def get_role_permissions(
    role_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["ROLE_VIEW"])),
) -> Any:
    """
    获取角色权限
    """
    role = db.query(Role).filter(Role.role_id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=404,
            detail="角色不存在"
        )
    
    return APIResponse(
        code=0,
        message="获取成功",
        data=RoleDetail.from_orm(role).permissions
    )


@router.put("/{role_id}/assign-permissions", response_model=APIResponse)
def assign_permissions(
    role_id: int,
    permissions_in: AssignPermissions,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["ROLE_UPDATE"])),
) -> Any:
    """
    分配角色权限
    """
    try:
        role = db.query(Role).filter(Role.role_id == role_id).first()
        if not role:
            raise HTTPException(
                status_code=404,
                detail="角色不存在"
            )
        
        # 获取权限
        permissions = db.query(Permission).filter(
            Permission.permission_id.in_(permissions_in.permission_ids)
        ).all()
        
        # 分配权限
        role.permissions = permissions
        db.commit()
        db.refresh(role)
                
        # 构建响应，包括详细的角色信息和权限
        # 注意：需要获取所有权限（包括禁用的）以确保前端显示正确
        all_permissions = []
        for permission in role.permissions:
            permission_data = {
                "permission_id": permission.permission_id,
                "permission_name": permission.permission_name,
                "permission_code": permission.permission_code,
                "module": permission.module,
                "description": permission.description or "",
                "status": permission.status
            }
            all_permissions.append(permission_data)
        
        # 仅计算启用状态的权限数量
        active_permissions = [p for p in role.permissions if p.status]
        
        role_data = {
            "role_id": role.role_id,
            "role_name": role.role_name,
            "role_code": role.role_code,
            "description": role.description or "",
            "status": role.status,
            "created_at": str(role.created_at) if role.created_at else "",
            "createdAt": str(role.created_at) if role.created_at else "",
            "updatedAt": "",
            "permissions": all_permissions,  # 返回所有权限
            "permissionsCount": len(active_permissions)  # 只统计启用状态的权限
        }
        
        return APIResponse(
            code=0,
            message="权限分配成功",
            data=role_data
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"分配角色权限失败: {{str(e)}}\n{{traceback.format_exc()}}"
        print(error_msg)
        db.rollback()
        return APIResponse(
            code=500,
            message=f"分配角色权限失败: {{str(e)}}",
            data=None
        )
        
        # 获取权限
        permissions = db.query(Permission).filter(
            Permission.permission_id.in_(permissions_in.permission_ids)
        ).all()
        
        # 分配权限
        role.permissions = permissions
        db.commit()
        db.refresh(role)
                
        # 构建响应，包括详细的角色信息和权限
        # 注意：需要获取所有权限（包括禁用的）以确保前端显示正确
        all_permissions = []
        for permission in role.permissions:
            permission_data = {
                "permission_id": permission.permission_id,
                "permission_name": permission.permission_name,
                "permission_code": permission.permission_code,
                "module": permission.module,
                "description": permission.description or "",
                "status": permission.status
            }
            all_permissions.append(permission_data)
        
        # 仅计算启用状态的权限数量
        active_permissions = [p for p in role.permissions if p.status]
        
        role_data = {
            "role_id": role.role_id,
            "role_name": role.role_name,
            "role_code": role.role_code,
            "description": role.description or "",
            "status": role.status,
            "created_at": str(role.created_at) if role.created_at else "",
            "createdAt": str(role.created_at) if role.created_at else "",
            "updatedAt": "",
            "permissions": all_permissions,  # 返回所有权限
            "permissionsCount": len(active_permissions)  # 只统计启用状态的权限
        }
        
        return APIResponse(
            code=0,
            message="权限分配成功",
            data=role_data
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"分配角色权限失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        db.rollback()
        return APIResponse(
            code=500,
            message=f"分配角色权限失败: {str(e)}",
            data=None
        ) 