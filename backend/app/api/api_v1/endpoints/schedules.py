from typing import Any, List, Dict, Optional
import traceback
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import text, func, and_, or_

from app.api import deps
from app.db.database import get_db
from app.models.course import Schedule, CourseOffering, Classroom
from app.models.teacher import Teacher
from app.models.student import Student
from app.models.enrollment import Enrollment
from app.schemas.common import APIResponse, PaginatedResponse

router = APIRouter()

# 通用时间格式转换辅助函数 - 处理各种时间格式
def format_time(time_value):
    print(f"DEBUG - 正在处理时间值: {time_value}, 类型: {type(time_value)}")
    if time_value is None:
        return "08:00"  # 默认值
    
    try:
        # 字符串类型直接判断格式
        if isinstance(time_value, str):
            # 已经是字符串格式的时间
            if len(time_value) == 5 and time_value[2] == ':':
                return time_value
            else:
                # 尝试解析其他格式的字符串
                try:
                    dt = datetime.strptime(time_value, "%H:%M:%S")
                    return dt.strftime("%H:%M")
                except ValueError:
                    pass
                return "08:00"  # 格式不正确，返回默认值
        
        # 处理 timedelta 类型 - 从 datetime 模块导入
        if type(time_value).__name__ == 'timedelta':
            try:
                total_seconds = int(time_value.total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                return f"{hours:02d}:{minutes:02d}"
            except Exception as e:
                print(f"处理timedelta时出错: {e}")
                return "08:00"
                
        # 同样检查类名，以防导入问题
        if type(time_value).__name__ == 'datetime':
            try:
                return time_value.strftime("%H:%M")
            except:
                return "08:00"
        
        # 处理 datetime 类型
        if isinstance(time_value, datetime):
            return time_value.strftime("%H:%M")
            
        # 处理 Time 类型（SQLAlchemy可能使用）
        if hasattr(time_value, 'hour') and hasattr(time_value, 'minute'):
            try:
                return f"{time_value.hour:02d}:{time_value.minute:02d}"
            except:
                return "08:00"
        
        # 处理整数类型（可能是小时数）
        if isinstance(time_value, int):
            hours = time_value
            return f"{hours:02d}:00"
        
        # 处理浮点类型（可能是小时数）
        if isinstance(time_value, float):
            hours = int(time_value)
            minutes = int((time_value - hours) * 60)
            return f"{hours:02d}:{minutes:02d}"
            
        # 处理字典类型（可能包含时间信息）
        if isinstance(time_value, dict) and 'hour' in time_value and 'minute' in time_value:
            try:
                return f"{time_value['hour']:02d}:{time_value['minute']:02d}"
            except:
                return "08:00"
        
        # 其他情况，返回默认值
        print(f"DEBUG - 无法识别的时间类型: {type(time_value)}")
        # 尝试字符串转换
        try:
            return str(time_value)[:5] if len(str(time_value)) >= 5 else "08:00"
        except:
            return "08:00"
    except Exception as e:
        print(f"时间格式化出错: {e}, 原始值: {time_value}, 类型: {type(time_value)}")
        return "08:00"  # 出错时返回默认值

# 确保周数格式正确的辅助函数
def ensure_valid_weeks_format(weeks_str):
    """
    确保周数格式正确
    返回格式化后的周数字符串，如"1-16"或"1,3,5-7"
    """
    if not weeks_str:
        print("周数为空，使用默认值: 1-16")
        return "1-16"  # 默认为1-16周
        
    print(f"检查周数格式: {weeks_str}")
    
    # 如果是字符串，检查格式是否正确
    if isinstance(weeks_str, str):
        weeks_str = weeks_str.strip()
        
        # 如果是空字符串，返回默认值
        if not weeks_str:
            print("周数为空字符串，使用默认值: 1-16")
            return "1-16"
            
        try:
            # 尝试规范化格式
            formatted_parts = []
            parts = weeks_str.split(',')
            
            for part in parts:
                part = part.strip()
                if not part:
                    continue
                    
                if '-' in part:
                    start_str, end_str = part.split('-', 1)
                    start = int(start_str.strip())
                    end = int(end_str.strip())
                    
                    # 确保开始周不大于结束周
                    if start > end:
                        print(f"警告: 周数范围错误 {start}-{end}，自动交换")
                        start, end = end, start
                        
                    # 限制最大周数范围
                    if end - start > 30:
                        print(f"警告: 周数范围过大 {start}-{end}，限制为最多30周")
                        end = start + 30
                        
                    formatted_parts.append(f"{start}-{end}")
                else:
                    # 单个周次
                    week = int(part)
                    formatted_parts.append(str(week))
                    
            if formatted_parts:
                result = ",".join(formatted_parts)
                print(f"格式化后的周数: {result}")
                return result
            else:
                print("格式化后周数为空，使用默认值: 1-16")
                return "1-16"
        except (ValueError, TypeError) as e:
            # 如果格式不正确，记录错误并返回默认值
            print(f"周数格式无效: {e}，使用默认值: 1-16")
            return "1-16"
    else:
        # 非字符串类型，尝试转换
        try:
            if isinstance(weeks_str, (list, tuple, set)):
                # 如果是列表、元组或集合，转换为逗号分隔的字符串
                formatted_parts = []
                for item in sorted(weeks_str):
                    formatted_parts.append(str(int(item)))
                result = ",".join(formatted_parts)
                print(f"非字符串类型转换为: {result}")
                return result
            elif isinstance(weeks_str, dict):
                # 如果是字典，使用键
                formatted_parts = []
                for key in sorted(weeks_str.keys()):
                    formatted_parts.append(str(int(key)))
                result = ",".join(formatted_parts)
                print(f"字典类型转换为: {result}")
                return result
            elif weeks_str is None:
                print("周数为None，使用默认值: 1-16")
                return "1-16"
            else:
                # 其他类型，尝试直接转换为字符串
                result = str(weeks_str)
                print(f"其他类型转换为: {result}")
                return result
        except Exception as e:
            # 转换失败，返回默认值
            print(f"转换周数格式失败: {e}，使用默认值: 1-16")
            return "1-16"

@router.get("/all-classrooms", response_model=APIResponse)
def get_all_classrooms(
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["SCHEDULE_VIEW"])),
) -> Any:
    """
    获取所有教室信息
    """
    try:
        classrooms = db.query(Classroom).filter(Classroom.status == True).all()
        
        classroom_list = []
        for classroom in classrooms:
            classroom_list.append({
                "id": classroom.classroom_id,
                "name": classroom.room_no,
                "building": classroom.building,
                "capacity": classroom.capacity,
                "room_type": classroom.room_type
            })
            
        return APIResponse(
            code=0,
            message="获取成功",
            data=classroom_list
        )
    except Exception as e:
        error_msg = f"获取教室信息失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取教室信息失败: {str(e)}")


@router.get("/all-teachers", response_model=APIResponse)
def get_all_teachers(
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["SCHEDULE_VIEW"])),
) -> Any:
    """
    获取所有教师信息
    """
    try:
        teachers = db.query(Teacher).options(
            joinedload(Teacher.user)
        ).filter(Teacher.status == True).all()
        
        teacher_list = []
        for teacher in teachers:
            if teacher.user:
                teacher_list.append({
                    "id": teacher.teacher_id,
                    "name": teacher.user.real_name,
                    "title": teacher.title or ""
                })
            
        return APIResponse(
            code=0,
            message="获取成功",
            data=teacher_list
        )
    except Exception as e:
        error_msg = f"获取教师信息失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取教师信息失败: {str(e)}")


@router.get("", response_model=APIResponse)
def list_schedules(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    offering_id: int = None,
    classroom_id: int = None,
    semester: str = None,
    teacher_id: int = None,
    day_of_week: int = None,
    keyword: str = None,
    _: Any = Depends(deps.check_permissions(["SCHEDULE_VIEW"])),
) -> Any:
    """
    获取排课列表
    """
    try:
        # 验证并标准化分页参数
        try:
            page = max(1, page)
            pageSize = max(1, min(100, pageSize))
            print(f"初始分页参数: page={page}, pageSize={pageSize}")
        except Exception as e:
            print(f"分页参数验证错误: {e}，使用默认值")
            page = 1
            pageSize = 20
        
        # 使用ORM查询，预加载关联对象
        query = db.query(Schedule).options(
            joinedload(Schedule.offering).joinedload(CourseOffering.course),
            joinedload(Schedule.offering).joinedload(CourseOffering.teacher).joinedload(Teacher.user),
            joinedload(Schedule.classroom)
        )
        
        # 应用过滤条件并记录日志
        print(f"应用过滤条件: offering_id={offering_id}, classroom_id={classroom_id}, semester={semester}, teacher_id={teacher_id}, day_of_week={day_of_week}, keyword={keyword}")
        
        if offering_id:
            query = query.filter(Schedule.offering_id == offering_id)
            print(f"应用offering_id过滤: {offering_id}")
            
        if classroom_id:
            query = query.filter(Schedule.classroom_id == classroom_id)
            print(f"应用classroom_id过滤: {classroom_id}")
            
        if semester:
            if 'CourseOffering' not in str(query.statement):
                query = query.join(CourseOffering, Schedule.offering_id == CourseOffering.offering_id, isouter=True)
            query = query.filter(CourseOffering.semester == semester)
            print(f"应用semester过滤: {semester}")
            
        if day_of_week is not None:
            query = query.filter(Schedule.day_of_week == day_of_week)
            print(f"应用day_of_week过滤: {day_of_week}")
        
        if teacher_id:
            if 'CourseOffering' not in str(query.statement):
                query = query.join(CourseOffering, Schedule.offering_id == CourseOffering.offering_id, isouter=True)
            query = query.filter(CourseOffering.teacher_id == teacher_id)
            print(f"应用teacher_id过滤: {teacher_id}")
            
        # 关键词搜索，与info-list接口保持一致
        if keyword:
            print(f"应用关键词搜索: {keyword}")
            # 确保已经连接了需要的表
            if 'CourseOffering' not in str(query.statement):
                query = query.join(CourseOffering, Schedule.offering_id == CourseOffering.offering_id, isouter=True)
                
            # 确保连接了课程表
            if 'Course' not in str(query.statement):
                query = query.join(CourseOffering.course, isouter=True)
            
            # 确保连接了教师表
            if 'Teacher' not in str(query.statement):
                query = query.join(CourseOffering.teacher, isouter=True)
            
            # 确保连接了用户表
            if 'User' not in str(query.statement):
                query = query.join(Teacher.user, isouter=True)
            
            # 确保连接了教室表
            if 'Classroom' not in str(query.statement):
                query = query.join(Schedule.classroom, isouter=True)
                
            # 对多个字段应用模糊搜索
            from sqlalchemy import or_
            from app.models.user import User  # 添加必要的导入
            from app.models.course import Course  # 添加必要的导入
            
            keyword_filter = or_(
                Course.course_name.like(f"%{keyword}%"),
                Course.course_code.like(f"%{keyword}%"),
                User.real_name.like(f"%{keyword}%"),
                Classroom.room_no.like(f"%{keyword}%"),
                Classroom.building.like(f"%{keyword}%")
            )
            query = query.filter(keyword_filter)
        
        # 添加排序，确保结果一致性
        query = query.order_by(Schedule.day_of_week, Schedule.start_time, Schedule.schedule_id)
        
        # 优化计数查询
        try:
            # 使用新版SQLAlchemy API获取计数
            count_query = db.query(func.count(Schedule.schedule_id))
            
            # 应用与主查询相同的过滤条件
            if hasattr(query, 'whereclause') and hasattr(query.whereclause, 'clauses'):
                for clause in query.whereclause.clauses:
                    count_query = count_query.filter(clause)
            
            total = count_query.scalar() or 0
            print(f"查询到总记录数: {total}")
        except Exception as e:
            print(f"优化计数查询失败: {str(e)}，回退到普通count方法")
            # 回退到普通count方法
            total = query.count()
            print(f"回退方法计算总数: {total}")
        
        # 计算总页数
        totalPages = (total + pageSize - 1) // pageSize if total > 0 else 1
        print(f"计算总页数: {totalPages}")
        
        # 确保请求的页码不超过总页数
        if page > totalPages and total > 0:
            page = totalPages
            print(f"页码超出范围，调整为: {page}")
        
        # 显式应用分页 - 计算偏移量
        offset_value = (page - 1) * pageSize
        limit_value = pageSize
        print(f"应用分页: offset={offset_value}, limit={limit_value}")
        
        # 分页处理 - 无论如何都应用分页，确保不会返回全部数据
        schedules = query.offset(offset_value).limit(limit_value).all()
        print(f"查询到 {len(schedules)} 条排课记录")
        
        # 星期几映射到中文
        day_map = {1: "周一", 2: "周二", 3: "周三", 4: "周四", 5: "周五", 6: "周六", 7: "周日"}
        
        # 构建响应
        schedule_list = []
        for schedule in schedules:
            try:
                # 获取课程信息 - 使用与前端期望一致的字段名
                course_data = {
                    "id": 0,
                    "code": "未知代码",
                    "name": "未知课程",
                    "course_type": "DEFAULT",
                    "course_code": "未知代码",  # 添加前端可能需要的字段
                    "course_name": "未知课程"   # 添加前端可能需要的字段
                }
                
                if schedule.offering and schedule.offering.course:
                    course = schedule.offering.course
                    course_data = {
                        "id": course.course_id,
                        "code": course.course_code or "未知代码",
                        "name": course.course_name or "未知课程",
                        "course_type": getattr(course, 'course_type', "DEFAULT") or "DEFAULT",
                        "course_code": course.course_code or "未知代码",
                        "course_name": course.course_name or "未知课程"
                    }
                
                # 获取教师信息 - 按照前端期望的结构
                teacher_data = {
                    "id": 0,
                    "name": "未知教师",
                    "user": {"real_name": "未知教师"}
                }
                
                if schedule.offering and schedule.offering.teacher and schedule.offering.teacher.user:
                    teacher = schedule.offering.teacher
                    user = teacher.user
                    teacher_data = {
                        "id": teacher.teacher_id,
                        "name": user.real_name or "未知教师",
                        "user": {"real_name": user.real_name or "未知教师"}
                    }
                
                # 获取教室信息 - 按照前端期望的结构
                classroom_data = {
                    "id": 0,
                    "name": "未安排",
                    "building": "未安排",
                    "room_no": "未安排"  # 添加前端可能需要的字段
                }
                
                if schedule.classroom:
                    classroom = schedule.classroom
                    classroom_data = {
                        "id": classroom.classroom_id,
                        "name": classroom.room_no or "未安排",
                        "building": classroom.building or "未安排",
                        "room_no": classroom.room_no or "未安排"
                    }
                
                # 获取学期和学年信息
                semester_value = "未知"
                if schedule.offering and hasattr(schedule.offering, 'semester'):
                    semester_value = schedule.offering.semester or "未知"
                
                # 确保时间格式正确
                start_time = format_time(getattr(schedule, 'start_time', None))
                end_time = format_time(getattr(schedule, 'end_time', None))
                
                # 确保weeks字段格式正确
                weeks_value = ensure_valid_weeks_format(schedule.weeks or "")
                
                # 构建排课数据 - 确保结构与前端期望一致
                schedule_data = {
                    "id": schedule.schedule_id,
                    "schedule_id": schedule.schedule_id,
                    "offering_id": schedule.offering_id,
                    "classroom_id": schedule.classroom_id,
                    "day_of_week": schedule.day_of_week,
                    "day_of_week_text": day_map.get(schedule.day_of_week, "未知"),
                    "day_name": day_map.get(schedule.day_of_week, "未知"),  # 添加前端可能需要的字段
                    "start_time": start_time,
                    "end_time": end_time,
                    "weeks": weeks_value,
                    "course": course_data,
                    "teacher": teacher_data,
                    "classroom": classroom_data,
                    "semester": semester_value,
                    "academicYear": "2023-2024",  # 默认学年
                    "course_name": course_data["name"],      # 添加快捷访问字段
                    "teacher_name": teacher_data["name"],    # 添加快捷访问字段
                    "room_no": classroom_data["name"],       # 添加快捷访问字段
                    "building": classroom_data["building"],  # 添加快捷访问字段
                    "course_offering": {
                        "offering_id": schedule.offering_id,
                        "course": course_data,
                        "teacher": teacher_data,
                        "semester": semester_value,
                        "academicYear": "2023-2024"  # 默认学年
                    }
                }
                
                schedule_list.append(schedule_data)
            except Exception as e:
                print(f"处理排课数据时出错: {str(e)}")
                # 继续处理下一条记录
        
        # 构建前端期望的响应格式，确保分页信息正确
        response_data = {
            "list": schedule_list,
            "total": total,
            "page": int(page),           # 确保是整数类型
            "pageSize": int(pageSize),   # 确保是整数类型
            "totalPages": totalPages
        }
        
        print(f"返回数据: 总数={total}, 当前页={page}, 页大小={pageSize}, 总页数={totalPages}, 结果数量={len(schedule_list)}")
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=response_data
        )
    except Exception as e:
        error_msg = f"获取排课列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        # 返回友好的错误响应，包含空数据
        return APIResponse(
            code=0,
            message="获取成功（处理过程中有错误）",
            data={
                "list": [],
                "total": 0,
                "page": int(page) if page else 1,
                "pageSize": int(pageSize) if pageSize else 20,
                "totalPages": 0
            }
        )


@router.post("", response_model=APIResponse)
def create_schedule(
    schedule_data: dict,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["SCHEDULE_MANAGE"])),
) -> Any:
    """
    创建新排课
    """
    try:
        # 检查必要参数
        required_fields = ["offering_id", "classroom_id", "day_of_week", "start_time", "end_time", "weeks"]
        for field in required_fields:
            if field not in schedule_data or schedule_data[field] is None:
                raise HTTPException(status_code=400, detail=f"缺少参数: {field}")
        
        # 验证开课信息
        offering = db.query(CourseOffering).options(
            joinedload(CourseOffering.course),
            joinedload(CourseOffering.teacher).joinedload(Teacher.user)
        ).filter(
            CourseOffering.offering_id == schedule_data["offering_id"]
        ).first()
        if not offering:
            raise HTTPException(status_code=404, detail="开课信息不存在")
        
        # 验证教室信息
        classroom = db.query(Classroom).filter(
            Classroom.classroom_id == schedule_data["classroom_id"]
        ).first()
        if not classroom:
            raise HTTPException(status_code=404, detail="教室不存在")
        
        # 验证时间格式
        try:
            datetime.strptime(schedule_data["start_time"], "%H:%M")
            datetime.strptime(schedule_data["end_time"], "%H:%M")
        except ValueError:
            raise HTTPException(status_code=400, detail="时间格式错误，应为HH:MM")
        
        # 验证时间冲突
        # 1. 教室在同一天同一时间段是否已被占用
        conflicts = check_classroom_conflicts(
            db, 
            None, 
            schedule_data["classroom_id"], 
            schedule_data["day_of_week"], 
            schedule_data["start_time"], 
            schedule_data["end_time"],
            schedule_data["weeks"]
        )
        if conflicts:
            raise HTTPException(status_code=400, detail="该教室在所选时间段已被占用")
        
        # 2. 教师在同一天同一时间段是否已有其他课程
        teacher_conflicts = check_teacher_conflicts(
            db, 
            None, 
            offering.teacher_id, 
            schedule_data["day_of_week"], 
            schedule_data["start_time"], 
            schedule_data["end_time"],
            schedule_data["weeks"]
        )
        if teacher_conflicts:
            raise HTTPException(status_code=400, detail="该教师在所选时间段已有其他课程")
        
        # 创建新排课
        new_schedule = Schedule(
            offering_id=schedule_data["offering_id"],
            classroom_id=schedule_data["classroom_id"],
            day_of_week=schedule_data["day_of_week"],
            start_time=schedule_data["start_time"],
            end_time=schedule_data["end_time"],
            weeks=schedule_data["weeks"]
        )
        
        db.add(new_schedule)
        db.commit()
        db.refresh(new_schedule)
        
        # 星期几映射到中文
        day_map = {1: "周一", 2: "周二", 3: "周三", 4: "周四", 5: "周五", 6: "周六", 7: "周日"}
        
        # 构建前端期望的响应数据结构
        result = {
            "schedule_id": new_schedule.schedule_id,
            "offering_id": new_schedule.offering_id,
            "classroom_id": new_schedule.classroom_id,
            "day_of_week": new_schedule.day_of_week,
            "start_time": new_schedule.start_time,
            "end_time": new_schedule.end_time,
            "weeks": new_schedule.weeks,
            "course_offering": {
                "offering_id": offering.offering_id,
                "course_id": offering.course_id,
                "teacher_id": offering.teacher_id,
                "semester": offering.semester,
                "max_students": offering.max_students,
                "current_students": offering.current_students,
                "status": offering.status,
                "course": {
                    "course_id": offering.course.course_id if offering.course else None,
                    "course_code": offering.course.course_code if offering.course else None,
                    "course_name": offering.course.course_name if offering.course else None,
                    "credits": float(offering.course.credits) if offering.course and offering.course.credits else None,
                    "hours": offering.course.hours if offering.course else None,
                    "course_type": offering.course.course_type if offering.course else None
                } if offering.course else None,
                "teacher": {
                    "teacher_id": offering.teacher.teacher_id if offering.teacher else None,
                    "user_id": offering.teacher.user_id if offering.teacher else None,
                    "user": {
                        "real_name": offering.teacher.user.real_name if offering.teacher and offering.teacher.user else None
                    } if offering.teacher and offering.teacher.user else None
                } if offering.teacher else None
            },
            "classroom": {
                "classroom_id": classroom.classroom_id,
                "room_no": classroom.room_no,
                "building": classroom.building,
                "capacity": classroom.capacity,
                "room_type": classroom.room_type
            }
        }
        
        return APIResponse(
            code=0,
            message="创建成功",
            data=result
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"创建排课失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"创建排课失败: {str(e)}")


@router.get("/grid-view")
def get_schedule_grid_view(
    db: Session = Depends(get_db),
    semester: str = Query(None),
    teacher_id: str = Query(None),
    classroom_id: str = Query(None),
    include_conflicts: bool = Query(True),  # 默认检测冲突
    _: Any = Depends(deps.check_permissions(["SCHEDULE_VIEW"])),
) -> Any:
    """
    获取课程表视图所需的排课数据
    """
    try:
        print(f"课程表视图API接收参数: semester={semester}, teacher_id={teacher_id}, classroom_id={classroom_id}, include_conflicts={include_conflicts}")
        
        # 如果没有提供学期，则默认使用最新的学期
        if not semester:
            try:
                latest_offering = db.query(CourseOffering).order_by(CourseOffering.semester.desc()).first()
                if latest_offering:
                    semester = latest_offering.semester
                    print(f"未提供学期，使用最新学期: {semester}")
                else:
                    semester = "2023-2024-1"  # 兜底默认值
                    print(f"未找到有效学期，使用默认学期: {semester}")
            except Exception as e:
                print(f"获取最新学期出错: {str(e)}，使用默认值")
                semester = "2023-2024-1"

        # 处理空字符串和None参数
        semester = None if semester == "" or semester is None else semester
        teacher_id = None if teacher_id == "" or teacher_id is None else teacher_id
        classroom_id = None if classroom_id == "" or classroom_id is None else classroom_id
        
        # 处理teacher_id参数，转换为整数类型
        teacher_id_int = None
        if teacher_id:
            try:
                teacher_id_int = int(teacher_id)
                print(f"转换teacher_id为整数: {teacher_id_int}")
            except ValueError:
                print(f"无效的teacher_id参数，无法转换为整数: {teacher_id}")
                teacher_id_int = None
        
        # 处理classroom_id参数，可能是ID或房间号
        classroom_id_value = None
        classroom_room_no = None
        
        if classroom_id:
            try:
                # 尝试作为整数处理
                classroom_id_value = int(classroom_id)
                print(f"转换classroom_id为整数: {classroom_id_value}")
            except ValueError:
                # 如果不是整数，则作为房间号处理
                classroom_room_no = classroom_id
                print(f"将classroom_id作为房间号处理: {classroom_room_no}")
        
        # 创建一个包含关联对象的查询
        query = db.query(Schedule).options(
            joinedload(Schedule.offering).joinedload(CourseOffering.course),
            joinedload(Schedule.offering).joinedload(CourseOffering.teacher).joinedload(Teacher.user),
            joinedload(Schedule.classroom)
        )
        
        # 应用过滤条件
        if semester:
            query = query.join(CourseOffering, Schedule.offering_id == CourseOffering.offering_id, isouter=True)
            query = query.filter(CourseOffering.semester == semester)
            print(f"应用学期过滤: {semester}")
        
        if teacher_id_int:
            if 'CourseOffering' not in str(query.statement):
                query = query.join(CourseOffering, Schedule.offering_id == CourseOffering.offering_id, isouter=True)
            query = query.filter(CourseOffering.teacher_id == teacher_id_int)
            print(f"应用教师过滤: {teacher_id_int}")
        
        # 根据教室ID或房间号进行过滤
        if classroom_id_value:
            query = query.filter(Schedule.classroom_id == classroom_id_value)
            print(f"应用教室ID过滤: {classroom_id_value}")
        elif classroom_room_no:
            # 如果提供的是房间号，则需要先找到对应的教室ID
            classroom = db.query(Classroom).filter(Classroom.room_no == classroom_room_no).first()
            if classroom:
                query = query.filter(Schedule.classroom_id == classroom.classroom_id)
                print(f"应用教室房间号过滤: {classroom_room_no} -> ID: {classroom.classroom_id}")
            else:
                print(f"未找到房间号为 {classroom_room_no} 的教室")
                # 返回空列表，因为找不到对应的教室
                return APIResponse(code=0, message="获取成功", data=[])
        
        # 添加排序，确保结果一致性
        query = query.order_by(Schedule.day_of_week, Schedule.start_time, Schedule.schedule_id)
        
        # 执行查询
        try:
            schedules = query.all()
            print(f"查询到 {len(schedules)} 条排课记录")
        except Exception as e:
            error_msg = f"执行查询时出错: {str(e)}\n{traceback.format_exc()}"
            print(error_msg)
            return APIResponse(code=0, message="查询出错", data=[])
        
        # 星期几映射到中文
        day_map = {1: "周一", 2: "周二", 3: "周三", 4: "周四", 5: "周五", 6: "周六", 7: "周日"}
        
        # 安全获取属性的辅助函数
        def safe_get(obj, attr_path, default=None):
            """安全地获取嵌套对象的属性，如果任何路径不存在则返回默认值"""
            if obj is None:
                return default
                
            attrs = attr_path.split('.')
            current = obj
            
            for attr in attrs:
                if hasattr(current, attr):
                    current = getattr(current, attr)
                    if current is None:
                        return default
                else:
                    return default
                    
            return current
        
        # 构建响应数据
        schedule_list = []
        
        # 用于检测冲突的数据结构
        if include_conflicts:
            print("将检测排课冲突...")
            classroom_bookings = {}  # 教室预订: {classroom_id: {day_of_week: [{schedule_id, start_minutes, end_minutes, weeks_set}]}}
            teacher_bookings = {}    # 教师预订: {teacher_id: {day_of_week: [{schedule_id, start_minutes, end_minutes, weeks_set}]}}
        
        for schedule in schedules:
            try:
                # 获取课程信息 - 确保字段名与前端期望一致
                course_data = {
                    "id": 0,
                    "code": "未知代码",
                    "name": "未知课程", 
                    "course_type": "DEFAULT",
                    "course_code": "未知代码",
                    "course_name": "未知课程"
                }
                
                # 使用安全获取函数
                course_id = safe_get(schedule, 'offering.course.course_id', 0)
                course_code = safe_get(schedule, 'offering.course.course_code', "未知代码")
                course_name = safe_get(schedule, 'offering.course.course_name', "未知课程")
                course_type = safe_get(schedule, 'offering.course.course_type', "DEFAULT") or "DEFAULT"
                
                if course_id > 0:
                    course_data = {
                        "id": course_id,
                        "code": course_code,
                        "name": course_name,
                        "course_type": course_type,
                        "course_code": course_code,
                        "course_name": course_name
                    }
                
                # 获取教师信息 - 按照前端期望的结构
                teacher_data = {
                    "id": 0, 
                    "name": "未知教师",
                    "user": {"real_name": "未知教师"}
                }
                
                # 使用安全获取函数
                teacher_id = safe_get(schedule, 'offering.teacher.teacher_id', 0)
                teacher_name = safe_get(schedule, 'offering.teacher.user.real_name', "未知教师")
                
                if teacher_id > 0:
                    teacher_data = {
                        "id": teacher_id,
                        "name": teacher_name,
                        "user": {"real_name": teacher_name}
                    }
                
                # 获取教室信息 - 按照前端期望的结构
                classroom_data = {
                    "id": 0, 
                    "name": "未安排", 
                    "building": "未安排"
                }
                
                # 使用安全获取函数
                classroom_id = safe_get(schedule, 'classroom.classroom_id', 0)
                classroom_name = safe_get(schedule, 'classroom.room_no', "未安排")
                classroom_building = safe_get(schedule, 'classroom.building', "未安排")
                
                if classroom_id > 0:
                    classroom_data = {
                        "id": classroom_id,
                        "name": classroom_name,
                        "building": classroom_building,
                        "room_no": classroom_name
                    }
                
                # 获取学期信息
                semester_value = safe_get(schedule, 'offering.semester', "未知")
                
                # 安全获取时间属性并格式化
                start_time = format_time(getattr(schedule, 'start_time', None))
                end_time = format_time(getattr(schedule, 'end_time', None))
                
                # 安全获取周数
                weeks_value = ensure_valid_weeks_format(getattr(schedule, 'weeks', None))
                weeks_set = parse_weeks(weeks_value)
                
                # 获取排课ID和开课ID
                schedule_id = getattr(schedule, 'schedule_id', 0)
                offering_id = getattr(schedule, 'offering_id', 0)
                day_of_week = getattr(schedule, 'day_of_week', 1)
                
                # 构建前端期望的课程表数据结构
                schedule_data = {
                    "schedule_id": schedule_id,
                    "id": schedule_id,
                    "offering_id": offering_id,
                    "classroom_id": classroom_id,
                    "day_of_week": day_of_week,
                    "day_of_week_text": day_map.get(day_of_week, "未知"),
                    "day_name": day_map.get(day_of_week, "未知"),  # 添加前端需要的day_name字段
                    "start_time": start_time,
                    "end_time": end_time,
                    "weeks": weeks_value,
                    "classroom": classroom_data,
                    "course": course_data,
                    "teacher": teacher_data,
                    "semester": semester_value,
                    "course_offering": {
                        "offering_id": offering_id,
                        "course": course_data,
                        "teacher": teacher_data,
                        "semester": semester_value,
                        "academicYear": "2023-2024"  # 默认学年
                    },
                    "course_name": course_data["name"],     # 添加快捷访问字段
                    "teacher_name": teacher_data["name"],   # 添加快捷访问字段
                    "room_no": classroom_data["name"],      # 添加快捷访问字段
                    "building": classroom_data["building"], # 添加快捷访问字段
                    "has_conflict": False  # 默认无冲突
                }
                
                # 如果需要检测冲突
                if include_conflicts:
                    # 将时间转换为分钟
                    try:
                        s_hour, s_minute = map(int, start_time.split(':'))
                        e_hour, e_minute = map(int, end_time.split(':'))
                        
                        start_minutes = s_hour * 60 + s_minute
                        end_minutes = e_hour * 60 + e_minute
                        
                        # 添加到教室预订
                        if classroom_id > 0:
                            if classroom_id not in classroom_bookings:
                                classroom_bookings[classroom_id] = {}
                            if day_of_week not in classroom_bookings[classroom_id]:
                                classroom_bookings[classroom_id][day_of_week] = []
                                
                            classroom_bookings[classroom_id][day_of_week].append({
                                "schedule_id": schedule_id,
                                "start_minutes": start_minutes,
                                "end_minutes": end_minutes,
                                "weeks_set": weeks_set
                            })
                        
                        # 添加到教师预订
                        if teacher_id > 0:
                            if teacher_id not in teacher_bookings:
                                teacher_bookings[teacher_id] = {}
                            if day_of_week not in teacher_bookings[teacher_id]:
                                teacher_bookings[teacher_id][day_of_week] = []
                                
                            teacher_bookings[teacher_id][day_of_week].append({
                                "schedule_id": schedule_id,
                                "start_minutes": start_minutes,
                                "end_minutes": end_minutes,
                                "weeks_set": weeks_set
                            })
                    except Exception as e:
                        print(f"处理时间数据时出错: {e}")
                
                schedule_list.append(schedule_data)
            except Exception as e:
                print(f"处理排课记录时出错: {str(e)}")
                # 继续处理下一条记录
        
        # 检测冲突
        if include_conflicts and schedule_list:
            print("开始检测排课冲突...")
            
            # 检查教室冲突
            for classroom_id, days in classroom_bookings.items():
                for day, bookings in days.items():
                    if len(bookings) < 2:
                        continue  # 如果同一教室同一天只有一个预订，不会有冲突
                    
                    # 检查该教室该天的所有预订是否有冲突
                    for i in range(len(bookings)):
                        for j in range(i + 1, len(bookings)):
                            booking_i = bookings[i]
                            booking_j = bookings[j]
                            
                            # 检查时间是否重叠
                            time_overlap = (booking_i["end_minutes"] > booking_j["start_minutes"] and 
                                           booking_i["start_minutes"] < booking_j["end_minutes"])
                            
                            if time_overlap:
                                # 检查周数是否重叠
                                if not booking_i["weeks_set"].isdisjoint(booking_j["weeks_set"]):
                                    # 标记这两个预订有冲突
                                    for schedule_data in schedule_list:
                                        if schedule_data["id"] == booking_i["schedule_id"] or schedule_data["id"] == booking_j["schedule_id"]:
                                            schedule_data["has_conflict"] = True
                                            schedule_data["conflict_type"] = "classroom"
            
            # 检查教师冲突
            for teacher_id, days in teacher_bookings.items():
                for day, bookings in days.items():
                    if len(bookings) < 2:
                        continue  # 如果同一教师同一天只有一个预订，不会有冲突
                    
                    # 检查该教师该天的所有预订是否有冲突
                    for i in range(len(bookings)):
                        for j in range(i + 1, len(bookings)):
                            booking_i = bookings[i]
                            booking_j = bookings[j]
                            
                            # 检查时间是否重叠
                            time_overlap = (booking_i["end_minutes"] > booking_j["start_minutes"] and 
                                           booking_i["start_minutes"] < booking_j["end_minutes"])
                            
                            if time_overlap:
                                # 检查周数是否重叠
                                if not booking_i["weeks_set"].isdisjoint(booking_j["weeks_set"]):
                                    # 标记这两个预订有冲突
                                    for schedule_data in schedule_list:
                                        if schedule_data["id"] == booking_i["schedule_id"] or schedule_data["id"] == booking_j["schedule_id"]:
                                            schedule_data["has_conflict"] = True
                                            conflict_type = schedule_data.get("conflict_type", "")
                                            if conflict_type:
                                                schedule_data["conflict_type"] = conflict_type + ",teacher"
                                            else:
                                                schedule_data["conflict_type"] = "teacher"
            
            conflict_count = sum(1 for s in schedule_list if s.get("has_conflict", False))
            print(f"冲突检测完成，发现 {conflict_count} 个冲突")
        
        print(f"返回课程表视图数据: {len(schedule_list)} 条记录")
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=schedule_list
        )
    except Exception as e:
        error_msg = f"获取课程表视图数据失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        # 返回空数据而不是抛出异常，确保前端不会因为后端错误而崩溃
        return APIResponse(
            code=0,
            message="获取成功（处理过程中有错误）",
            data=[]
        )


@router.get("/{schedule_id}", response_model=APIResponse)
def get_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["SCHEDULE_VIEW"])),
) -> Any:
    """
    获取排课详情
    """
    try:
        schedule = db.query(Schedule).options(
            joinedload(Schedule.offering).joinedload(CourseOffering.course),
            joinedload(Schedule.offering).joinedload(CourseOffering.teacher).joinedload(Teacher.user),
            joinedload(Schedule.classroom)
        ).filter(Schedule.schedule_id == schedule_id).first()
        
        if not schedule:
            raise HTTPException(status_code=404, detail="排课记录不存在")
        
        # 星期几映射到中文
        day_map = {1: "周一", 2: "周二", 3: "周三", 4: "周四", 5: "周五", 6: "周六", 7: "周日"}

        # 构建课程、教师和教室数据
        course_data = None
        if schedule.offering and schedule.offering.course:
            course_data = {
                "id": schedule.offering.course.course_id,
                "code": schedule.offering.course.course_code,
                "name": schedule.offering.course.course_name
            }
        
        teacher_data = None
        if schedule.offering and schedule.offering.teacher and schedule.offering.teacher.user:
            teacher_data = {
                "id": schedule.offering.teacher.teacher_id,
                "name": schedule.offering.teacher.user.real_name
            }
        
        classroom_data = None
        if schedule.classroom:
            classroom_data = {
                "id": schedule.classroom.classroom_id,
                "name": schedule.classroom.room_no,
                "building": schedule.classroom.building
            }

        # 构建响应
        result = {
            "id": schedule.schedule_id,
            "offering_id": schedule.offering_id,
            "classroom_id": schedule.classroom_id,
            "day_of_week": schedule.day_of_week,
            "day_of_week_text": day_map.get(schedule.day_of_week, "未知"),
            "start_time": schedule.start_time,
            "end_time": schedule.end_time,
            "weeks": schedule.weeks,
            "course": course_data or {"id": 0, "code": "未知", "name": "未知"},
            "teacher": teacher_data or {"id": 0, "name": "未知"},
            "classroom": classroom_data or {"id": 0, "name": "未安排", "building": "未安排"},
            "semester": schedule.offering.semester if schedule.offering else "未知",
            "academicYear": "2023-2024"  # 默认学年，如果数据库有这个字段，应该改为实际值
        }
        
        # 为前端提供更兼容的格式
        result["course_offering"] = {
            "offering_id": schedule.offering_id,
            "course": course_data,
            "teacher": teacher_data,
            "semester": schedule.offering.semester if schedule.offering else "未知"
        } if schedule.offering else None
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=result
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"获取排课详情失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取排课详情失败: {str(e)}")


@router.put("/{schedule_id}", response_model=APIResponse)
def update_schedule(
    schedule_id: int,
    schedule_data: dict,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["SCHEDULE_MANAGE"])),
) -> Any:
    """
    更新排课信息
    """
    try:
        schedule = db.query(Schedule).filter(Schedule.schedule_id == schedule_id).first()
        if not schedule:
            raise HTTPException(status_code=404, detail="排课记录不存在")
        
        # 如果更新了教室
        if "classroom_id" in schedule_data and schedule_data["classroom_id"] != schedule.classroom_id:
            classroom = db.query(Classroom).filter(
                Classroom.classroom_id == schedule_data["classroom_id"]
            ).first()
            if not classroom:
                raise HTTPException(status_code=404, detail="教室不存在")
        
        # 如果更新了时间，验证时间格式
        if "start_time" in schedule_data or "end_time" in schedule_data:
            start_time = schedule_data.get("start_time", schedule.start_time)
            end_time = schedule_data.get("end_time", schedule.end_time)
            try:
                datetime.strptime(start_time, "%H:%M")
                datetime.strptime(end_time, "%H:%M")
            except ValueError:
                raise HTTPException(status_code=400, detail="时间格式错误，应为HH:MM")
        
        # 验证时间冲突
        if any(key in schedule_data for key in ["classroom_id", "day_of_week", "start_time", "end_time", "weeks"]):
            classroom_id = schedule_data.get("classroom_id", schedule.classroom_id)
            day_of_week = schedule_data.get("day_of_week", schedule.day_of_week)
            start_time = schedule_data.get("start_time", schedule.start_time)
            end_time = schedule_data.get("end_time", schedule.end_time)
            weeks = schedule_data.get("weeks", schedule.weeks)
            
            # 检查教室冲突
            conflicts = check_classroom_conflicts(
                db, 
                schedule_id, 
                classroom_id, 
                day_of_week, 
                start_time, 
                end_time,
                weeks
            )
            if conflicts:
                raise HTTPException(status_code=400, detail="该教室在所选时间段已被占用")
            
            # 检查教师冲突
            offering = db.query(CourseOffering).filter(
                CourseOffering.offering_id == schedule.offering_id
            ).first()
            if offering:
                teacher_conflicts = check_teacher_conflicts(
                    db, 
                    schedule_id, 
                    offering.teacher_id, 
                    day_of_week, 
                    start_time, 
                    end_time,
                    weeks
                )
                if teacher_conflicts:
                    raise HTTPException(status_code=400, detail="该教师在所选时间段已有其他课程")
        
        # 更新字段
        update_fields = ["classroom_id", "day_of_week", "start_time", "end_time", "weeks"]
        for field in update_fields:
            if field in schedule_data:
                setattr(schedule, field, schedule_data[field])
        
        db.commit()
        db.refresh(schedule)
        
        # 重新加载关联数据
        schedule = db.query(Schedule).options(
            joinedload(Schedule.offering).joinedload(CourseOffering.course),
            joinedload(Schedule.offering).joinedload(CourseOffering.teacher).joinedload(Teacher.user),
            joinedload(Schedule.classroom)
        ).filter(Schedule.schedule_id == schedule_id).first()
        
        # 构建前端期望的响应数据结构
        result = {
            "schedule_id": schedule.schedule_id,
            "offering_id": schedule.offering_id,
            "classroom_id": schedule.classroom_id,
            "day_of_week": schedule.day_of_week,
            "start_time": schedule.start_time,
            "end_time": schedule.end_time,
            "weeks": schedule.weeks
        }
        
        # 添加关联数据
        if schedule.offering:
            result["course_offering"] = {
                "offering_id": schedule.offering.offering_id,
                "course_id": schedule.offering.course_id,
                "teacher_id": schedule.offering.teacher_id,
                "semester": schedule.offering.semester,
                "max_students": schedule.offering.max_students,
                "current_students": schedule.offering.current_students,
                "status": schedule.offering.status
            }
            
            if schedule.offering.course:
                result["course_offering"]["course"] = {
                    "course_id": schedule.offering.course.course_id,
                    "course_code": schedule.offering.course.course_code,
                    "course_name": schedule.offering.course.course_name,
                    "credits": float(schedule.offering.course.credits) if schedule.offering.course.credits else None,
                    "hours": schedule.offering.course.hours,
                    "course_type": schedule.offering.course.course_type
                }
            
            if schedule.offering.teacher:
                result["course_offering"]["teacher"] = {
                    "teacher_id": schedule.offering.teacher.teacher_id,
                    "user_id": schedule.offering.teacher.user_id
                }
                
                if schedule.offering.teacher.user:
                    result["course_offering"]["teacher"]["user"] = {
                        "real_name": schedule.offering.teacher.user.real_name
                    }
        
        if schedule.classroom:
            result["classroom"] = {
                "classroom_id": schedule.classroom.classroom_id,
                "room_no": schedule.classroom.room_no,
                "building": schedule.classroom.building,
                "capacity": schedule.classroom.capacity,
                "room_type": schedule.classroom.room_type
            }
        
        return APIResponse(
            code=0,
            message="更新成功",
            data=result
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"更新排课失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"更新排课失败: {str(e)}")


@router.delete("/{schedule_id}", response_model=APIResponse)
def delete_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["SCHEDULE_MANAGE"])),
) -> Any:
    """
    删除排课
    """
    try:
        schedule = db.query(Schedule).filter(Schedule.schedule_id == schedule_id).first()
        if not schedule:
            raise HTTPException(status_code=404, detail="排课记录不存在")
        
        db.delete(schedule)
        db.commit()
        
        return APIResponse(
            code=0,
            message="删除成功"
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"删除排课失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"删除排课失败: {str(e)}")


@router.get("/by-offering/{offering_id}", response_model=APIResponse)
def get_schedules_by_offering(
    offering_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["SCHEDULE_VIEW"])),
) -> Any:
    """
    根据开课ID获取排课列表
    """
    try:
        schedules = db.query(Schedule).options(
            joinedload(Schedule.offering).joinedload(CourseOffering.course),
            joinedload(Schedule.offering).joinedload(CourseOffering.teacher),
            joinedload(Schedule.classroom)
        ).filter(Schedule.offering_id == offering_id).all()
        
        # 构建响应
        schedule_list = []
        for schedule in schedules:
            schedule_data = {
                "id": schedule.schedule_id,
                "offering_id": schedule.offering_id,
                "classroom_id": schedule.classroom_id,
                "day_of_week": schedule.day_of_week,
                "start_time": schedule.start_time,
                "end_time": schedule.end_time,
                "weeks": schedule.weeks,
                "course_name": schedule.offering.course.course_name if schedule.offering and schedule.offering.course else None,
                "course_code": schedule.offering.course.course_code if schedule.offering and schedule.offering.course else None,
                "teacher_name": schedule.offering.teacher.user.real_name if schedule.offering and schedule.offering.teacher and schedule.offering.teacher.user else None,
                "classroom_name": schedule.classroom.room_no if schedule.classroom else None,
                "building": schedule.classroom.building if schedule.classroom else None,
                "semester": schedule.offering.semester if schedule.offering else None
            }
            schedule_list.append(schedule_data)
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=schedule_list
        )
    except Exception as e:
        error_msg = f"获取排课列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取排课列表失败: {str(e)}")


@router.get("/by-classroom/{classroom_id}", response_model=APIResponse)
def get_schedules_by_classroom(
    classroom_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["SCHEDULE_VIEW"])),
) -> Any:
    """
    根据教室ID获取排课列表
    """
    try:
        schedules = db.query(Schedule).options(
            joinedload(Schedule.offering).joinedload(CourseOffering.course),
            joinedload(Schedule.offering).joinedload(CourseOffering.teacher),
            joinedload(Schedule.classroom)
        ).filter(Schedule.classroom_id == classroom_id).all()
        
        # 构建响应
        schedule_list = []
        for schedule in schedules:
            schedule_data = {
                "id": schedule.schedule_id,
                "offering_id": schedule.offering_id,
                "classroom_id": schedule.classroom_id,
                "day_of_week": schedule.day_of_week,
                "start_time": schedule.start_time,
                "end_time": schedule.end_time,
                "weeks": schedule.weeks,
                "course_name": schedule.offering.course.course_name if schedule.offering and schedule.offering.course else None,
                "course_code": schedule.offering.course.course_code if schedule.offering and schedule.offering.course else None,
                "teacher_name": schedule.offering.teacher.user.real_name if schedule.offering and schedule.offering.teacher and schedule.offering.teacher.user else None,
                "classroom_name": schedule.classroom.room_no if schedule.classroom else None,
                "building": schedule.classroom.building if schedule.classroom else None,
                "semester": schedule.offering.semester if schedule.offering else None
            }
            schedule_list.append(schedule_data)
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=schedule_list
        )
    except Exception as e:
        error_msg = f"获取排课列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取排课列表失败: {str(e)}")


@router.get("/by-teacher/{teacher_id}", response_model=APIResponse)
def get_schedules_by_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    semester: str = None,
    _: Any = Depends(deps.check_permissions(["SCHEDULE_VIEW"])),
) -> Any:
    """
    根据教师ID获取排课列表
    """
    try:
        query = db.query(Schedule).options(
            joinedload(Schedule.offering).joinedload(CourseOffering.course),
            joinedload(Schedule.offering).joinedload(CourseOffering.teacher),
            joinedload(Schedule.classroom)
        ).join(CourseOffering).filter(CourseOffering.teacher_id == teacher_id)
        
        if semester:
            query = query.filter(CourseOffering.semester == semester)
        
        schedules = query.all()
        
        # 构建响应
        schedule_list = []
        for schedule in schedules:
            schedule_data = {
                "id": schedule.schedule_id,
                "offering_id": schedule.offering_id,
                "classroom_id": schedule.classroom_id,
                "day_of_week": schedule.day_of_week,
                "start_time": schedule.start_time,
                "end_time": schedule.end_time,
                "weeks": schedule.weeks,
                "course_name": schedule.offering.course.course_name if schedule.offering and schedule.offering.course else None,
                "course_code": schedule.offering.course.course_code if schedule.offering and schedule.offering.course else None,
                "teacher_name": schedule.offering.teacher.user.real_name if schedule.offering and schedule.offering.teacher and schedule.offering.teacher.user else None,
                "classroom_name": schedule.classroom.room_no if schedule.classroom else None,
                "building": schedule.classroom.building if schedule.classroom else None,
                "semester": schedule.offering.semester if schedule.offering else None
            }
            schedule_list.append(schedule_data)
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=schedule_list
        )
    except Exception as e:
        error_msg = f"获取排课列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取排课列表失败: {str(e)}")


@router.get("/by-student/{student_id}", response_model=APIResponse)
def get_schedules_by_student(
    student_id: int,
    db: Session = Depends(get_db),
    semester: str = None,
    _: Any = Depends(deps.check_permissions(["SCHEDULE_VIEW", "MY_SCHEDULE_VIEW"])),
) -> Any:
    """
    根据学生ID获取排课列表
    """
    try:
        # 使用SQL查询获取学生选课的排课信息
        query = """
        SELECT s.schedule_id, s.offering_id, s.classroom_id, s.day_of_week, 
               s.start_time, s.end_time, s.weeks, 
               c.course_name, c.course_code, u.real_name AS teacher_name, 
               cr.room_no, cr.building, co.semester
        FROM schedule s
        JOIN course_offering co ON s.offering_id = co.offering_id
        JOIN enrollment e ON co.offering_id = e.offering_id
        JOIN course c ON co.course_id = c.course_id
        JOIN teacher t ON co.teacher_id = t.teacher_id
        JOIN user u ON t.user_id = u.user_id
        JOIN classroom cr ON s.classroom_id = cr.classroom_id
        WHERE e.student_id = :student_id AND e.status = 1
        """
        
        params = {"student_id": student_id}
        
        if semester:
            query += " AND co.semester = :semester"
            params["semester"] = semester
        
        result = db.execute(text(query), params).fetchall()
        
        # 构建响应
        schedule_list = []
        for row in result:
            schedule_data = {
                "id": row[0],
                "offering_id": row[1],
                "classroom_id": row[2],
                "day_of_week": row[3],
                "start_time": row[4],
                "end_time": row[5],
                "weeks": row[6],
                "course_name": row[7],
                "course_code": row[8],
                "teacher_name": row[9],
                "classroom_name": row[10],
                "building": row[11],
                "semester": row[12]
            }
            schedule_list.append(schedule_data)
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=schedule_list
        )
    except Exception as e:
        error_msg = f"获取排课列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取排课列表失败: {str(e)}")


@router.get("/my-schedule", response_model=APIResponse)
def get_my_schedule(
    db: Session = Depends(get_db),
    current_user: Any = Depends(deps.get_current_active_user),
    semester: str = None,
    _: Any = Depends(deps.check_permissions(["MY_SCHEDULE_VIEW"])),
) -> Any:
    """
    获取当前用户的课程表
    """
    try:
        # 检查用户是否是学生
        student = None
        teacher = None
        
        if hasattr(current_user, 'student_info') and current_user.student_info:
            student = current_user.student_info
        elif hasattr(current_user, 'teacher_info') and current_user.teacher_info:
            teacher = current_user.teacher_info
        
        if student:
            # 获取学生的课程表
            return get_schedules_by_student(student.student_id, db, semester)
        elif teacher:
            # 获取教师的课程表
            return get_schedules_by_teacher(teacher.teacher_id, db, semester)
        else:
            raise HTTPException(status_code=400, detail="当前用户不是学生或教师")
        
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"获取课程表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取课程表失败: {str(e)}")


@router.get("/by-semester/{semester}", response_model=APIResponse)
def get_schedules_by_semester(
    semester: str,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["SCHEDULE_VIEW"])),
) -> Any:
    """
    根据学期获取排课列表
    """
    try:
        # 创建一个包含关联对象的查询
        schedules = db.query(Schedule).options(
            joinedload(Schedule.offering).joinedload(CourseOffering.course),
            joinedload(Schedule.offering).joinedload(CourseOffering.teacher),
            joinedload(Schedule.classroom)
        ).join(CourseOffering).filter(CourseOffering.semester == semester).all()
        
        # 构建响应
        schedule_list = []
        for schedule in schedules:
            schedule_data = {
                "id": schedule.schedule_id,
                "offering_id": schedule.offering_id,
                "classroom_id": schedule.classroom_id,
                "day_of_week": schedule.day_of_week,
                "start_time": schedule.start_time,
                "end_time": schedule.end_time,
                "weeks": schedule.weeks,
                "course_name": schedule.offering.course.course_name if schedule.offering and schedule.offering.course else None,
                "course_code": schedule.offering.course.course_code if schedule.offering and schedule.offering.course else None,
                "teacher_name": schedule.offering.teacher.user.real_name if schedule.offering and schedule.offering.teacher and schedule.offering.teacher.user else None,
                "classroom_name": schedule.classroom.room_no if schedule.classroom else None,
                "building": schedule.classroom.building if schedule.classroom else None,
                "semester": semester
            }
            schedule_list.append(schedule_data)
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=schedule_list
        )
    except Exception as e:
        error_msg = f"获取排课列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取排课列表失败: {str(e)}")


@router.get("/info-list", response_model=APIResponse)
def get_schedule_info_list(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    semester: str = None,
    day_of_week: int = None,
    keyword: str = None,
    teacher_id: int = None,  # 添加教师ID过滤
    classroom_id: int = None,  # 添加教室ID过滤
    _: Any = Depends(deps.check_permissions(["SCHEDULE_VIEW"])),
) -> Any:
    """
    获取排课信息列表（用于前端展示）
    """
    try:
        # 验证并标准化分页参数
        try:
            page = max(1, page)
            pageSize = max(1, min(100, pageSize))
            print(f"信息列表接口初始分页参数: page={page}, pageSize={pageSize}")
        except Exception as e:
            print(f"信息列表接口分页参数验证错误: {e}，使用默认值")
            page = 1
            pageSize = 20
            
        # 构建查询
        query = db.query(Schedule).options(
            joinedload(Schedule.offering).joinedload(CourseOffering.course),
            joinedload(Schedule.offering).joinedload(CourseOffering.teacher).joinedload(Teacher.user),
            joinedload(Schedule.classroom)
        )
        
        # 添加过滤条件
        if semester:
            query = query.join(CourseOffering, Schedule.offering_id == CourseOffering.offering_id, isouter=True)
            query = query.filter(CourseOffering.semester == semester)
            print(f"信息列表接口应用semester过滤: {semester}")
        
        if day_of_week is not None:
            query = query.filter(Schedule.day_of_week == day_of_week)
            print(f"信息列表接口应用day_of_week过滤: {day_of_week}")
            
        # 添加教师ID过滤
        if teacher_id:
            if 'CourseOffering' not in str(query.statement):
                query = query.join(CourseOffering, Schedule.offering_id == CourseOffering.offering_id, isouter=True)
            query = query.filter(CourseOffering.teacher_id == teacher_id)
            print(f"信息列表接口应用teacher_id过滤: {teacher_id}")
            
        # 添加教室ID过滤
        if classroom_id:
            query = query.filter(Schedule.classroom_id == classroom_id)
            print(f"信息列表接口应用classroom_id过滤: {classroom_id}")
            
        # 添加关键词搜索
        if keyword:
            # 确保已经连接了需要的表
            if 'CourseOffering' not in str(query.statement):
                query = query.join(CourseOffering, Schedule.offering_id == CourseOffering.offering_id, isouter=True)
                
            # 确保连接了课程表
            if 'Course' not in str(query.statement):
                query = query.join(CourseOffering.course, isouter=True)
            
            # 确保连接了教师表
            if 'Teacher' not in str(query.statement):
                query = query.join(CourseOffering.teacher, isouter=True)
            
            # 确保连接了用户表
            if 'User' not in str(query.statement):
                query = query.join(Teacher.user, isouter=True)
            
            # 确保连接了教室表
            if 'Classroom' not in str(query.statement):
                query = query.join(Schedule.classroom, isouter=True)
                
            # 对多个字段应用模糊搜索
            from sqlalchemy import or_
            from app.models.user import User  # 确保导入
            from app.models.course import Course  # 确保导入
            
            keyword_filter = or_(
                Course.course_name.like(f"%{keyword}%"),
                Course.course_code.like(f"%{keyword}%"),
                User.real_name.like(f"%{keyword}%"),
                Classroom.room_no.like(f"%{keyword}%"),
                Classroom.building.like(f"%{keyword}%")
            )
            query = query.filter(keyword_filter)
            print(f"信息列表接口应用keyword过滤: {keyword}")
            
        # 添加排序
        query = query.order_by(Schedule.day_of_week, Schedule.start_time)
            
        # 计算总数
        try:
            # 使用新版SQLAlchemy API获取计数
            count_query = db.query(func.count(Schedule.schedule_id))
            
            # 应用与主查询相同的过滤条件
            if hasattr(query, 'whereclause') and hasattr(query.whereclause, 'clauses'):
                for clause in query.whereclause.clauses:
                    count_query = count_query.filter(clause)
            
            total = count_query.scalar() or 0
            print(f"信息列表接口查询到总记录数: {total}")
        except Exception as e:
            print(f"信息列表接口优化计数查询失败: {str(e)}，回退到普通count方法")
            # 回退到普通count方法
            total = query.count()
            print(f"信息列表接口回退方法计算总数: {total}")
        
        # 计算总页数
        if total == 0:
            total_pages = 1
        else:
            total_pages = (total + pageSize - 1) // pageSize
            
        print(f"信息列表接口计算总页数: {total_pages}")
        
        # 确保请求的页码不超过总页数
        if page > total_pages and total > 0:
            page = total_pages
            print(f"信息列表接口页码超出范围，调整为: {page}")
        
        # 显式应用分页
        offset_value = (page - 1) * pageSize
        limit_value = pageSize
        print(f"信息列表接口应用分页: offset={offset_value}, limit={limit_value}")
        
        # 分页处理
        schedules = query.offset(offset_value).limit(limit_value).all()
        print(f"信息列表接口查询到 {len(schedules)} 条排课记录")
        
        # 星期几映射到中文
        day_map = {1: "周一", 2: "周二", 3: "周三", 4: "周四", 5: "周五", 6: "周六", 7: "周日"}
        
        # 构建响应数据
        schedule_info_list = []
        for schedule in schedules:
            try:
                # 获取课程名称和代码
                course_name = "未知课程"
                course_code = "未知代码"
                course_id = None
                if schedule.offering and schedule.offering.course:
                    course_name = schedule.offering.course.course_name or "未知课程"
                    course_code = schedule.offering.course.course_code or "未知代码"
                    course_id = schedule.offering.course.course_id
                
                # 获取教师姓名和ID
                teacher_name = "未知教师"
                teacher_id = None
                if schedule.offering and schedule.offering.teacher and schedule.offering.teacher.user:
                    teacher_name = schedule.offering.teacher.user.real_name or "未知教师"
                    teacher_id = schedule.offering.teacher.teacher_id
                
                # 获取教室信息
                room_no = "未知教室"
                building = "未知建筑"
                classroom_id = None
                if schedule.classroom:
                    room_no = schedule.classroom.room_no or "未知教室"
                    building = schedule.classroom.building or "未知建筑"
                    classroom_id = schedule.classroom.classroom_id
                
                # 获取学期信息
                semester_value = "未知学期"
                if schedule.offering:
                    semester_value = schedule.offering.semester or "未知学期"
                
                # 确保时间格式正确
                start_time = format_time(getattr(schedule, 'start_time', None))
                end_time = format_time(getattr(schedule, 'end_time', None))
                
                # 确保weeks字段格式正确
                weeks_value = ensure_valid_weeks_format(schedule.weeks or "")
                
                # 构建排课信息 - 确保与前端期望的字段对应
                schedule_info = {
                    "id": schedule.schedule_id,  # 添加id字段，便于前端使用
                    "schedule_id": schedule.schedule_id,
                    "offering_id": schedule.offering_id,
                    "course_id": course_id,
                    "classroom_id": classroom_id,
                    "teacher_id": teacher_id,
                    "course_name": course_name,
                    "course_code": course_code,
                    "teacher_name": teacher_name,
                    "room_no": room_no,
                    "building": building,
                    "day_of_week": schedule.day_of_week,
                    "day_name": day_map.get(schedule.day_of_week, "未知"),
                    "start_time": start_time,
                    "end_time": end_time,
                    "weeks": weeks_value,
                    "semester": semester_value
                }
                
                schedule_info_list.append(schedule_info)
            except Exception as e:
                print(f"信息列表接口处理排课数据时出错: {str(e)}")
                # 继续处理下一条记录
        
        # 构建前端期望的响应格式
        response_data = {
            "list": schedule_info_list,
            "total": total,
            "page": int(page),
            "pageSize": int(pageSize),
            "totalPages": total_pages
        }
        
        print(f"信息列表接口返回数据: 总数={total}, 当前页={page}, 页大小={pageSize}, 总页数={total_pages}, 结果数量={len(schedule_info_list)}")
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=response_data
        )
    except Exception as e:
        error_msg = f"获取排课信息列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        # 返回友好的错误响应，包含空数据
        return APIResponse(
            code=0,
            message="获取成功（处理过程中有错误）",
            data={
                "list": [],
                "total": 0,
                "page": int(page) if page else 1,
                "pageSize": int(pageSize) if pageSize else 20,
                "totalPages": 0
            }
        )


def check_classroom_conflicts(
    db: Session, 
    schedule_id: int, 
    classroom_id: int, 
    day_of_week: int, 
    start_time: str, 
    end_time: str,
    weeks: str
) -> bool:
    """
    检查教室时间冲突
    """
    print(f"检查教室时间冲突: 教室ID={classroom_id}, 星期={day_of_week}, 时间={start_time}-{end_time}, 周数={weeks}")
    
    # 查询同一教室、同一天的所有排课
    query = db.query(Schedule).filter(
        Schedule.classroom_id == classroom_id,
        Schedule.day_of_week == day_of_week
    )
    
    # 如果是更新排课，排除自身
    if schedule_id:
        query = query.filter(Schedule.schedule_id != schedule_id)
        print(f"排除当前排课ID: {schedule_id}")
    
    existing_schedules = query.all()
    print(f"找到 {len(existing_schedules)} 条相同教室相同天的排课")
    
    # 如果没有现有排课，则不会有冲突
    if not existing_schedules:
        print("没有找到现有排课，不存在冲突")
        return False
    
    # 将传入的时间转换为分钟数
    try:
        start_hour, start_minute = map(int, start_time.split(':'))
        end_hour, end_minute = map(int, end_time.split(':'))
        
        new_start_minutes = start_hour * 60 + start_minute
        new_end_minutes = end_hour * 60 + end_minute
        
        print(f"新排课时间: {start_time}({new_start_minutes}分钟) - {end_time}({new_end_minutes}分钟)")
        
        # 检查时间是否有效
        if new_start_minutes >= new_end_minutes:
            print(f"警告: 开始时间不早于结束时间，可能导致冲突判断不准确")
    except Exception as e:
        print(f"时间格式解析错误: {e}")
        return True  # 出错时保守地返回有冲突
    
    # 解析周数
    new_weeks_set = parse_weeks(weeks)
    if not new_weeks_set:
        print("新排课的周数为空，不会有冲突")
        return False
    
    # 检查每个现有排课是否与新排课时间重叠
    for i, schedule in enumerate(existing_schedules):
        print(f"\n检查排课 {i+1}/{len(existing_schedules)} [ID:{schedule.schedule_id}]:")
        
        # 解析现有排课的周数
        existing_weeks = schedule.weeks or ""
        print(f"  现有排课周数: {existing_weeks}")
        existing_weeks_set = parse_weeks(existing_weeks)
        
        if not existing_weeks_set:
            print("  现有排课的周数为空，跳过")
            continue
        
        # 检查是否有周数重叠
        weeks_overlap = not new_weeks_set.isdisjoint(existing_weeks_set)
        if not weeks_overlap:
            print("  周数不重叠，不存在冲突")
            continue
        
        # 打印重叠的周数
        overlapping_weeks = new_weeks_set.intersection(existing_weeks_set)
        print(f"  周数重叠: {sorted(overlapping_weeks)}")
        
        # 将现有排课的时间转换为分钟数
        try:
            s_hour, s_minute = map(int, schedule.start_time.split(':'))
            e_hour, e_minute = map(int, schedule.end_time.split(':'))
            
            existing_start_minutes = s_hour * 60 + s_minute
            existing_end_minutes = e_hour * 60 + e_minute
            
            print(f"  现有排课时间: {schedule.start_time}({existing_start_minutes}分钟) - {schedule.end_time}({existing_end_minutes}分钟)")
            
            # 检查时间段是否重叠
            # 不重叠的条件: 新课结束时间 <= 现有课开始时间 或 新课开始时间 >= 现有课结束时间
            # 重叠的条件: 新课结束时间 > 现有课开始时间 且 新课开始时间 < 现有课结束时间
            time_overlap = (new_end_minutes > existing_start_minutes and new_start_minutes < existing_end_minutes)
            
            if time_overlap:
                print(f"  时间重叠，存在冲突")
                return True
            else:
                print(f"  时间不重叠，不存在冲突")
        except Exception as e:
            print(f"  时间格式解析错误: {e}")
            return True  # 出错时保守地返回有冲突
    
    print("\n所有排课检查完毕，不存在冲突")
    return False


def check_teacher_conflicts(
    db: Session, 
    schedule_id: int, 
    teacher_id: int, 
    day_of_week: int, 
    start_time: str, 
    end_time: str,
    weeks: str
) -> bool:
    """
    检查教师时间冲突
    """
    print(f"检查教师时间冲突: 教师ID={teacher_id}, 星期={day_of_week}, 时间={start_time}-{end_time}, 周数={weeks}")
    
    # 使用SQL查询查找同一教师在同一天的所有排课
    query = """
    SELECT s.schedule_id, s.start_time, s.end_time, s.weeks
    FROM schedule s
    JOIN course_offering co ON s.offering_id = co.offering_id
    WHERE co.teacher_id = :teacher_id AND s.day_of_week = :day_of_week
    """
    
    params = {"teacher_id": teacher_id, "day_of_week": day_of_week}
    
    # 如果是更新排课，排除自身
    if schedule_id:
        query += " AND s.schedule_id != :schedule_id"
        params["schedule_id"] = schedule_id
        print(f"排除当前排课ID: {schedule_id}")
    
    result = db.execute(text(query), params).fetchall()
    print(f"找到 {len(result)} 条相同教师相同天的排课")
    
    # 如果没有现有排课，则不会有冲突
    if not result:
        print("没有找到现有排课，不存在冲突")
        return False
    
    # 将传入的时间转换为分钟数
    try:
        start_hour, start_minute = map(int, start_time.split(':'))
        end_hour, end_minute = map(int, end_time.split(':'))
        
        new_start_minutes = start_hour * 60 + start_minute
        new_end_minutes = end_hour * 60 + end_minute
        
        print(f"新排课时间: {start_time}({new_start_minutes}分钟) - {end_time}({new_end_minutes}分钟)")
        
        # 检查时间是否有效
        if new_start_minutes >= new_end_minutes:
            print(f"警告: 开始时间不早于结束时间，可能导致冲突判断不准确")
    except Exception as e:
        print(f"时间格式解析错误: {e}")
        return True  # 出错时保守地返回有冲突
    
    # 解析周数
    new_weeks_set = parse_weeks(weeks)
    if not new_weeks_set:
        print("新排课的周数为空，不会有冲突")
        return False
    
    # 检查每个现有排课是否与新排课时间重叠
    for i, row in enumerate(result):
        schedule_id = row[0]
        existing_start_time = row[1]
        existing_end_time = row[2]
        existing_weeks = row[3] or ""
        
        print(f"\n检查排课 {i+1}/{len(result)} [ID:{schedule_id}]:")
        print(f"  现有排课周数: {existing_weeks}")
        
        # 解析现有排课的周数
        existing_weeks_set = parse_weeks(existing_weeks)
        
        if not existing_weeks_set:
            print("  现有排课的周数为空，跳过")
            continue
        
        # 检查是否有周数重叠
        weeks_overlap = not new_weeks_set.isdisjoint(existing_weeks_set)
        if not weeks_overlap:
            print("  周数不重叠，不存在冲突")
            continue
        
        # 打印重叠的周数
        overlapping_weeks = new_weeks_set.intersection(existing_weeks_set)
        print(f"  周数重叠: {sorted(overlapping_weeks)}")
        
        # 将现有排课的时间转换为分钟数
        try:
            s_hour, s_minute = map(int, existing_start_time.split(':'))
            e_hour, e_minute = map(int, existing_end_time.split(':'))
            
            existing_start_minutes = s_hour * 60 + s_minute
            existing_end_minutes = e_hour * 60 + e_minute
            
            print(f"  现有排课时间: {existing_start_time}({existing_start_minutes}分钟) - {existing_end_time}({existing_end_minutes}分钟)")
            
            # 检查时间段是否重叠
            # 不重叠的条件: 新课结束时间 <= 现有课开始时间 或 新课开始时间 >= 现有课结束时间
            # 重叠的条件: 新课结束时间 > 现有课开始时间 且 新课开始时间 < 现有课结束时间
            time_overlap = (new_end_minutes > existing_start_minutes and new_start_minutes < existing_end_minutes)
            
            if time_overlap:
                print(f"  时间重叠，存在冲突")
                return True
            else:
                print(f"  时间不重叠，不存在冲突")
        except Exception as e:
            print(f"  时间格式解析错误: {e}")
            return True  # 出错时保守地返回有冲突
    
    print("\n所有排课检查完毕，不存在冲突")
    return False


def parse_weeks(weeks_str: str) -> set:
    """
    解析周数字符串，返回包含所有周数的集合
    例如: "1-3,5,7-9" 会返回 {1, 2, 3, 5, 7, 8, 9}
    """
    weeks_set = set()
    
    if not weeks_str:
        print(f"警告: 周数字符串为空，返回空集合")
        return weeks_set
    
    print(f"解析周数字符串: {weeks_str}")
    
    try:
        parts = weeks_str.split(',')
        
        for part in parts:
            part = part.strip()
            if not part:
                continue
                
            if '-' in part:
                try:
                    start_str, end_str = part.split('-')
                    start = int(start_str.strip())
                    end = int(end_str.strip())
                    
                    # 确保开始周不大于结束周
                    if start > end:
                        print(f"警告: 周数范围错误 {start}-{end}，自动交换")
                        start, end = end, start
                        
                    # 限制最大周数范围，防止过大的范围
                    if end - start > 30:
                        print(f"警告: 周数范围过大 {start}-{end}，限制为最多30周")
                        end = start + 30
                        
                    weeks_set.update(range(start, end + 1))
                except ValueError as e:
                    print(f"错误: 无法解析周数范围 '{part}': {e}")
            else:
                try:
                    week = int(part)
                    weeks_set.add(week)
                except ValueError as e:
                    print(f"错误: 无法解析单周 '{part}': {e}")
    except Exception as e:
        print(f"解析周数字符串时出现异常: {e}")
        # 发生异常时返回默认的1-16周，以便继续运行
        return set(range(1, 17))
    
    print(f"解析结果: {sorted(weeks_set)}")
    return weeks_set


@router.post("/conflicts", response_model=APIResponse)
def check_conflicts(
    conflict_data: dict,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["SCHEDULE_VIEW"])),
) -> Any:
    """
    检查排课冲突
    """
    try:
        conflicts = []
        
        # 获取参数
        classroom_id = conflict_data.get("classroom_id")
        teacher_id = conflict_data.get("teacher_id")
        day_of_week = conflict_data.get("day_of_week")
        start_time = conflict_data.get("start_time")
        end_time = conflict_data.get("end_time")
        weeks = conflict_data.get("weeks")
        exclude_schedule_id = conflict_data.get("exclude_schedule_id")
        
        # 记录参数信息
        print(f"排课冲突检查参数: classroom_id={classroom_id}, teacher_id={teacher_id}, "
              f"day_of_week={day_of_week}, start_time={start_time}, end_time={end_time}, "
              f"weeks={weeks}, exclude_schedule_id={exclude_schedule_id}")
        
        # 验证必要参数
        if day_of_week is None:
            raise HTTPException(status_code=400, detail="缺少参数: day_of_week")
        if not start_time:
            raise HTTPException(status_code=400, detail="缺少参数: start_time")
        if not end_time:
            raise HTTPException(status_code=400, detail="缺少参数: end_time")
        if not weeks:
            raise HTTPException(status_code=400, detail="缺少参数: weeks")
        
        # 验证时间格式
        try:
            datetime.strptime(start_time, "%H:%M")
            datetime.strptime(end_time, "%H:%M")
        except ValueError:
            raise HTTPException(status_code=400, detail="时间格式错误，应为HH:MM")
        
        # 将时间转换为分钟以便比较
        s_hour, s_minute = map(int, start_time.split(':'))
        e_hour, e_minute = map(int, end_time.split(':'))
        start_minutes = s_hour * 60 + s_minute
        end_minutes = e_hour * 60 + e_minute
        
        # 验证时间有效性
        if start_minutes >= end_minutes:
            raise HTTPException(status_code=400, detail="开始时间必须早于结束时间")
        
        # 解析周数为集合，以便检查重叠
        weeks_set = parse_weeks(weeks)
        if not weeks_set:
            raise HTTPException(status_code=400, detail="周数格式无效")
        
        # 检查教室冲突
        if classroom_id:
            classroom_conflicts = check_classroom_conflicts(
                db, 
                exclude_schedule_id, 
                classroom_id, 
                day_of_week, 
                start_time, 
                end_time,
                weeks
            )
            if classroom_conflicts:
                # 获取教室名称
                classroom = db.query(Classroom).filter(Classroom.classroom_id == classroom_id).first()
                classroom_name = f"{classroom.building} {classroom.room_no}" if classroom else f"ID: {classroom_id}"
                conflicts.append(f"教室 {classroom_name} 在所选时间段已被占用")
        
        # 检查教师冲突
        if teacher_id:
            teacher_conflicts = check_teacher_conflicts(
                db, 
                exclude_schedule_id, 
                teacher_id, 
                day_of_week, 
                start_time, 
                end_time,
                weeks
            )
            if teacher_conflicts:
                # 获取教师姓名
                teacher = db.query(Teacher).options(joinedload(Teacher.user)).filter(Teacher.teacher_id == teacher_id).first()
                teacher_name = teacher.user.real_name if teacher and teacher.user else f"ID: {teacher_id}"
                conflicts.append(f"教师 {teacher_name} 在所选时间段已有其他课程")
        
        # 构建返回结果
        result = {
            "conflicts": len(conflicts) > 0,
            "details": conflicts if conflicts else None
        }
        
        print(f"排课冲突检查结果: 是否有冲突={result['conflicts']}, 冲突细节={result['details']}")
        
        return APIResponse(
            code=0,
            message="检查完成",
            data=result
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"检查排课冲突失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"检查排课冲突失败: {str(e)}")

def check_classroom_conflicts(
    db: Session, 
    schedule_id: int, 
    classroom_id: int, 
    day_of_week: int, 
    start_time: str, 
    end_time: str,
    weeks: str
) -> bool:
    """
    检查教室时间冲突
    """
    print(f"检查教室时间冲突: 教室ID={classroom_id}, 星期={day_of_week}, 时间={start_time}-{end_time}, 周数={weeks}")
    
    # 查询同一教室、同一天的所有排课
    query = db.query(Schedule).filter(
        Schedule.classroom_id == classroom_id,
        Schedule.day_of_week == day_of_week
    )
    
    # 如果是更新排课，排除自身
    if schedule_id:
        query = query.filter(Schedule.schedule_id != schedule_id)
        print(f"排除当前排课ID: {schedule_id}")
    
    existing_schedules = query.all()
    print(f"找到 {len(existing_schedules)} 条相同教室相同天的排课")
    
    # 如果没有现有排课，则不会有冲突
    if not existing_schedules:
        print("没有找到现有排课，不存在冲突")
        return False
    
    # 将传入的时间转换为分钟数
    try:
        start_hour, start_minute = map(int, start_time.split(':'))
        end_hour, end_minute = map(int, end_time.split(':'))
        
        new_start_minutes = start_hour * 60 + start_minute
        new_end_minutes = end_hour * 60 + end_minute
        
        print(f"新排课时间: {start_time}({new_start_minutes}分钟) - {end_time}({new_end_minutes}分钟)")
        
        # 检查时间是否有效
        if new_start_minutes >= new_end_minutes:
            print(f"警告: 开始时间不早于结束时间，可能导致冲突判断不准确")
    except Exception as e:
        print(f"时间格式解析错误: {e}")
        return True  # 出错时保守地返回有冲突
    
    # 解析周数
    new_weeks_set = parse_weeks(weeks)
    if not new_weeks_set:
        print("新排课的周数为空，不会有冲突")
        return False
    
    # 检查每个现有排课是否与新排课时间重叠
    for i, schedule in enumerate(existing_schedules):
        print(f"\n检查排课 {i+1}/{len(existing_schedules)} [ID:{schedule.schedule_id}]:")
        
        # 解析现有排课的周数
        existing_weeks = schedule.weeks or ""
        print(f"  现有排课周数: {existing_weeks}")
        existing_weeks_set = parse_weeks(existing_weeks)
        
        if not existing_weeks_set:
            print("  现有排课的周数为空，跳过")
            continue
        
        # 检查是否有周数重叠
        weeks_overlap = not new_weeks_set.isdisjoint(existing_weeks_set)
        if not weeks_overlap:
            print("  周数不重叠，不存在冲突")
            continue
        
        # 打印重叠的周数
        overlapping_weeks = new_weeks_set.intersection(existing_weeks_set)
        print(f"  周数重叠: {sorted(overlapping_weeks)}")
        
        # 将现有排课的时间转换为分钟数
        try:
            s_hour, s_minute = map(int, schedule.start_time.split(':'))
            e_hour, e_minute = map(int, schedule.end_time.split(':'))
            
            existing_start_minutes = s_hour * 60 + s_minute
            existing_end_minutes = e_hour * 60 + e_minute
            
            print(f"  现有排课时间: {schedule.start_time}({existing_start_minutes}分钟) - {schedule.end_time}({existing_end_minutes}分钟)")
            
            # 检查时间段是否重叠
            # 不重叠的条件: 新课结束时间 <= 现有课开始时间 或 新课开始时间 >= 现有课结束时间
            # 重叠的条件: 新课结束时间 > 现有课开始时间 且 新课开始时间 < 现有课结束时间
            time_overlap = (new_end_minutes > existing_start_minutes and new_start_minutes < existing_end_minutes)
            
            if time_overlap:
                print(f"  时间重叠，存在冲突")
                return True
            else:
                print(f"  时间不重叠，不存在冲突")
        except Exception as e:
            print(f"  时间格式解析错误: {e}")
            return True  # 出错时保守地返回有冲突
    
    print("\n所有排课检查完毕，不存在冲突")
    return False

def check_teacher_conflicts(
    db: Session, 
    schedule_id: int, 
    teacher_id: int, 
    day_of_week: int, 
    start_time: str, 
    end_time: str,
    weeks: str
) -> bool:
    """
    检查教师时间冲突
    """
    print(f"检查教师时间冲突: 教师ID={teacher_id}, 星期={day_of_week}, 时间={start_time}-{end_time}, 周数={weeks}")
    
    # 使用SQL查询查找同一教师在同一天的所有排课
    query = """
    SELECT s.schedule_id, s.start_time, s.end_time, s.weeks
    FROM schedule s
    JOIN course_offering co ON s.offering_id = co.offering_id
    WHERE co.teacher_id = :teacher_id AND s.day_of_week = :day_of_week
    """
    
    params = {"teacher_id": teacher_id, "day_of_week": day_of_week}
    
    # 如果是更新排课，排除自身
    if schedule_id:
        query += " AND s.schedule_id != :schedule_id"
        params["schedule_id"] = schedule_id
        print(f"排除当前排课ID: {schedule_id}")
    
    result = db.execute(text(query), params).fetchall()
    print(f"找到 {len(result)} 条相同教师相同天的排课")
    
    # 如果没有现有排课，则不会有冲突
    if not result:
        print("没有找到现有排课，不存在冲突")
        return False
    
    # 将传入的时间转换为分钟数
    try:
        start_hour, start_minute = map(int, start_time.split(':'))
        end_hour, end_minute = map(int, end_time.split(':'))
        
        new_start_minutes = start_hour * 60 + start_minute
        new_end_minutes = end_hour * 60 + end_minute
        
        print(f"新排课时间: {start_time}({new_start_minutes}分钟) - {end_time}({new_end_minutes}分钟)")
        
        # 检查时间是否有效
        if new_start_minutes >= new_end_minutes:
            print(f"警告: 开始时间不早于结束时间，可能导致冲突判断不准确")
    except Exception as e:
        print(f"时间格式解析错误: {e}")
        return True  # 出错时保守地返回有冲突
    
    # 解析周数
    new_weeks_set = parse_weeks(weeks)
    if not new_weeks_set:
        print("新排课的周数为空，不会有冲突")
        return False
    
    # 检查每个现有排课是否与新排课时间重叠
    for i, row in enumerate(result):
        schedule_id = row[0]
        existing_start_time = row[1]
        existing_end_time = row[2]
        existing_weeks = row[3] or ""
        
        print(f"\n检查排课 {i+1}/{len(result)} [ID:{schedule_id}]:")
        print(f"  现有排课周数: {existing_weeks}")
        
        # 解析现有排课的周数
        existing_weeks_set = parse_weeks(existing_weeks)
        
        if not existing_weeks_set:
            print("  现有排课的周数为空，跳过")
            continue
        
        # 检查是否有周数重叠
        weeks_overlap = not new_weeks_set.isdisjoint(existing_weeks_set)
        if not weeks_overlap:
            print("  周数不重叠，不存在冲突")
            continue
        
        # 打印重叠的周数
        overlapping_weeks = new_weeks_set.intersection(existing_weeks_set)
        print(f"  周数重叠: {sorted(overlapping_weeks)}")
        
        # 将现有排课的时间转换为分钟数
        try:
            s_hour, s_minute = map(int, existing_start_time.split(':'))
            e_hour, e_minute = map(int, existing_end_time.split(':'))
            
            existing_start_minutes = s_hour * 60 + s_minute
            existing_end_minutes = e_hour * 60 + e_minute
            
            print(f"  现有排课时间: {existing_start_time}({existing_start_minutes}分钟) - {existing_end_time}({existing_end_minutes}分钟)")
            
            # 检查时间段是否重叠
            # 不重叠的条件: 新课结束时间 <= 现有课开始时间 或 新课开始时间 >= 现有课结束时间
            # 重叠的条件: 新课结束时间 > 现有课开始时间 且 新课开始时间 < 现有课结束时间
            time_overlap = (new_end_minutes > existing_start_minutes and new_start_minutes < existing_end_minutes)
            
            if time_overlap:
                print(f"  时间重叠，存在冲突")
                return True
            else:
                print(f"  时间不重叠，不存在冲突")
        except Exception as e:
            print(f"  时间格式解析错误: {e}")
            return True  # 出错时保守地返回有冲突
    
    print("\n所有排课检查完毕，不存在冲突")
    return False

def parse_weeks(weeks_str: str) -> set:
    """
    解析周数字符串，返回包含所有周数的集合
    例如: "1-3,5,7-9" 会返回 {1, 2, 3, 5, 7, 8, 9}
    """
    weeks_set = set()
    
    if not weeks_str:
        print(f"警告: 周数字符串为空，返回空集合")
        return weeks_set
    
    print(f"解析周数字符串: {weeks_str}")
    
    try:
        parts = weeks_str.split(',')
        
        for part in parts:
            part = part.strip()
            if not part:
                continue
                
            if '-' in part:
                try:
                    start_str, end_str = part.split('-')
                    start = int(start_str.strip())
                    end = int(end_str.strip())
                    
                    # 确保开始周不大于结束周
                    if start > end:
                        print(f"警告: 周数范围错误 {start}-{end}，自动交换")
                        start, end = end, start
                        
                    # 限制最大周数范围，防止过大的范围
                    if end - start > 30:
                        print(f"警告: 周数范围过大 {start}-{end}，限制为最多30周")
                        end = start + 30
                        
                    weeks_set.update(range(start, end + 1))
                except ValueError as e:
                    print(f"错误: 无法解析周数范围 '{part}': {e}")
            else:
                try:
                    week = int(part)
                    weeks_set.add(week)
                except ValueError as e:
                    print(f"错误: 无法解析单周 '{part}': {e}")
    except Exception as e:
        print(f"解析周数字符串时出现异常: {e}")
        # 发生异常时返回默认的1-16周，以便继续运行
        return set(range(1, 17))
    
    print(f"解析结果: {sorted(weeks_set)}")
    return weeks_set