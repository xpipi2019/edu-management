from typing import Any, List
import traceback

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.db.database import get_db
from app.models.department import Department
from app.models.teacher import Teacher
from app.models.student import Student
from app.schemas.common import APIResponse, PaginatedResponse
from app.schemas.department import (
    DepartmentCreate, DepartmentNode, DepartmentResponse, DepartmentUpdate
)

router = APIRouter()


@router.get("", response_model=APIResponse)
def list_departments(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    dept_name: str = None,
    dept_code: str = None,
    status: bool = None,
    _: Any = Depends(deps.check_permissions(["DEPARTMENT_VIEW"])),
) -> Any:
    """
    获取部门列表
    """
    try:
        query = db.query(Department)
        
        # 应用过滤条件
        if dept_name:
            query = query.filter(Department.dept_name.like(f"%{dept_name}%"))
        if dept_code:
            query = query.filter(Department.dept_code.like(f"%{dept_code}%"))
        if status is not None:
            query = query.filter(Department.status == status)
        
        # 计算总数
        total = query.count()
        
        # 分页
        departments = query.offset((page - 1) * page_size).limit(page_size).all()
        
        # 构建响应
        dept_list = []
        for dept in departments:
            # 获取关联的教师数量
            teacher_count = db.query(Teacher).filter(
                Teacher.dept_id == dept.dept_id
            ).count()
            
            # 获取关联的学生数量
            student_count = db.query(Student).filter(
                Student.dept_id == dept.dept_id
            ).count()
            
            # 构建部门响应数据
            dept_data = DepartmentResponse.from_orm(dept).dict()
            dept_data["teacherCount"] = teacher_count
            dept_data["studentCount"] = student_count
            dept_list.append(dept_data)
        
        paginated_response = PaginatedResponse(
            list=dept_list,
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
    except Exception as e:
        error_msg = f"获取部门列表失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"获取部门列表失败: {str(e)}")


@router.get("/all", response_model=APIResponse)
def get_all_departments(
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["DEPARTMENT_VIEW"])),
) -> Any:
    """
    获取所有部门（不分页）
    """
    departments = db.query(Department).filter(Department.status == True).all()
    dept_responses = [DepartmentResponse.from_orm(dept) for dept in departments]
    
    return APIResponse(
        code=0,
        message="获取成功",
        data=dept_responses
    )


@router.post("", response_model=APIResponse)
def create_department(
    dept_in: DepartmentCreate,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["DEPARTMENT_CREATE"])),
) -> Any:
    """
    创建新部门
    """
    # 检查部门代码是否存在
    dept = db.query(Department).filter(Department.dept_code == dept_in.dept_code).first()
    if dept:
        raise HTTPException(
            status_code=400,
            detail="部门代码已存在"
        )
    
    # 创建新部门
    db_dept = Department(
        dept_name=dept_in.dept_name,
        dept_code=dept_in.dept_code,
        parent_id=dept_in.parent_id,
        description=dept_in.description,
        status=dept_in.status,
    )
    db.add(db_dept)
    db.commit()
    db.refresh(db_dept)
    
    return APIResponse(
        code=0,
        message="创建成功",
        data=DepartmentResponse.from_orm(db_dept)
    )


@router.get("/{dept_id}", response_model=APIResponse)
def get_department(
    dept_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["DEPARTMENT_VIEW"])),
) -> Any:
    """
    获取部门详情
    """
    dept = db.query(Department).filter(Department.dept_id == dept_id).first()
    if not dept:
        raise HTTPException(
            status_code=404,
            detail="部门不存在"
        )
    
    return APIResponse(
        code=0,
        message="获取成功",
        data=DepartmentResponse.from_orm(dept)
    )


@router.put("/{dept_id}", response_model=APIResponse)
def update_department(
    dept_id: int,
    dept_in: DepartmentUpdate,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["DEPARTMENT_EDIT"])),
) -> Any:
    """
    更新部门信息
    """
    dept = db.query(Department).filter(Department.dept_id == dept_id).first()
    if not dept:
        raise HTTPException(
            status_code=404,
            detail="部门不存在"
        )
    
    # 检查部门代码是否存在
    if dept_in.dept_code and dept_in.dept_code != dept.dept_code:
        existing_dept = db.query(Department).filter(Department.dept_code == dept_in.dept_code).first()
        if existing_dept:
            raise HTTPException(
                status_code=400,
                detail="部门代码已存在"
            )
    
    # 更新部门信息
    update_data = dept_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(dept, key, value)
    
    db.commit()
    db.refresh(dept)
    
    return APIResponse(
        code=0,
        message="更新成功",
        data=DepartmentResponse.from_orm(dept)
    )


@router.delete("/{dept_id}", response_model=APIResponse)
def delete_department(
    dept_id: int,
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["DEPARTMENT_DELETE"])),
) -> Any:
    """
    删除部门
    """
    dept = db.query(Department).filter(Department.dept_id == dept_id).first()
    if not dept:
        raise HTTPException(
            status_code=404,
            detail="部门不存在"
        )
    
    # 检查是否有子部门
    if db.query(Department).filter(Department.parent_id == dept_id).count() > 0:
        raise HTTPException(
            status_code=400,
            detail="该部门存在子部门，无法删除"
        )
    
    # 检查是否有关联的教师
    if dept.teachers:
        raise HTTPException(
            status_code=400,
            detail="该部门已分配教师，无法删除"
        )
    
    # 检查是否有关联的学生
    if dept.students:
        raise HTTPException(
            status_code=400,
            detail="该部门已分配学生，无法删除"
        )
    
    db.delete(dept)
    db.commit()
    
    return APIResponse(
        code=0,
        message="删除成功"
    )


@router.get("/tree", response_model=APIResponse)
def get_department_tree(
    db: Session = Depends(get_db),
    _: Any = Depends(deps.check_permissions(["DEPARTMENT_VIEW"])),
) -> Any:
    """
    获取部门树
    """
    # 获取所有根部门（没有父部门的部门）
    root_departments = db.query(Department).filter(Department.parent_id.is_(None)).all()
    
    # 构建部门树
    def build_tree(department):
        children = db.query(Department).filter(Department.parent_id == department.dept_id).all()
        dept_node = DepartmentNode.from_orm(department)
        dept_node.children = [build_tree(child) for child in children]
        return dept_node
    
    # 构建响应
    dept_tree = [build_tree(root) for root in root_departments]
    
    return APIResponse(
        code=0,
        message="获取成功",
        data=dept_tree
    ) 