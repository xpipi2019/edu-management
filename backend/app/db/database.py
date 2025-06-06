from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import time

from app.core.config import settings

# 创建SQLAlchemy引擎，添加池化配置和超时设置
engine = create_engine(
    str(settings.DATABASE_URL), 
    pool_pre_ping=True,  # 在连接使用前检查连接是否有效
    pool_recycle=3600,   # 一小时后回收连接
    pool_size=10,        # 连接池大小
    max_overflow=20,     # 允许的最大溢出连接数
    connect_args={"connect_timeout": 10}  # 连接超时设置
)

# 创建SessionLocal类，每个实例将是一个数据库会话
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建Base类，用于创建数据库模型或类（ORM模型）的基类
Base = declarative_base()

# 依赖项，获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        # 测试连接是否有效
        db.execute(text("SELECT 1"))
        yield db
    except Exception as e:
        print(f"数据库连接异常: {str(e)}")
        # 尝试重新连接
        for i in range(3):
            try:
                time.sleep(1)  # 等待1秒
                db = SessionLocal()
                db.execute(text("SELECT 1"))
                yield db
                break
            except Exception as retry_error:
                print(f"第{i+1}次重试失败: {str(retry_error)}")
        else:
            # 所有重试失败
            print("数据库连接重试失败")
            raise
    finally:
        db.close() 