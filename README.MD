# 🎓 教育管理系统

<div align="center">

[![技术栈](https://img.shields.io/badge/技术栈-Vue3%20%2B%20FastAPI%20%2B%20TypeScript%20%2B%20Element%20Plus-blue.svg?style=flat-square)](#技术栈)
[![LICENSE](https://img.shields.io/badge/许可证-MIT-green.svg?style=flat-square)](LICENSE)
[![STATUS](https://img.shields.io/badge/状态-正式版-brightgreen.svg?style=flat-square)](#)

*基于 Vue 3 + FastAPI 的现代化教育管理系统，提供完整的学校教务管理功能*

</div>

<div align="center">

[![XPIPI](https://count.getloli.com/@XPIPI?name=XPIPI&theme=original-new&padding=7&offset=0&align=center&scale=1&pixelated=1&darkmode=auto)](https://github.com/xpipi2019/edu-management)

</div>

<p align="center">
  <a href="#-简介">简介</a> •
  <a href="#-特性">特性</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-文档">文档</a> •
  <a href="#-技术栈">技术栈</a> •
  <a href="#-角色职责">角色职责</a>
</p>

---

## 📝 简介

<table>
<tr>
<td>

教育管理系统是一个基于 Vue 3 + FastAPI + TypeScript + Element Plus 开发的现代化教务管理平台，为学校提供完整的教务管理解决方案。系统采用前后端分离架构，支持多角色管理，包含用户管理、课程管理、成绩管理、学籍管理等核心功能模块，采用响应式设计，支持多设备访问。

> 💡 **设计理念**：通过现代化的技术栈和优雅的用户界面，为教育机构提供高效、易用的管理工具。

</td>
</tr>
</table>

## ✨ 特性

- 🎓 **多角色管理** - 支持学生、教师、管理员、教务人员四种用户角色
- 📚 **完整教务功能** - 涵盖课程管理、排课、成绩录入、学籍管理等核心功能
- 🛡️ **权限控制** - 基于角色的细粒度权限管理系统
- 📱 **响应式设计** - 支持桌面端、平板、手机等多设备访问
- 🎨 **现代化UI** - 基于 Element Plus 的美观界面设计
- 🔧 **Mock数据支持** - 内置完整的模拟数据，支持独立开发调试
- 📊 **智能统计** - 自动生成各类教务统计报表
- 🏗️ **模块化架构** - 高度模块化的代码结构，便于维护和扩展
- 🚀 **前后端分离** - FastAPI后端 + Vue3前端，性能优异
- 🔒 **JWT认证** - 安全的用户认证和授权机制

## 🚀 快速开始

### 环境要求
- Node.js 18+
- Python 3.8+
- MySQL 5.7+
- npm/yarn/pnpm

### 后端启动

```bash
# 进入后端目录
cd backend

# 创建虚拟环境（推荐）
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 启动后端服务
cd app
python main.py
```

后端服务将运行在 http://localhost:8000
- API文档：http://localhost:8000/docs
- ReDoc文档：http://localhost:8000/redoc

### 前端启动

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将运行在 http://localhost:3000


## 📖 文档

### 📋 系统设计文档

| 文档 | 说明 | 内容 |
|------|------|------|
| [需求分析](./docs/需求分析.md) | 📊 系统功能需求详细分析 | 用户角色定义、功能模块说明、权限矩阵 |
| [概念结构设计](./docs/概念结构设计.md) | 🎨 数据库E-R图设计 | 整体E-R图、局部E-R图、实体关系 |
| [逻辑结构设计](./docs/逻辑结构设计.md) | 🏗️ 数据库表结构设计 | 关系模型、表结构定义、约束规则 |

### ⚙️ 实施文档

| 文档 | 说明 | 内容 |
|------|------|------|
| [数据库建表脚本说明](./docs/数据库建表脚本说明.md) | 🛠️ 数据库建设指南 | MySQL脚本、索引优化、存储过程 |
| [数据库示例数据说明](./docs/数据库示例数据插入说明.md) | 📊 测试数据初始化 | 示例数据、角色权限、测试数据 |
| [功能模块代码示例](./docs/数据库功能模块代码示例.md) | 💻 核心业务实现 | 视图创建、触发器、查询示例 |

## 🛠️ 技术栈

**后端技术**
- FastAPI (现代Python Web框架)
- SQLAlchemy (ORM)
- Pydantic (数据验证)
- JWT (身份认证)
- Uvicorn (ASGI服务器)
- MySQL (数据库)
- Alembic (数据库迁移)

**前端技术**
- Vue 3 + Composition API
- TypeScript
- Element Plus
- Pinia (状态管理)
- Vue Router 4
- Vite (构建工具)

**开发工具**
- ESLint + Prettier (代码规范)
- Vitest (单元测试)
- Playwright (E2E测试)

## 📁 项目结构

```
edu-management/
├── README.MD         # 项目说明文档
├── LICENSE           # 开源许可证
├── backend/          # 后端项目 (FastAPI)
│   ├── app/
│   │   ├── api/            # API接口模块
│   │   │   └── api_v1/     # API v1版本
│   │   │       └── endpoints/  # 端点定义
│   │   ├── core/           # 核心配置
│   │   ├── db/             # 数据库配置
│   │   ├── models/         # 数据模型
│   │   ├── schemas/        # Pydantic模式
│   │   └── main.py         # 应用入口
│   ├── requirements.txt    # Python依赖
│   └── debug_user_api.py   # 调试脚本
├── frontend/         # 前端项目 (Vue3)
│   ├── src/
│   │   ├── api/            # API接口模块
│   │   ├── components/     # 可复用组件
│   │   │   ├── business/   # 业务组件
│   │   │   ├── common/     # 通用组件
│   │   │   └── layout/     # 布局组件
│   │   ├── constants/      # 常量定义
│   │   ├── router/         # 路由配置
│   │   ├── stores/         # Pinia状态管理
│   │   ├── types/          # TypeScript类型定义
│   │   ├── utils/          # 工具函数
│   │   └── views/          # 页面组件
│   │       ├── admin/      # 管理模块
│   │       ├── auth/       # 认证模块
│   │       ├── error/      # 错误模块
│   │       ├── academic/   # 教务模块
│   │       ├── student/    # 学生模块
│   │       └── teacher/    # 教师模块
│   └── public/             # 静态资源
└── docs/                   # 项目文档
    ├── assets/            # 文档图片资源
    ├── 需求分析.md         # 系统需求分析
    ├── 概念结构设计.md     # E-R图设计文档
    ├── 逻辑结构设计.md     # 数据库逻辑设计
    ├── 数据库建表脚本说明.md   # 建表脚本详细说明
    ├── 数据库示例数据插入说明.md  # 测试数据说明
    └── 数据库功能模块代码示例.md  # 功能实现示例
```

## 🔧 开发命令

### 前端命令
```bash
# 开发环境
npm run dev

# 生产构建
npm run build

# 代码检查
npm run lint

# 代码格式化  
npm run format

# 单元测试
npm run test:unit

# E2E测试
npm run test:e2e
```

### 后端命令
```bash
# 开发环境（热重载）
cd backend/app
python main.py

# 生产环境
uvicorn app.main:app --host 0.0.0.0 --port 8000

# 数据库迁移
alembic upgrade head

# 生成迁移文件
alembic revision --autogenerate -m "description"
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来完善项目！

## 📄 许可证

本项目采用 MIT 许可证。

详细信息请查看 [LICENSE](LICENSE) 文件。