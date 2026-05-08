// ===== Comments 路由 — /api/comments/* =====

import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { createComment, getComments } from "../controllers/comment.controller";

const router = Router();

// GET  /api/comments?postId=xxx — 获取某文章评论列表 (公开)
router.get("/", getComments);

// POST /api/comments               — 发表评论 (需登录)
router.post("/", requireAuth, createComment);

export default router;
