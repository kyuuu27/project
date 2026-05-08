// ===== 服务端入口文件 =====
// 1. 加载环境变量
// 2. 配置 Express 中间件 (CORS / JSON 解析)
// 3. 注册 API 路由 (/api/auth, /api/posts, /api/comments)
// 4. 连接 MongoDB 并启动 HTTP 服务

import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import postRoutes from "./routes/posts";
import commentRoutes from "./routes/comments";

dotenv.config();  // 加载 .env 文件

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/codeblog";

// ===== 中间件 =====
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" })); // 允许前端跨域
app.use(express.json({ limit: "10mb" }));                // 解析 JSON 请求体 (最大 10MB)
app.use(express.urlencoded({ extended: true }));          // 解析 URL 编码表单

// ===== 健康检查 =====
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ===== 路由注册 =====
app.use("/api/auth", authRoutes);          // 认证：POST /register, POST /login
app.use("/api/posts", postRoutes);         // 文章：CRUD + 点赞
app.use("/api/comments", commentRoutes);   // 评论：发表 + 列表

// ===== 数据库连接 & 启动服务 =====
async function bootstrap(): Promise<void> {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("[MongoDB] 数据库连接成功");

    app.listen(PORT, () => {
      console.log(`[Server] 服务已启动 → http://localhost:${PORT}`);
      console.log(`[Server] 健康检查 → http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("[MongoDB] 数据库连接失败:", error);
    process.exit(1);
  }
}

bootstrap();

export default app;
