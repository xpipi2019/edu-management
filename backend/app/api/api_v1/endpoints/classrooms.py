from typing import Any, List
import traceback
import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_

from app.api import deps
from app.db.database import get_db
from app.models.course import Classroom, Schedule, CourseOffering
from app.schemas.common import APIResponse, PaginatedResponse

router = APIRouter()


def debug_log(message):
    """记录调试日志"""
    print(f"[DEBUG] {message}")


def parse_equipment(equipment_str):
    """解析设备字段，确保返回数组"""
    debug_log(f"解析设备字符串: '{equipment_str}', 类型: {type(equipment_str)}")
    
    if not equipment_str:
        debug_log("设备为空，返回空数组")
        return []
    
    # 如果是字符串，尝试按逗号分隔
    if isinstance(equipment_str, str):
        # 移除可能的空白字符和空字符串
        items = [item.strip() for item in equipment_str.split(',')]
        result = [item for item in items if item]
        debug_log(f"设备字符串分割结果: {result}")
        return result
    
    # 如果已经是列表
    if isinstance(equipment_str, list):
        debug_log(f"设备已是列表: {equipment_str}")
        return equipment_str
    
    # 其他情况返回空列表
    debug_log(f"设备类型未知，返回空数组")
    return []


def serialize_equipment(equipment_list):
    """
    将设备列表序列化为存储格式
    """
    if not equipment_list:
        return ""
    
    if isinstance(equipment_list, list):
        return ','.join(equipment_list)
    
    if isinstance(equipment_list, str):
        return equipment_list
    
    return ""


@router.get("", response_model=None)
def list_classrooms(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    room_no: str = None,
    building: str = None,
    room_type: str = None,
    status: int = None,
    min_capacity: int = None,
    _: Any = Depends(deps.check_permissions(["CLASSROOM_VIEW"])),
) -> Any:
    """
    获取教室列表
    """
    try:
        # 打印请求参数
        print(f"查询教室参数: page={page}, pageSize={pageSize}, room_no={room_no}, building={building}, room_type={room_type}, status={status}")
        
        query = db.query(Classroom)
        
        # 应用过滤条件
        if room_no:
            query = query.filter(Classroom.room_no.like(f"%{room_no}%"))
        if building:
            query = query.filter(Classroom.building == building)
        if room_type:
            query = query.filter(Classroom.room_type == room_type)
        if status is not None:
            query = query.filter(Classroom.status == status)
        if min_capacity and min_capacity > 0:
            query = query.filter(Classroom.capacity >= min_capacity)
        
        # 计算总数
        total = query.count()
        
        # 分页
        classrooms = query.offset((page - 1) * pageSize).limit(pageSize).all()
        
        # 构建响应
        classroom_list = []
        for classroom in classrooms:
            # 解析设备
            equipment_array = parse_equipment(classroom.equipment)
            print(f"教室 {classroom.room_no} 的设备: 原始={classroom.equipment}, 处理后={equipment_array}")
            
            # 构建与前端期望格式一致的数据结构
            classroom_data = {
                "classroom_id": classroom.classroom_id,
                "room_no": classroom.room_no,
                "building": classroom.building,
                "floor": classroom.floor,
                "capacity": classroom.capacity,
                "room_type": classroom.room_type,
                "equipment": equipment_array,
                "status": classroom.status
            }
            classroom_list.append(classroom_data)
            
        # 与前端期望的格式一致
        result = {
            "code": 0,
            "message": "获取成功",
            "data": {
                "list": classroom_list,
                "total": total,
                "page": page,
                "pageSize": pageSize
            }
        }
        
        # 打印返回数据示例
        if classroom_list:
            first_item = classroom_list[0]
            print(f"返回数据示例: {first_item}")
            print(f"设备类型: {type(first_item['equipment'])}, 值: {first_item['equipment']}")
        
        # 使用直接返回，不使用任何装饰器
        return result
    except Exception as e:
        error_msg = f"获取教室列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取教室列表失败: {str(e)}")


@router.get("/all", response_model=None)
def get_all_classrooms(
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["CLASSROOM_VIEW"])),
) -> Any:
    """
    获取所有教室
    """
    try:
        classrooms = db.query(Classroom).all()
        
        classroom_list = []
        for classroom in classrooms:
            # 解析设备
            equipment_array = parse_equipment(classroom.equipment)
            
            classroom_data = {
                "classroom_id": classroom.classroom_id,
                "room_no": classroom.room_no,
                "building": classroom.building,
                "floor": classroom.floor,
                "capacity": classroom.capacity,
                "room_type": classroom.room_type,
                "equipment": equipment_array,
                "status": classroom.status
            }
            classroom_list.append(classroom_data)
        
        # 直接返回符合前端期望的格式
        return {
            "code": 0,
            "message": "获取成功",
            "data": classroom_list
        }
    except Exception as e:
        error_msg = f"获取教室列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取教室列表失败: {str(e)}")


@router.post("", response_model=None)
def create_classroom(
    classroom_data: dict,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["CLASSROOM_MANAGE"])),
) -> Any:
    """
    创建新教室
    """
    try:
        print(f"创建教室请求数据: {classroom_data}")
        
        # 检查是否已存在相同编号的教室
        existing = db.query(Classroom).filter(Classroom.room_no == classroom_data.get("room_no")).first()
        if existing:
            return {
                "code": 1,
                "message": "该教室编号已存在",
                "data": None
            }
        
        # 处理equipment字段，将列表转换为文本
        if "equipment" in classroom_data and classroom_data["equipment"]:
            print(f"设备原始数据: {classroom_data['equipment']}, 类型: {type(classroom_data['equipment'])}")
            if isinstance(classroom_data["equipment"], list):
                equipment_text = ",".join([item.strip() for item in classroom_data["equipment"] if item.strip()])
                print(f"列表转换为字符串: {equipment_text}")
            elif isinstance(classroom_data["equipment"], str):
                items = [item.strip() for item in classroom_data["equipment"].split(',')]
                equipment_text = ",".join([item for item in items if item])
                print(f"字符串规范化: {equipment_text}")
            else:
                equipment_text = ""
                print("设备类型未知，设置为空字符串")
        else:
            equipment_text = ""
            print("无设备数据")
        
        # 创建新教室
        new_classroom = Classroom(
            room_no=classroom_data.get("room_no"),
            building=classroom_data.get("building"),
            floor=classroom_data.get("floor"),
            capacity=classroom_data.get("capacity"),
            room_type=classroom_data.get("room_type"),
            equipment=equipment_text,
            status=classroom_data.get("status", 1)
        )
        
        db.add(new_classroom)
        db.commit()
        db.refresh(new_classroom)
        
        # 解析设备，确保返回数组
        equipment_array = parse_equipment(new_classroom.equipment)
        print(f"创建后的设备数据: {equipment_array}")
        
        # 构建响应
        result = {
            "classroom_id": new_classroom.classroom_id,
            "room_no": new_classroom.room_no,
            "building": new_classroom.building,
            "floor": new_classroom.floor,
            "capacity": new_classroom.capacity,
            "room_type": new_classroom.room_type,
            "equipment": equipment_array,
            "status": new_classroom.status
        }
        
        # 打印响应数据
        print(f"创建教室成功: {result}")
        
        return {
            "code": 0,
            "message": "创建成功",
            "data": result
        }
    except Exception as e:
        error_msg = f"创建教室失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"创建教室失败: {str(e)}")


@router.get("/{classroom_id}", response_model=None)
def get_classroom(
    classroom_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["CLASSROOM_VIEW"])),
) -> Any:
    """
    获取教室详情
    """
    try:
        classroom = db.query(Classroom).filter(Classroom.classroom_id == classroom_id).first()
        
        if not classroom:
            return {
                "code": 1,
                "message": "教室不存在",
                "data": None
            }
        
        # 解析设备
        equipment_array = parse_equipment(classroom.equipment)
        print(f"教室详情: 设备原始数据={classroom.equipment}, 处理后={equipment_array}")
        
        # 构建与前端期望格式一致的响应
        result = {
            "classroom_id": classroom.classroom_id,
            "room_no": classroom.room_no,
            "building": classroom.building,
            "floor": classroom.floor,
            "capacity": classroom.capacity,
            "room_type": classroom.room_type,
            "equipment": equipment_array,
            "status": classroom.status
        }
        
        # 直接返回
        return {
            "code": 0,
            "message": "获取成功",
            "data": result
        }
    except Exception as e:
        error_msg = f"获取教室详情失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取教室详情失败: {str(e)}")


@router.put("/{classroom_id}", response_model=None)
def update_classroom(
    classroom_id: int,
    classroom_data: dict,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["CLASSROOM_MANAGE"])),
) -> Any:
    """
    更新教室信息
    """
    try:
        print(f"更新教室请求数据: {classroom_data}")
        
        # 查找教室
        classroom = db.query(Classroom).filter(Classroom.classroom_id == classroom_id).first()
        if not classroom:
            return {
                "code": 1,
                "message": "教室不存在",
                "data": None
            }
        
        # 检查是否有同名教室（排除自身）
        if "room_no" in classroom_data and classroom_data["room_no"] != classroom.room_no:
            existing = db.query(Classroom).filter(
                and_(
                    Classroom.room_no == classroom_data["room_no"],
                    Classroom.classroom_id != classroom_id
                )
            ).first()
            if existing:
                return {
                    "code": 1,
                    "message": "该教室编号已存在",
                    "data": None
                }
        
        # 处理equipment字段
        if "equipment" in classroom_data:
            equipment_data = classroom_data["equipment"]
            print(f"设备原始数据: {equipment_data}, 类型: {type(equipment_data)}")
            
            # 确保设备数据正确处理
            if isinstance(equipment_data, list):
                # 列表转字符串
                equipment_text = ",".join([str(item).strip() for item in equipment_data if str(item).strip()])
                print(f"列表转换为字符串: {equipment_text}")
                classroom.equipment = equipment_text
            elif isinstance(equipment_data, str):
                # 字符串规范化
                classroom.equipment = equipment_data
                print(f"设备字符串: {classroom.equipment}")
            else:
                # 其他类型转为空字符串
                classroom.equipment = ""
                print("设备类型未知，设置为空字符串")
        
        # 更新其他字段
        if "room_no" in classroom_data:
            classroom.room_no = classroom_data["room_no"]
        if "building" in classroom_data:
            classroom.building = classroom_data["building"]
        if "floor" in classroom_data:
            classroom.floor = classroom_data["floor"]
        if "capacity" in classroom_data:
            classroom.capacity = classroom_data["capacity"]
        if "room_type" in classroom_data:
            classroom.room_type = classroom_data["room_type"]
        if "status" in classroom_data:
            classroom.status = classroom_data["status"]
        
        db.commit()
        db.refresh(classroom)
        
        # 解析设备，确保返回数组
        equipment_array = parse_equipment(classroom.equipment)
        print(f"更新后的设备数据: {equipment_array}")
        
        # 构建响应
        result = {
            "classroom_id": classroom.classroom_id,
            "room_no": classroom.room_no,
            "building": classroom.building,
            "floor": classroom.floor,
            "capacity": classroom.capacity,
            "room_type": classroom.room_type,
            "equipment": equipment_array,
            "status": classroom.status
        }
        
        return {
            "code": 0,
            "message": "更新成功",
            "data": result
        }
    except Exception as e:
        error_msg = f"更新教室失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"更新教室失败: {str(e)}")


@router.delete("/{classroom_id}", response_model=None)
def delete_classroom(
    classroom_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["CLASSROOM_MANAGE"])),
) -> Any:
    """
    删除教室
    """
    try:
        classroom = db.query(Classroom).filter(Classroom.classroom_id == classroom_id).first()
        
        if not classroom:
            return {
                "code": 1,
                "message": "教室不存在",
                "data": None
            }
        
        # 检查是否有关联的排课
        schedule_count = db.query(Schedule).filter(Schedule.classroom_id == classroom_id).count()
        if schedule_count > 0:
            return {
                "code": 1,
                "message": f"无法删除，该教室有 {schedule_count} 个排课记录关联",
                "data": None
            }
        
        db.delete(classroom)
        db.commit()
        
        return {
            "code": 0,
            "message": "删除成功",
            "data": None
        }
    except Exception as e:
        error_msg = f"删除教室失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"删除教室失败: {str(e)}")


@router.get("/by-building/{building}", response_model=None)
def get_classrooms_by_building(
    building: str,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["CLASSROOM_VIEW"])),
) -> Any:
    """
    根据建筑物获取教室列表
    """
    try:
        classrooms = db.query(Classroom).filter(Classroom.building == building).all()
        
        classroom_list = []
        for classroom in classrooms:
            # 解析设备
            equipment_array = parse_equipment(classroom.equipment)
            
            classroom_data = {
                "classroom_id": classroom.classroom_id,
                "room_no": classroom.room_no,
                "building": classroom.building,
                "floor": classroom.floor,
                "capacity": classroom.capacity,
                "room_type": classroom.room_type,
                "equipment": equipment_array,
                "status": classroom.status
            }
            classroom_list.append(classroom_data)
        
        # 直接返回
        return {
            "code": 0,
            "message": "获取成功",
            "data": classroom_list
        }
    except Exception as e:
        error_msg = f"获取教室列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取教室列表失败: {str(e)}")


@router.get("/by-type/{type}", response_model=None)
def get_classrooms_by_type(
    type: str,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["CLASSROOM_VIEW"])),
) -> Any:
    """
    根据类型获取教室列表
    """
    try:
        classrooms = db.query(Classroom).filter(Classroom.room_type == type).all()
        
        classroom_list = []
        for classroom in classrooms:
            # 解析设备
            equipment_array = parse_equipment(classroom.equipment)
            
            classroom_data = {
                "classroom_id": classroom.classroom_id,
                "room_no": classroom.room_no,
                "building": classroom.building,
                "floor": classroom.floor,
                "capacity": classroom.capacity,
                "room_type": classroom.room_type,
                "equipment": equipment_array,
                "status": classroom.status
            }
            classroom_list.append(classroom_data)
        
        # 直接返回
        return {
            "code": 0,
            "message": "获取成功",
            "data": classroom_list
        }
    except Exception as e:
        error_msg = f"获取教室列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取教室列表失败: {str(e)}")


@router.get("/available", response_model=None)
def get_available_classrooms(
    db: Session = Depends(get_db),
    day_of_week: int = Query(..., description="星期几，1-7表示周一到周日"),
    start_time: str = Query(..., description="开始时间，格式HH:MM"),
    semester: str = Query(None, description="学期"),
    _: Any = Depends(deps.check_permissions(["CLASSROOM_VIEW"])),
) -> Any:
    """
    获取指定时间可用的教室
    """
    try:
        # 找出在指定时间被占用的教室ID
        query = db.query(Schedule.classroom_id).filter(
            Schedule.day_of_week == day_of_week,
            Schedule.start_time == start_time
        )
        
        # 如果指定了学期，则根据学期过滤
        if semester:
            query = query.join(CourseOffering, Schedule.offering_id == CourseOffering.offering_id).filter(
                CourseOffering.semester == semester
            )
        
        # 获取被占用的教室ID列表
        occupied_classroom_ids = [r[0] for r in query.all()]
        
        # 查询可用的教室
        available_classrooms = db.query(Classroom).filter(
            Classroom.status == 1,
            ~Classroom.classroom_id.in_(occupied_classroom_ids) if occupied_classroom_ids else True
        ).all()
        
        # 构建响应
        classroom_list = []
        for classroom in available_classrooms:
            # 解析设备
            equipment_array = parse_equipment(classroom.equipment)
            
            classroom_data = {
                "classroom_id": classroom.classroom_id,
                "room_no": classroom.room_no,
                "building": classroom.building,
                "floor": classroom.floor,
                "capacity": classroom.capacity,
                "room_type": classroom.room_type,
                "equipment": equipment_array,
                "status": classroom.status
            }
            classroom_list.append(classroom_data)
        
        # 直接返回
        return {
            "code": 0,
            "message": "获取成功",
            "data": classroom_list
        }
    except Exception as e:
        error_msg = f"获取可用教室失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取可用教室失败: {str(e)}") 