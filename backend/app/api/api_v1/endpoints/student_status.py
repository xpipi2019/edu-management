from typing import Any, List
import traceback
from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, and_, or_

from app.api import deps
from app.db.database import get_db
from app.models.student_status import StudentStatus
from app.models.student import Student
from app.models.user import User
from app.schemas.common import APIResponse, PaginatedResponse

router = APIRouter()


@router.get("", response_model=APIResponse)
def list_student_status(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    student_id: int = None,
    status_type: str = None,
    _: Any = Depends(deps.check_permissions(["STUDENT_STATUS_VIEW"])),
) -> Any:
    """
    获取学籍变更记录列表
    """
    try:
        # 创建一个包含关联对象的查询
        query = db.query(StudentStatus).options(
            joinedload(StudentStatus.student).joinedload(Student.user),
            joinedload(StudentStatus.handler)
        )
        
        # 应用过滤条件
        if student_id:
            query = query.filter(StudentStatus.student_id == student_id)
        if status_type:
            query = query.filter(StudentStatus.status_type == status_type)
        
        # 计算总数
        total = query.count()
        
        # 分页
        records = query.order_by(desc(StudentStatus.effective_date)).offset((page - 1) * pageSize).limit(pageSize).all()
        
        # 构建响应
        record_list = []
        for record in records:
            student_data = None
            if record.student:
                student_data = {
                    "student_id": record.student_id,
                    "student_no": record.student.student_no or "",
                    "user": {
                        "real_name": record.student.user.real_name if record.student.user else ""
                    }
                }
            
            handler_data = None
            if record.handler:
                handler_data = {
                    "user_id": record.handler_id,
                    "real_name": record.handler.real_name or ""
                }
                
            record_data = {
                "status_id": record.status_id,
                "student_id": record.student_id,
                "status_type": record.status_type,
                "effective_date": str(record.effective_date) if record.effective_date else "",
                "end_date": str(record.end_date) if record.end_date else "",
                "reason": record.reason or "",
                "handler_id": record.handler_id,
                "created_at": str(record.created_at) if record.created_at else "",
                "student": student_data,
                "handler": handler_data
            }
            record_list.append(record_data)
        
        # 前端期望的格式
        result = {
            "list": record_list,
            "total": total,
            "page": page,
            "pageSize": pageSize
        }
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=result
        )
    except Exception as e:
        error_msg = f"获取学籍变更记录失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取学籍变更记录失败: {str(e)}")


@router.post("", response_model=APIResponse)
def create_student_status(
    status_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    _: Any = Depends(deps.check_permissions(["STUDENT_STATUS_MANAGE"])),
) -> Any:
    """
    创建新学籍记录
    """
    try:
        # 检查必要参数
        required_fields = ["student_id", "status_type", "effective_date"]
        for field in required_fields:
            if field not in status_data or status_data[field] is None:
                raise HTTPException(status_code=400, detail=f"缺少参数: {field}")
        
        # 验证学生信息
        student = db.query(Student).options(
            joinedload(Student.user)
        ).filter(
            Student.student_id == status_data["student_id"]
        ).first()
        if not student:
            raise HTTPException(status_code=404, detail="学生不存在")
        
        # 创建新学籍记录
        new_status = StudentStatus(
            student_id=status_data["student_id"],
            status_type=status_data["status_type"],
            effective_date=status_data["effective_date"],
            end_date=status_data.get("end_date"),
            reason=status_data.get("reason", ""),
            handler_id=current_user.user_id
        )
        
        db.add(new_status)
        db.commit()
        db.refresh(new_status)

        # 构建响应数据
        student_data = None
        if student:
            student_data = {
                "student_id": student.student_id,
                "student_no": student.student_no or "",
                "user": {
                    "real_name": student.user.real_name if student.user else ""
                }
            }
        
        handler_data = None
        if current_user:
            handler_data = {
                "user_id": current_user.user_id,
                "real_name": current_user.real_name or ""
            }
        
        result = {
            "status_id": new_status.status_id,
            "student_id": new_status.student_id,
            "status_type": new_status.status_type,
            "effective_date": str(new_status.effective_date) if new_status.effective_date else "",
            "end_date": str(new_status.end_date) if new_status.end_date else "",
            "reason": new_status.reason or "",
            "handler_id": new_status.handler_id,
            "created_at": str(new_status.created_at) if new_status.created_at else "",
            "student": student_data,
            "handler": handler_data
        }
        
        return APIResponse(
            code=0,
            message="创建成功",
            data=result
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"创建学籍记录失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"创建学籍记录失败: {str(e)}")


@router.get("/{status_id}", response_model=APIResponse)
def get_student_status(
    status_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["STUDENT_STATUS_VIEW"])),
) -> Any:
    """
    获取学籍记录详情
    """
    try:
        status = db.query(StudentStatus).options(
            joinedload(StudentStatus.student).joinedload(Student.user),
            joinedload(StudentStatus.handler)
        ).filter(StudentStatus.status_id == status_id).first()
        
        if not status:
            return APIResponse(
                code=1,
                message="学籍记录不存在",
                data=None
            )
        
        # 构建学生数据
        student_data = None
        if status.student:
            student_data = {
                "student_id": status.student_id,
                "student_no": status.student.student_no or "",
                "user": {
                    "real_name": status.student.user.real_name if status.student.user else ""
                }
            }
        
        # 构建处理人数据
        handler_data = None
        if status.handler:
            handler_data = {
                "user_id": status.handler_id,
                "real_name": status.handler.real_name or ""
            }
        
        # 构建响应
        result = {
            "status_id": status.status_id,
            "student_id": status.student_id,
            "status_type": status.status_type,
            "effective_date": str(status.effective_date) if status.effective_date else "",
            "end_date": str(status.end_date) if status.end_date else "",
            "reason": status.reason or "",
            "handler_id": status.handler_id,
            "created_at": str(status.created_at) if status.created_at else "",
            "student": student_data,
            "handler": handler_data
        }
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=result
        )
    except Exception as e:
        error_msg = f"获取学籍记录详情失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取学籍记录详情失败: {str(e)}")


@router.put("/{status_id}", response_model=APIResponse)
def update_student_status(
    status_id: int,
    status_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    _: Any = Depends(deps.check_permissions(["STUDENT_STATUS_MANAGE"])),
) -> Any:
    """
    更新学籍记录
    """
    try:
        status = db.query(StudentStatus).options(
            joinedload(StudentStatus.student).joinedload(Student.user)
        ).filter(StudentStatus.status_id == status_id).first()
        
        if not status:
            return APIResponse(
                code=1,
                message="学籍记录不存在",
                data=None
            )
        
        # 更新字段
        update_fields = ["status_type", "effective_date", "end_date", "reason"]
        for field in update_fields:
            if field in status_data:
                setattr(status, field, status_data[field])
        
        # 更新处理人
        status.handler_id = current_user.user_id
        
        db.commit()
        db.refresh(status)
        
        # 构建学生数据
        student_data = None
        if status.student:
            student_data = {
                "student_id": status.student_id,
                "student_no": status.student.student_no or "",
                "user": {
                    "real_name": status.student.user.real_name if status.student.user else ""
                }
            }
        
        # 构建处理人数据
        handler_data = None
        if current_user:
            handler_data = {
                "user_id": current_user.user_id,
                "real_name": current_user.real_name or ""
            }
        
        # 构建响应
        result = {
            "status_id": status.status_id,
            "student_id": status.student_id,
            "status_type": status.status_type,
            "effective_date": str(status.effective_date) if status.effective_date else "",
            "end_date": str(status.end_date) if status.end_date else "",
            "reason": status.reason or "",
            "handler_id": status.handler_id,
            "created_at": str(status.created_at) if status.created_at else "",
            "student": student_data,
            "handler": handler_data
        }
        
        return APIResponse(
            code=0,
            message="更新成功",
            data=result
        )
    except Exception as e:
        error_msg = f"更新学籍记录失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"更新学籍记录失败: {str(e)}")


@router.delete("/{status_id}", response_model=APIResponse)
def delete_student_status(
    status_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["STUDENT_STATUS_MANAGE"])),
) -> Any:
    """
    删除学籍记录
    """
    try:
        status = db.query(StudentStatus).filter(StudentStatus.status_id == status_id).first()
        
        if not status:
            return APIResponse(
                code=1,
                message="学籍记录不存在",
                data=None
            )
        
        db.delete(status)
        db.commit()
        
        return APIResponse(
            code=0,
            message="删除成功",
            data=None
        )
    except Exception as e:
        error_msg = f"删除学籍记录失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"删除学籍记录失败: {str(e)}")


@router.get("/by-student/{student_id}", response_model=APIResponse)
def get_student_status_by_student(
    student_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["STUDENT_STATUS_VIEW"])),
) -> Any:
    """
    获取学生的学籍记录
    """
    try:
        statuses = db.query(StudentStatus).options(
            joinedload(StudentStatus.handler)
        ).filter(
            StudentStatus.student_id == student_id
        ).order_by(desc(StudentStatus.effective_date)).all()
        
        # 验证学生是否存在
        student = db.query(Student).options(
            joinedload(Student.user)
        ).filter(Student.student_id == student_id).first()
        
        if not student:
            return APIResponse(
                code=1,
                message="学生不存在",
                data=[]
            )
        
        # 构建学生数据
        student_data = {
            "student_id": student.student_id,
            "student_no": student.student_no or "",
            "user": {
                "real_name": student.user.real_name if student.user else ""
            }
        }
        
        # 构建响应
        status_list = []
        for status in statuses:
            # 构建处理人数据
            handler_data = None
            if status.handler:
                handler_data = {
                    "user_id": status.handler_id,
                    "real_name": status.handler.real_name or ""
                }
            
            status_data = {
                "status_id": status.status_id,
                "student_id": status.student_id,
                "status_type": status.status_type,
                "effective_date": str(status.effective_date) if status.effective_date else "",
                "end_date": str(status.end_date) if status.end_date else "",
                "reason": status.reason or "",
                "handler_id": status.handler_id,
                "created_at": str(status.created_at) if status.created_at else "",
                "student": student_data,
                "handler": handler_data
            }
            status_list.append(status_data)
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=status_list
        )
    except Exception as e:
        error_msg = f"获取学生学籍记录失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取学生学籍记录失败: {str(e)}")


@router.get("/by-type/{type}", response_model=APIResponse)
def get_student_status_by_type(
    type: str,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["STUDENT_STATUS_VIEW"])),
) -> Any:
    """
    获取指定类型的学籍记录
    """
    try:
        statuses = db.query(StudentStatus).options(
            joinedload(StudentStatus.student).joinedload(Student.user),
            joinedload(StudentStatus.handler)
        ).filter(
            StudentStatus.status_type == type
        ).order_by(desc(StudentStatus.effective_date)).all()
        
        # 构建响应
        status_list = []
        for status in statuses:
            # 构建学生数据
            student_data = None
            if status.student:
                student_data = {
                    "student_id": status.student_id,
                    "student_no": status.student.student_no or "",
                    "user": {
                        "real_name": status.student.user.real_name if status.student.user else ""
                    }
                }
            
            # 构建处理人数据
            handler_data = None
            if status.handler:
                handler_data = {
                    "user_id": status.handler_id,
                    "real_name": status.handler.real_name or ""
                }
            
            status_data = {
                "status_id": status.status_id,
                "student_id": status.student_id,
                "status_type": status.status_type,
                "effective_date": str(status.effective_date) if status.effective_date else "",
                "end_date": str(status.end_date) if status.end_date else "",
                "reason": status.reason or "",
                "handler_id": status.handler_id,
                "created_at": str(status.created_at) if status.created_at else "",
                "student": student_data,
                "handler": handler_data
            }
            status_list.append(status_data)
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=status_list
        )
    except Exception as e:
        error_msg = f"获取学籍记录失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取学籍记录失败: {str(e)}")


@router.get("/students/{student_id}/status-history", response_model=APIResponse)
def get_student_status_history(
    student_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["STUDENT_STATUS_VIEW"])),
) -> Any:
    """
    获取学生的学籍历史记录
    """
    try:
        statuses = db.query(StudentStatus).options(
            joinedload(StudentStatus.handler)
        ).filter(
            StudentStatus.student_id == student_id
        ).order_by(desc(StudentStatus.effective_date)).all()
        
        # 验证学生是否存在
        student = db.query(Student).options(
            joinedload(Student.user)
        ).filter(Student.student_id == student_id).first()
        
        if not student:
            return APIResponse(
                code=1,
                message="学生不存在",
                data=[]
            )
        
        # 构建学生数据
        student_data = {
            "student_id": student.student_id,
            "student_no": student.student_no or "",
            "user": {
                "real_name": student.user.real_name if student.user else ""
            }
        }
        
        # 构建响应
        status_list = []
        for status in statuses:
            # 构建处理人数据
            handler_data = None
            if status.handler:
                handler_data = {
                    "user_id": status.handler_id,
                    "real_name": status.handler.real_name or ""
                }
            
            status_data = {
                "status_id": status.status_id,
                "student_id": status.student_id,
                "status_type": status.status_type,
                "effective_date": str(status.effective_date) if status.effective_date else "",
                "end_date": str(status.end_date) if status.end_date else "",
                "reason": status.reason or "",
                "handler_id": status.handler_id,
                "created_at": str(status.created_at) if status.created_at else "",
                "student": student_data,
                "handler": handler_data
            }
            status_list.append(status_data)
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=status_list
        )
    except Exception as e:
        error_msg = f"获取学生学籍历史记录失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取学生学籍历史记录失败: {str(e)}")


@router.get("/students/{student_id}/current-status", response_model=APIResponse)
def get_student_current_status(
    student_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["STUDENT_STATUS_VIEW"])),
) -> Any:
    """
    获取学生当前的学籍状态
    """
    try:
        # 获取当前日期
        current_date = datetime.now().date()
        
        # 查询当前有效的学籍状态（effective_date <= 当前日期 且 end_date >= 当前日期或为空）
        current_status = db.query(StudentStatus).options(
            joinedload(StudentStatus.student).joinedload(Student.user),
            joinedload(StudentStatus.handler)
        ).filter(
            StudentStatus.student_id == student_id,
            StudentStatus.effective_date <= current_date,
            or_(
                StudentStatus.end_date >= current_date,
                StudentStatus.end_date.is_(None)
            )
        ).order_by(desc(StudentStatus.effective_date)).first()
        
        # 如果没有当前有效的状态，则获取最新的状态
        if not current_status:
            current_status = db.query(StudentStatus).options(
                joinedload(StudentStatus.student).joinedload(Student.user),
                joinedload(StudentStatus.handler)
            ).filter(
                StudentStatus.student_id == student_id
            ).order_by(desc(StudentStatus.effective_date)).first()
        
        # 如果学生没有任何状态记录
        if not current_status:
            return APIResponse(
                code=1,
                message="未找到学生的学籍状态",
                data=None
            )
        
        # 构建学生数据
        student_data = None
        if current_status.student:
            student_data = {
                "student_id": current_status.student_id,
                "student_no": current_status.student.student_no or "",
                "user": {
                    "real_name": current_status.student.user.real_name if current_status.student.user else ""
                }
            }
        
        # 构建处理人数据
        handler_data = None
        if current_status.handler:
            handler_data = {
                "user_id": current_status.handler_id,
                "real_name": current_status.handler.real_name or ""
            }
        
        # 构建响应
        result = {
            "status_id": current_status.status_id,
            "student_id": current_status.student_id,
            "status_type": current_status.status_type,
            "effective_date": str(current_status.effective_date) if current_status.effective_date else "",
            "end_date": str(current_status.end_date) if current_status.end_date else "",
            "reason": current_status.reason or "",
            "handler_id": current_status.handler_id,
            "created_at": str(current_status.created_at) if current_status.created_at else "",
            "student": student_data,
            "handler": handler_data
        }
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=result
        )
    except Exception as e:
        error_msg = f"获取学生当前学籍状态失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取学生当前学籍状态失败: {str(e)}") 