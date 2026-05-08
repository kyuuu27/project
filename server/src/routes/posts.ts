// ===== Posts 路由 — /api/posts/* =====

import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  getPosts,
  getPostById,
  createPost,
  toggleLike,
} from "../controllers/post.controller";

const router = Router();

// --- 公开路由 (无需登录) ---
router.get("/", getPosts);             // GET  /api/posts         — 文章列表
router.get("/:id", getPostById);       // GET  /api/posts/:id     — 文章详情

// --- 需登录路由 (requireAuth 中间件) ---
router.post("/", requireAuth, createPost);            // POST /api/posts         — 创建文章
router.post("/:id/like", requireAuth, toggleLike);    // POST /api/posts/:id/like — 点赞/取消

export default router;
