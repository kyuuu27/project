# CodeBlog 开发指南

全栈博客平台 MVP — Next.js 14 (App Router) + Express + MongoDB，npm workspaces monorepo。

## 前置环境

| 依赖 | 版本要求 | 用途 |
|------|---------|------|
| Node.js | ≥ 18.17 | 运行时 |
| npm | ≥ 9 | 包管理（workspaces） |
| MongoDB | ≥ 6.0 | 数据库（仅全栈模式需要） |

## 项目结构

```
project1/
├── client/                  # 前端 — Next.js 14 App Router
│   └── src/
│       ├── app/             # 页面路由（page.tsx）
│       ├── components/      # 公共组件
│       │   └── ui/          # Shadcn/UI 组件库
│       ├── lib/
│       │   ├── api.ts       # 真实 API 调用（axios → Express）
│       │   ├── mock-api.ts  # Mock API（内存数据，无需后端）
│       │   └── mock-data.ts # Mock 种子数据
│       └── store/
│           └── auth.ts      # Zustand 认证状态管理
├── server/                  # 后端 — Express + MongoDB
│   └── src/
│       ├── index.ts         # 入口：MongoDB 连接 + Express 启动
│       ├── routes/          # 路由注册（auth / posts / comments）
│       ├── controllers/     # 请求处理 + Zod 校验
│       ├── models/          # Mongoose 模型（User / Post / Comment）
│       └── middleware/
│           └── auth.ts      # JWT 认证中间件（requireAuth / optionalAuth）
├── package.json             # 根 workspaces 配置
└── CLAUDE.md                # Claude Code 项目指引
```

## 双模式运行

项目支持两种运行模式，当前默认使用 **Mock 模式**（无需数据库）。

### 模式一：Mock 模式（推荐开发前端）

无需后端、无需数据库，数据存储在浏览器内存中，刷新页面后重置。

```bash
# 根目录运行
npm run dev:client
```

前端访问 `http://localhost:3000`，所有接口调用走 `@/lib/mock-api`。

### 模式二：全栈模式（前后端 + MongoDB）

```bash
# 1. 确认 MongoDB 已启动
mongod --dbpath <your-data-dir>

# 2. 根目录同时启动前后端
npm run dev
```

前端 `http://localhost:3000`，后端 `http://localhost:5000`，API 健康检查 `http://localhost:5000/api/health`。

**切换到真实后端**：全局替换所有 `@/lib/mock-api` 的 import 为 `@/lib/api`。

## 环境变量

### 前端 `client/.env.local`

```bash
# 后端 API 地址（Mock 模式不使用，全栈模式生效）
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 后端 `server/.env`（全栈模式，自建）

```bash
PORT=5000                                    # 服务端口
MONGO_URI=mongodb://localhost:27017/codeblog # MongoDB 连接地址
JWT_SECRET=your-random-secret-string         # JWT 签名密钥
CLIENT_URL=http://localhost:3000             # 前端地址（CORS 白名单）
```

> 未创建 `.env` 时服务端使用默认值：端口 5000、本地 MongoDB、JWT 密钥 `dev-secret-change-in-production`。

## 所有命令

```bash
# ===== 根目录 =====
npm run dev           # 前后端同时启动（concurrently）
npm run dev:client    # 仅前端 → localhost:3000
npm run dev:server    # 仅后端 → localhost:5000（需 MongoDB）
npm run build         # 构建所有工作区
npm run lint          # 检查所有工作区

# ===== client/ =====
npx next dev          # 启动开发服务器
npx next build        # 生产构建
npx next start        # 启动生产服务

# ===== server/ =====
npx tsx watch src/index.ts  # 开发模式（热重载）
npx tsc               # 编译为 dist/
node dist/index.js    # 生产启动

# Shadcn/UI 组件
cd client && npx shadcn-ui@latest add <组件名>
```

## API 路由一览

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 注册 | 无 |
| POST | `/api/auth/login` | 登录 | 无 |
| GET | `/api/posts` | 文章列表（分页） | 可选 |
| POST | `/api/posts` | 创建文章 | 必须 |
| GET | `/api/posts/:id` | 文章详情 | 可选 |
| POST | `/api/posts/:id/like` | 点赞切换 | 必须 |
| GET | `/api/comments?postId=xxx` | 评论列表 | 无 |
| POST | `/api/comments` | 发表评论 | 必须 |

## 页面路由

| 路径 | 文件 | 说明 |
|------|------|------|
| `/` | `app/page.tsx` | 首页文章列表 |
| `/post/[id]` | `app/post/[id]/page.tsx` | 文章详情 + Markdown 渲染 |
| `/write` | `app/write/page.tsx` | 文章编辑器（需登录） |
| `/login` | `app/login/page.tsx` | 登录 |
| `/register` | `app/register/page.tsx` | 注册 |
| `/profile/[id]` | `app/profile/[id]/page.tsx` | 用户主页 |

## 技术栈

**前端**：Next.js 14 · React 18 · TypeScript · Tailwind CSS 3.4 · Zustand · react-markdown · Shadcn/UI · Lucide Icons

**后端**：Express 4.21 · Mongoose 8.6 · Zod · JWT · bcryptjs

## 常见问题

**Q: MongoDB 连接失败？**
确认 MongoDB 已安装并启动。Windows 下可运行 `mongod --dbpath <data目录>`，macOS/Linux 用 `brew services start mongodb-community`。

**Q: 不想装 MongoDB 怎么开发？**
使用 Mock 模式（`npm run dev:client`），前端功能完全可用，数据在内存中操作。

**Q: 端口被占用？**
前端默认 3000，后端默认 5000。可在对应 `.env` 文件中修改端口。
