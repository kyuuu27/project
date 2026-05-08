// ===== Auth 路由 — /api/auth/* =====
// POST /api/auth/register — 注册
// POST /api/auth/login — 登录

import { Router } from "express";
import { register, login } from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);  // 完整路径：/api/auth/register
router.post("/login", login);        // 完整路径：/api/auth/login

export default router;
