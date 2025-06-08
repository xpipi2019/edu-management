from typing import Any, List, Dict
import traceback
from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func, and_, or_

from app.api import deps
from app.db.database import get_db
from app.models.student_status import RewardPunishment
from app.models.student import Student
from app.models.user import User
from app.schemas.common import APIResponse, PaginatedResponse

router = APIRouter()


@router.get("", response_model=APIResponse)
def list_reward_punishment(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    student_id: int = None,
    type: str = None,
    category: str = None,
    _: Any = Depends(deps.check_permissions(["REWARD_PUNISHMENT_VIEW"])),
) -> Any:
    """
    获取奖惩记录列表
    """
    try:
        # 创建一个包含关联对象的查询
        query = db.query(RewardPunishment).options(
            joinedload(RewardPunishment.student).joinedload(Student.user),
            joinedload(RewardPunishment.handler)
        )
        
        # 应用过滤条件
        if student_id:
            query = query.filter(RewardPunishment.student_id == student_id)
        if type:
            query = query.filter(RewardPunishment.type == type)
        if category:
            query = query.filter(RewardPunishment.category == category)
        
        # 计算总数
        total = query.count()
        
        # 分页
        records = query.order_by(desc(RewardPunishment.occur_date), desc(RewardPunishment.created_at)).offset((page - 1) * pageSize).limit(pageSize).all()
        
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
                "record_id": record.record_id,
                "student_id": record.student_id,
                "type": record.type,
                "category": record.category,
                "description": record.description,
                "occur_date": str(record.occur_date) if record.occur_date else "",
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
        error_msg = f"获取奖惩记录失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取奖惩记录失败: {str(e)}")


@router.post("", response_model=APIResponse)
def create_reward_punishment(
    record_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    _: Any = Depends(deps.check_permissions(["REWARD_PUNISHMENT_MANAGE"])),
) -> Any:
    """
    创建新奖惩记录
    """
    try:
        # 检查必要参数
        required_fields = ["student_id", "type", "category", "occur_date"]
        for field in required_fields:
            if field not in record_data or record_data[field] is None:
                raise HTTPException(status_code=400, detail=f"缺少参数: {field}")
        
        # 验证学生信息
        student = db.query(Student).options(
            joinedload(Student.user)
        ).filter(
            Student.student_id == record_data["student_id"]
        ).first()
        if not student:
            raise HTTPException(status_code=404, detail="学生不存在")
        
        # 创建新奖惩记录
        new_record = RewardPunishment(
            student_id=record_data["student_id"],
            type=record_data["type"],
            category=record_data["category"],
            description=record_data.get("description", ""),
            occur_date=record_data["occur_date"],
            handler_id=current_user.user_id
        )
        
        db.add(new_record)
        db.commit()
        db.refresh(new_record)

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
            "record_id": new_record.record_id,
            "student_id": new_record.student_id,
            "type": new_record.type,
            "category": new_record.category,
            "description": new_record.description,
            "occur_date": str(new_record.occur_date) if new_record.occur_date else "",
            "handler_id": new_record.handler_id,
            "created_at": str(new_record.created_at) if new_record.created_at else "",
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
        error_msg = f"创建奖惩记录失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"创建奖惩记录失败: {str(e)}")


@router.get("/{record_id}", response_model=APIResponse)
def get_reward_punishment(
    record_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["REWARD_PUNISHMENT_VIEW"])),
) -> Any:
    """
    获取奖惩记录详情
    """
    try:
        record = db.query(RewardPunishment).options(
            joinedload(RewardPunishment.student).joinedload(Student.user),
            joinedload(RewardPunishment.handler)
        ).filter(RewardPunishment.record_id == record_id).first()
        
        if not record:
            return APIResponse(
                code=1,
                message="奖惩记录不存在",
                data=None
            )
        
        # 构建学生数据
        student_data = None
        if record.student:
            student_data = {
                "student_id": record.student_id,
                "student_no": record.student.student_no or "",
                "user": {
                    "real_name": record.student.user.real_name if record.student.user else ""
                }
            }
        
        # 构建处理人数据
        handler_data = None
        if record.handler:
            handler_data = {
                "user_id": record.handler_id,
                "real_name": record.handler.real_name or ""
            }
        
        # 构建响应
        result = {
            "record_id": record.record_id,
            "student_id": record.student_id,
            "type": record.type,
            "category": record.category,
            "description": record.description,
            "occur_date": str(record.occur_date) if record.occur_date else "",
            "handler_id": record.handler_id,
            "created_at": str(record.created_at) if record.created_at else "",
            "student": student_data,
            "handler": handler_data
        }
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=result
        )
    except Exception as e:
        error_msg = f"获取奖惩记录详情失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取奖惩记录详情失败: {str(e)}")


@router.put("/{record_id}", response_model=APIResponse)
def update_reward_punishment(
    record_id: int,
    record_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    _: Any = Depends(deps.check_permissions(["REWARD_PUNISHMENT_MANAGE"])),
) -> Any:
    """
    更新奖惩记录
    """
    try:
        record = db.query(RewardPunishment).options(
            joinedload(RewardPunishment.student).joinedload(Student.user)
        ).filter(RewardPunishment.record_id == record_id).first()
        
        if not record:
            return APIResponse(
                code=1,
                message="奖惩记录不存在",
                data=None
            )
        
        # 更新字段
        update_fields = ["type", "category", "description", "occur_date"]
        for field in update_fields:
            if field in record_data:
                setattr(record, field, record_data[field])
        
        # 更新处理人
        record.handler_id = current_user.user_id
        
        db.commit()
        db.refresh(record)
        
        # 构建学生数据
        student_data = None
        if record.student:
            student_data = {
                "student_id": record.student_id,
                "student_no": record.student.student_no or "",
                "user": {
                    "real_name": record.student.user.real_name if record.student.user else ""
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
            "record_id": record.record_id,
            "student_id": record.student_id,
            "type": record.type,
            "category": record.category,
            "description": record.description,
            "occur_date": str(record.occur_date) if record.occur_date else "",
            "handler_id": record.handler_id,
            "created_at": str(record.created_at) if record.created_at else "",
            "student": student_data,
            "handler": handler_data
        }
        
        return APIResponse(
            code=0,
            message="更新成功",
            data=result
        )
    except Exception as e:
        error_msg = f"更新奖惩记录失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"更新奖惩记录失败: {str(e)}")


@router.delete("/{record_id}", response_model=APIResponse)
def delete_reward_punishment(
    record_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["REWARD_PUNISHMENT_MANAGE"])),
) -> Any:
    """
    删除奖惩记录
    """
    try:
        record = db.query(RewardPunishment).filter(RewardPunishment.record_id == record_id).first()
        
        if not record:
            return APIResponse(
                code=1,
                message="奖惩记录不存在",
                data=None
            )
        
        db.delete(record)
        db.commit()
        
        return APIResponse(
            code=0,
            message="删除成功",
            data=None
        )
    except Exception as e:
        error_msg = f"删除奖惩记录失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"删除奖惩记录失败: {str(e)}")


@router.get("/by-student/{student_id}", response_model=APIResponse)
def get_reward_punishment_by_student(
    student_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["REWARD_PUNISHMENT_VIEW"])),
) -> Any:
    """
    获取学生的奖惩记录
    """
    try:
        records = db.query(RewardPunishment).options(
            joinedload(RewardPunishment.handler)
        ).filter(
            RewardPunishment.student_id == student_id
        ).order_by(desc(RewardPunishment.occur_date), desc(RewardPunishment.created_at)).all()
        
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
        record_list = []
        for record in records:
            # 构建处理人数据
            handler_data = None
            if record.handler:
                handler_data = {
                    "user_id": record.handler_id,
                    "real_name": record.handler.real_name or ""
                }
            
            record_data = {
                "record_id": record.record_id,
                "student_id": record.student_id,
                "type": record.type,
                "category": record.category,
                "description": record.description,
                "occur_date": str(record.occur_date) if record.occur_date else "",
                "handler_id": record.handler_id,
                "created_at": str(record.created_at) if record.created_at else "",
                "student": student_data,
                "handler": handler_data
            }
            record_list.append(record_data)
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=record_list
        )
    except Exception as e:
        error_msg = f"获取学生奖惩记录失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取学生奖惩记录失败: {str(e)}")


@router.get("/by-type/{type}", response_model=APIResponse)
def get_reward_punishment_by_type(
    type: str,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["REWARD_PUNISHMENT_VIEW"])),
) -> Any:
    """
    获取指定类型的奖惩记录
    """
    try:
        records = db.query(RewardPunishment).options(
            joinedload(RewardPunishment.student).joinedload(Student.user),
            joinedload(RewardPunishment.handler)
        ).filter(
            RewardPunishment.type == type
        ).order_by(desc(RewardPunishment.occur_date), desc(RewardPunishment.created_at)).all()
        
        # 构建响应
        record_list = []
        for record in records:
            # 构建学生数据
            student_data = None
            if record.student:
                student_data = {
                    "student_id": record.student_id,
                    "student_no": record.student.student_no or "",
                    "user": {
                        "real_name": record.student.user.real_name if record.student.user else ""
                    }
                }
            
            # 构建处理人数据
            handler_data = None
            if record.handler:
                handler_data = {
                    "user_id": record.handler_id,
                    "real_name": record.handler.real_name or ""
                }
            
            record_data = {
                "record_id": record.record_id,
                "student_id": record.student_id,
                "type": record.type,
                "category": record.category,
                "description": record.description,
                "occur_date": str(record.occur_date) if record.occur_date else "",
                "handler_id": record.handler_id,
                "created_at": str(record.created_at) if record.created_at else "",
                "student": student_data,
                "handler": handler_data
            }
            record_list.append(record_data)
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=record_list
        )
    except Exception as e:
        error_msg = f"获取奖惩记录失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取奖惩记录失败: {str(e)}")


@router.get("/statistics", response_model=APIResponse)
def get_statistics(
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["REWARD_PUNISHMENT_VIEW"])),
) -> Any:
    """
    获取奖惩统计数据
    """
    try:
        # 统计总记录数
        total_count = db.query(func.count(RewardPunishment.record_id)).scalar()
        
        # 按类型统计
        type_stats = db.query(
            RewardPunishment.type,
            func.count(RewardPunishment.record_id).label("count")
        ).group_by(RewardPunishment.type).all()
        
        type_data = []
        for type_name, count in type_stats:
            type_data.append({
                "type": type_name,
                "count": count
            })
        
        # 按分类统计
        category_stats = db.query(
            RewardPunishment.category,
            func.count(RewardPunishment.record_id).label("count")
        ).group_by(RewardPunishment.category).all()
        
        category_data = []
        for category, count in category_stats:
            category_data.append({
                "category": category,
                "count": count
            })
        
        # 按月份统计最近12个月
        current_date = datetime.now().date()
        month_stats = []
        
        for i in range(12):
            month = (current_date.month - i - 1) % 12 + 1
            year = current_date.year - ((current_date.month - i - 1) // 12)
            month_label = f"{year}-{month:02d}"
            
            # 奖励数量
            reward_count = db.query(func.count(RewardPunishment.record_id)).filter(
                RewardPunishment.type == "REWARD",
                func.extract('year', RewardPunishment.occur_date) == year,
                func.extract('month', RewardPunishment.occur_date) == month
            ).scalar()
            
            # 惩罚数量
            punishment_count = db.query(func.count(RewardPunishment.record_id)).filter(
                RewardPunishment.type == "PUNISHMENT",
                func.extract('year', RewardPunishment.occur_date) == year,
                func.extract('month', RewardPunishment.occur_date) == month
            ).scalar()
            
            month_stats.append({
                "month": month_label,
                "reward": reward_count,
                "punishment": punishment_count
            })
        
        # 构建响应
        result = {
            "total": total_count,
            "by_type": type_data,
            "by_category": category_data,
            "by_month": month_stats
        }
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=result
        )
    except Exception as e:
        error_msg = f"获取奖惩统计数据失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取奖惩统计数据失败: {str(e)}")


@router.get("/categories/list", response_model=APIResponse)
def list_categories(
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["REWARD_PUNISHMENT_VIEW"])),
) -> Any:
    """
    获取奖惩分类列表
    """
    try:
        # 获取所有不同的分类
        categories = db.query(RewardPunishment.category).distinct().all()
        
        # 转换为列表
        category_list = [c[0] for c in categories if c[0]]
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=category_list
        )
    except Exception as e:
        error_msg = f"获取奖惩分类列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取奖惩分类列表失败: {str(e)}") 