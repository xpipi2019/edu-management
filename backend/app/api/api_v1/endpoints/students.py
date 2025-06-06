from typing import Any, List
from sqlalchemy import text, func

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.api import deps
from app.db.database import get_db
from app.models.student import Student
from app.models.user import User
from app.models.department import Department
from app.models.enrollment import Enrollment, Grade
from app.schemas.common import APIResponse, PaginatedResponse
from app.schemas.student import (
    StudentCreate, StudentDetail, StudentInfo, StudentResponse,
    StudentUpdate, StudentTranscript, TranscriptItem
)
from app.models.student_status import StudentStatus, RewardPunishment
import traceback

router = APIRouter()


@router.get("", response_model=APIResponse)
def list_students(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100, alias="page_size"),
    student_no: str = None,
    dept_id: int = None,
    class_name: str = None,
    grade: int = None,
    _: Any = Depends(deps.check_permissions(["STUDENT_VIEW"])),
) -> Any:
    """
    获取学生列表
    """
    try:
        query = db.query(Student).options(
            joinedload(Student.user),
            joinedload(Student.department)
        )
        
        # 应用过滤条件
        if student_no:
            query = query.filter(Student.student_no.like(f"%{student_no}%"))
        if dept_id:
            query = query.filter(Student.dept_id == dept_id)
        if class_name:
            query = query.filter(Student.class_name.like(f"%{class_name}%"))
        if grade:
            query = query.filter(Student.grade == grade)
        
        # 计算总数
        total = query.count()
        
        # 分页
        students = query.offset((page - 1) * pageSize).limit(pageSize).all()
        
        # 构建响应
        student_list = []
        for student in students:
            # 获取关联的选课数量
            enrollment_count = db.query(Enrollment).filter(
                Enrollment.student_id == student.student_id,
                Enrollment.status == True
            ).count()
            
            # 构建用户信息
            user_info = None
            if student.user:
                user_info = {
                    "user_id": student.user.user_id,
                    "username": student.user.username,
                    "real_name": student.user.real_name,
                    "email": student.user.email,
                    "phone": student.user.phone,
                    "status": 1 if student.user.status else 0
                }
            
            # 构建部门信息
            department_info = None
            if student.department:
                department_info = {
                    "dept_id": student.department.dept_id,
                    "dept_name": student.department.dept_name,
                    "dept_code": student.department.dept_code
                }
            
            # 构建学生响应数据
            student_data = {
                "student_id": student.student_id,
                "student_no": student.student_no,
                "user_id": student.user_id,
                "dept_id": student.dept_id,
                "class_name": student.class_name or "",
                "grade": student.grade or 0,
                "enrollment_year": student.enrollment_year,
                "graduation_year": student.graduation_year,
                "enrollmentCount": enrollment_count,
                "created_at": str(student.created_at) if hasattr(student, 'created_at') and student.created_at else "",
                "updated_at": str(student.updated_at) if hasattr(student, 'updated_at') and student.updated_at else "",
                "createdAt": str(student.created_at) if hasattr(student, 'created_at') and student.created_at else "",
                "updatedAt": str(student.updated_at) if hasattr(student, 'updated_at') and student.updated_at else "",
                # 为前端表格提供直接访问的字段
                "real_name": student.user.real_name if student.user else "",
                "dept_name": student.department.dept_name if student.department else "",
                "email": student.user.email if student.user else "",
                "phone": student.user.phone if student.user else "",
                # 关联对象信息
                "user": user_info,
                "department": department_info
            }
            student_list.append(student_data)
        
        # 前端期望的格式
        result = {
            "list": student_list,
            "total": total,
            "page": page,
            "pageSize": pageSize,
            "totalPages": (total + pageSize - 1) // pageSize
        }
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=result
        )
    except Exception as e:
        error_msg = f"获取学生列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return APIResponse(
            code=500,
            message=f"获取学生列表失败: {str(e)}",
            data=None
        )


@router.post("", response_model=APIResponse)
def create_student(
    student_in: StudentCreate,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["STUDENT_CREATE"])),
) -> Any:
    """
    创建新学生
    """
    # 检查学号是否存在
    student = db.query(Student).filter(Student.student_no == student_in.student_no).first()
    if student:
        raise HTTPException(
            status_code=400,
            detail="学号已存在"
        )
    
    # 检查用户是否存在
    user = db.query(User).filter(User.user_id == student_in.user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="用户不存在"
        )
    
    # 检查用户是否已经是学生
    student = db.query(Student).filter(Student.user_id == student_in.user_id).first()
    if student:
        raise HTTPException(
            status_code=400,
            detail="该用户已经是学生"
        )
    
    # 检查部门是否存在
    department = db.query(Department).filter(Department.dept_id == student_in.dept_id).first()
    if not department:
        raise HTTPException(
            status_code=404,
            detail="部门不存在"
        )
    
    # 创建新学生
    db_student = Student(
        student_no=student_in.student_no,
        user_id=student_in.user_id,
        dept_id=student_in.dept_id,
        class_name=student_in.class_name,
        grade=student_in.grade,
        enrollment_year=student_in.enrollment_year,
        graduation_year=student_in.graduation_year,
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    
    return APIResponse(
        code=0,
        message="创建成功",
        data=StudentResponse.from_orm(db_student)
    )


@router.get("/{student_id}", response_model=APIResponse)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["STUDENT_VIEW"])),
) -> Any:
    """
    获取学生详情
    """
    try:
        student = db.query(Student).options(
            joinedload(Student.user),
            joinedload(Student.department)
        ).filter(Student.student_id == student_id).first()
        
        if not student:
            raise HTTPException(
                status_code=404,
                detail="学生不存在"
            )
        
        # 构建详细响应
        result = {
            "student_id": student.student_id,
            "user_id": student.user_id,
            "student_no": student.student_no,
            "dept_id": student.dept_id,
            "dept_name": student.department.dept_name if student.department else "",
            "class_name": student.class_name or "",
            "grade": student.grade or 0,
            "enrollment_year": student.enrollment_year,
            "graduation_year": student.graduation_year,
            "user_info": {
                "user_id": student.user.user_id,
                "username": student.user.username,
                "real_name": student.user.real_name,
                "email": student.user.email,
                "phone": student.user.phone,
                "status": 1 if student.user.status else 0
            } if student.user else {},
            "department": {
                "dept_id": student.department.dept_id,
                "dept_name": student.department.dept_name,
                "dept_code": student.department.dept_code
            } if student.department else {},
            "created_at": str(student.created_at) if hasattr(student, 'created_at') and student.created_at else "",
            "updated_at": str(student.updated_at) if hasattr(student, 'updated_at') and student.updated_at else "",
            "createdAt": str(student.created_at) if hasattr(student, 'created_at') and student.created_at else "",
            "updatedAt": str(student.updated_at) if hasattr(student, 'updated_at') and student.updated_at else ""
        }
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=result
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"获取学生详情失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取学生详情失败: {str(e)}")


@router.put("/{student_id}", response_model=APIResponse)
def update_student(
    student_id: int,
    student_in: StudentUpdate,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["STUDENT_EDIT"])),
) -> Any:
    """
    更新学生信息
    """
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=404,
            detail="学生不存在"
        )
    
    # 检查学号是否存在
    if student_in.student_no and student_in.student_no != student.student_no:
        existing_student = db.query(Student).filter(Student.student_no == student_in.student_no).first()
        if existing_student:
            raise HTTPException(
                status_code=400,
                detail="学号已存在"
            )
    
    # 检查部门是否存在
    if student_in.dept_id:
        department = db.query(Department).filter(Department.dept_id == student_in.dept_id).first()
        if not department:
            raise HTTPException(
                status_code=404,
                detail="部门不存在"
            )
    
    # 更新学生信息
    update_data = student_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(student, key, value)
    
    db.commit()
    db.refresh(student)
    
    return APIResponse(
        code=0,
        message="更新成功",
        data=StudentResponse.from_orm(student)
    )


@router.delete("/{student_id}", response_model=APIResponse)
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["STUDENT_DELETE"])),
) -> Any:
    """
    删除学生
    """
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=404,
            detail="学生不存在"
        )
    
    # 检查是否有关联的选课记录
    if student.enrollments:
        raise HTTPException(
            status_code=400,
            detail="该学生有选课记录，无法删除"
        )
    
    # 检查是否有关联的学籍记录
    if student.status_records:
        raise HTTPException(
            status_code=400,
            detail="该学生有学籍记录，无法删除"
        )
    
    db.delete(student)
    db.commit()
    
    return APIResponse(
        code=0,
        message="删除成功"
    )


@router.get("/by-user/{user_id}", response_model=APIResponse)
def get_student_by_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    token_permissions: Any = Depends(deps.check_permissions(["STUDENT_VIEW"], required=False)),
) -> Any:
    """
    根据用户ID获取学生信息
    """
    try:
        # 检查权限：当用户查询自己的信息时不进行权限检查，否则需要权限
        if current_user.user_id != user_id and not token_permissions:
            raise HTTPException(
                status_code=403,
                detail="权限不足"
            )
            
        student = db.query(Student).options(
            joinedload(Student.user),
            joinedload(Student.department)
        ).filter(Student.user_id == user_id).first()
        
        if not student:
            raise HTTPException(
                status_code=404,
                detail="该用户不是学生"
            )
        
        # 构建详细响应
        result = {
            "student_id": student.student_id,
            "user_id": student.user_id,
            "student_no": student.student_no,
            "dept_id": student.dept_id,
            "dept_name": student.department.dept_name if student.department else "",
            "class_name": student.class_name or "",
            "grade": student.grade or 0,
            "enrollment_year": student.enrollment_year,
            "graduation_year": student.graduation_year,
            "user_info": {
                "user_id": student.user.user_id,
                "username": student.user.username,
                "real_name": student.user.real_name,
                "email": student.user.email,
                "phone": student.user.phone,
                "status": 1 if student.user.status else 0
            } if student.user else {},
            "department": {
                "dept_id": student.department.dept_id,
                "dept_name": student.department.dept_name,
                "dept_code": student.department.dept_code
            } if student.department else {}
        }
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=result
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"获取学生信息失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取学生信息失败: {str(e)}")


@router.get("/by-department/{dept_id}", response_model=APIResponse)
def get_students_by_department(
    dept_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["STUDENT_VIEW"])),
) -> Any:
    """
    根据部门ID获取学生列表
    """
    try:
        students = db.query(Student).options(
            joinedload(Student.user),
            joinedload(Student.department)
        ).filter(Student.dept_id == dept_id).all()
        
        # 构建响应
        student_list = []
        for student in students:
            student_data = {
                "student_id": student.student_id,
                "student_no": student.student_no,
                "user_id": student.user_id,
                "dept_id": student.dept_id,
                "class_name": student.class_name or "",
                "grade": student.grade or 0,
                "enrollment_year": student.enrollment_year,
                "graduation_year": student.graduation_year,
                "real_name": student.user.real_name if student.user else "",
                "dept_name": student.department.dept_name if student.department else "",
            }
            student_list.append(student_data)
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=student_list
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"获取学生信息失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取学生信息失败: {str(e)}")


@router.get("/by-class/{class_name}", response_model=APIResponse)
def get_students_by_class(
    class_name: str,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["STUDENT_VIEW"])),
) -> Any:
    """
    根据班级获取学生列表
    """
    try:
        students = db.query(Student).options(
            joinedload(Student.user),
            joinedload(Student.department)
        ).filter(Student.class_name == class_name).all()
        
        # 构建响应
        student_list = []
        for student in students:
            student_data = {
                "student_id": student.student_id,
                "student_no": student.student_no,
                "user_id": student.user_id,
                "dept_id": student.dept_id,
                "class_name": student.class_name or "",
                "grade": student.grade or 0,
                "enrollment_year": student.enrollment_year,
                "graduation_year": student.graduation_year,
                "real_name": student.user.real_name if student.user else "",
                "dept_name": student.department.dept_name if student.department else "",
            }
            student_list.append(student_data)
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=student_list
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"获取班级学生失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        # 返回更友好的错误响应，而不是抛出500错误
        return APIResponse(
            code=500,
            message="获取班级学生失败",
            data=[]
        )


@router.get("/info-list")
def get_student_info_list(
    db: Session = Depends(get_db),
    page: int = Query(1),
    pageSize: int = Query(20, alias="page_size"),
    student_no: str = None,
    real_name: str = None,
    dept_id: int = None,
    class_name: str = None,
    grade: int = None,
    _: Any = Depends(deps.check_permissions(["STUDENT_VIEW"])),
) -> Any:
    """
    获取学生信息列表（使用视图）
    """
    try:
        # 验证并处理参数
        try:
            page = max(1, page)  # 确保页码至少为1
        except (TypeError, ValueError):
            page = 1
            
        try:
            pageSize = max(1, min(100, pageSize))  # 确保每页条数在1-100之间
        except (TypeError, ValueError):
            pageSize = 20
        
        # 使用原生SQL查询视图
        query = """
        SELECT 
            s.student_id, s.student_no, u.real_name, u.email, u.phone, 
            d.dept_name, s.class_name, s.grade, s.enrollment_year, s.graduation_year
        FROM student s
        JOIN user u ON s.user_id = u.user_id
        LEFT JOIN department d ON s.dept_id = d.dept_id
        WHERE 1=1
        """
        
        # 添加过滤条件
        params = {}
        if student_no:
            query += " AND s.student_no LIKE :student_no"
            params["student_no"] = f"%{student_no}%"
        if real_name:
            query += " AND u.real_name LIKE :real_name"
            params["real_name"] = f"%{real_name}%"
        if dept_id:
            try:
                dept_id_int = int(dept_id)
                query += " AND s.dept_id = :dept_id"
                params["dept_id"] = dept_id_int
            except (ValueError, TypeError):
                print(f"无效的部门ID: {dept_id}")
        if class_name:
            query += " AND s.class_name LIKE :class_name"
            params["class_name"] = f"%{class_name}%"
        if grade:
            try:
                grade_int = int(grade)
                query += " AND s.grade = :grade"
                params["grade"] = grade_int
            except (ValueError, TypeError):
                print(f"无效的年级: {grade}")
        
        # 计算总数
        try:
            count_query = f"SELECT COUNT(*) AS total FROM ({query}) AS count_query"
            total_result = db.execute(text(count_query), params).first()
            total = total_result[0] if total_result else 0
        except Exception as e:
            print(f"计算总数时出错: {str(e)}")
            total = 0
        
        # 添加分页
        query += " LIMIT :limit OFFSET :offset"
        params["limit"] = pageSize
        params["offset"] = (page - 1) * pageSize
        
        # 执行查询
        result = []
        try:
            result = db.execute(text(query), params).fetchall()
        except Exception as e:
            print(f"查询学生列表时出错: {str(e)}")
        
        # 构建响应
        student_info_list = []
        for row in result:
            try:
                student_info = {
                    "student_id": row[0],
                    "student_no": row[1],
                    "real_name": row[2],
                    "email": row[3],
                    "phone": row[4],
                    "dept_name": row[5],
                    "class_name": row[6],
                    "grade": row[7],
                    "enrollment_year": row[8],
                    "graduation_year": row[9]
                }
                student_info_list.append(StudentInfo(**student_info))
            except Exception as e:
                print(f"处理学生数据时出错: {str(e)}")
        
        paginated_response = PaginatedResponse(
            list=student_info_list,
            total=total,
            page=page,
            pageSize=pageSize,
            totalPages=(total + pageSize - 1) // pageSize if total > 0 else 0
        )
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=paginated_response
        )
    except Exception as e:
        error_msg = f"获取学生信息列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        # 返回空列表而不是错误，确保前端不会因为后端错误而崩溃
        return APIResponse(
            code=0,
            message="获取成功（处理过程中有错误）",
            data=PaginatedResponse(
                list=[],
                total=0,
                page=1,
                pageSize=20,
                totalPages=0
            )
        )


@router.get("/{student_id}/transcript", response_model=APIResponse)
def get_student_transcript(
    student_id: int,
    db: Session = Depends(get_db),
    semester: str = None,
    _: Any = Depends(deps.check_permissions(["STUDENT_VIEW", "MY_GRADE_VIEW"])),
) -> Any:
    """
    获取学生成绩单
    """
    # 查询学生信息
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=404,
            detail="学生不存在"
        )
    
    # 查询用户信息
    user = db.query(User).filter(User.user_id == student.user_id).first()
    
    # 查询成绩信息
    query = """
    SELECT 
        c.course_code, c.course_name, c.credits, co.semester,
        g.final_score, g.grade_point,
        CASE 
            WHEN g.final_score >= 90 THEN '优秀'
            WHEN g.final_score >= 80 THEN '良好'
            WHEN g.final_score >= 70 THEN '中等'
            WHEN g.final_score >= 60 THEN '及格'
            ELSE '不及格'
        END AS grade_level
    FROM student s
    JOIN enrollment e ON s.student_id = e.student_id
    JOIN grade g ON e.enrollment_id = g.enrollment_id
    JOIN course_offering co ON e.offering_id = co.offering_id
    JOIN course c ON co.course_id = c.course_id
    WHERE s.student_id = :student_id
    """
    
    params = {"student_id": student_id}
    
    if semester:
        query += " AND co.semester = :semester"
        params["semester"] = semester
    
    query += " ORDER BY co.semester DESC, c.course_code"
    
    result = db.execute(text(query), params).fetchall()
    
    # 计算总学分和GPA
    total_credits = 0
    total_grade_points = 0
    
    courses = []
    for row in result:
        course_credit = float(row[2])
        grade_point = float(row[5])
        
        total_credits += course_credit
        total_grade_points += course_credit * grade_point
        
        course = {
            "course_code": row[0],
            "course_name": row[1],
            "credits": course_credit,
            "semester": row[3],
            "final_score": float(row[4]),
            "grade_point": grade_point,
            "grade_level": row[6]
        }
        courses.append(TranscriptItem(**course))
    
    # 计算GPA
    gpa = 0
    if total_credits > 0:
        gpa = round(total_grade_points / total_credits, 2)
    
    transcript = StudentTranscript(
        student_no=student.student_no,
        student_name=user.real_name,
        total_credits=total_credits,
        gpa=gpa,
        courses=courses
    )
    
    return APIResponse(
        code=0,
        message="获取成功",
        data=transcript
    )


@router.get("/{student_id}/gpa", response_model=APIResponse)
def get_student_gpa(
    student_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["STUDENT_VIEW", "MY_GRADE_VIEW"])),
) -> Any:
    """
    获取学生GPA
    """
    # 查询学生信息
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=404,
            detail="学生不存在"
        )
    
    # 计算GPA
    query = """
    SELECT 
        SUM(c.credits * g.grade_point) as total_points,
        SUM(c.credits) as total_credits
    FROM student s
    JOIN enrollment e ON s.student_id = e.student_id
    JOIN grade g ON e.enrollment_id = g.enrollment_id
    JOIN course_offering co ON e.offering_id = co.offering_id
    JOIN course c ON co.course_id = c.course_id
    WHERE s.student_id = :student_id
    """
    
    params = {"student_id": student_id}
    result = db.execute(text(query), params).first()
    
    if result and result[1]:
        gpa = round(float(result[0]) / float(result[1]), 2)
    else:
        gpa = 0
    
    return APIResponse(
        code=0,
        message="获取成功",
        data={"gpa": gpa}
    ) 


@router.get("/{student_id}/status-history", response_model=APIResponse)
def get_student_status_history(
    student_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["STUDENT_STATUS_VIEW"])),
) -> Any:
    """
    获取学生的学籍记录历史
    """
    try:
        # 验证学生信息
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="学生不存在")
        
        # 查询学籍记录
        status_records = db.query(StudentStatus).options(
            joinedload(StudentStatus.handler)
        ).filter(
            StudentStatus.student_id == student_id
        ).order_by(desc(StudentStatus.effective_date)).all()
        
        # 构建响应
        status_list = []
        for record in status_records:
            # 准备处理人信息
            handler_info = {
                "id": record.handler_id if record.handler_id else 0,
                "name": record.handler.real_name if record.handler else ""
            }
            
            status_data = {
                "id": record.status_id,
                "student_id": record.student_id,
                "student": {
                    "id": student.student_id,
                    "student_no": student.student_no,
                    "name": student.user.real_name if student.user else ""
                },
                "student_no": student.student_no,
                "student_name": student.user.real_name if student.user else "",
                "status_type": record.status_type or "",
                "effective_date": str(record.effective_date) if record.effective_date else "",
                "end_date": str(record.end_date) if record.end_date else "",
                "reason": record.reason or "",
                "handler": handler_info,
                "handler_name": handler_info["name"],
                "created_at": str(record.created_at) if record.created_at else ""
            }
            status_list.append(status_data)
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=status_list
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"获取学籍记录历史失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取学籍记录历史失败: {str(e)}")


@router.get("/{student_id}/current-status", response_model=APIResponse)
def get_student_current_status(
    student_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["STUDENT_STATUS_VIEW"])),
) -> Any:
    """
    获取学生的当前状态
    """
    try:
        # 验证学生信息
        student = db.query(Student).options(
            joinedload(Student.user),
            joinedload(Student.department)
        ).filter(Student.student_id == student_id).first()
        
        if not student:
            raise HTTPException(status_code=404, detail="学生不存在")
        
        # 获取最新的学籍记录
        current_status = db.query(StudentStatus).options(
            joinedload(StudentStatus.handler)
        ).filter(
            StudentStatus.student_id == student_id
        ).order_by(desc(StudentStatus.effective_date)).first()
        
        # 构建响应 - 确保即使没有记录也返回有效的数据结构
        status_data = {
            "student_id": student.student_id,
            "student_no": student.student_no or "",
            "student_name": student.user.real_name if student.user else "",
            "department": student.department.dept_name if student.department else "",
            "class_name": student.class_name or "",
            "grade": student.grade or 0,
            "current_status": current_status.status_type if current_status else "未知",
            "effective_date": str(current_status.effective_date) if current_status and current_status.effective_date else "",
            "end_date": str(current_status.end_date) if current_status and current_status.end_date else "",
            "reason": current_status.reason if current_status else "",
            "handler_name": current_status.handler.real_name if current_status and current_status.handler else ""
        }
        
        return APIResponse(
            code=0,
            message="获取成功",
            data=status_data
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_msg = f"获取学生当前状态失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取学生当前状态失败: {str(e)}") 