// ===== Auth Controller — 注册 & 登录 =====
// POST /api/auth/register — 创建用户，返回 JWT
// POST /api/auth/login — 验证邮箱密码，返回 JWT

import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User } from "../models/User";
import { JWT_SECRET } from "../middleware/auth";

// ===== Zod 校验 Schema =====

const registerSchema = z.object({
  username: z
    .string()
    .min(2, "用户名至少 2 个字符")
    .max(20, "用户名最多 20 个字符"),
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(6, "密码至少 6 个字符"),
});

const loginSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(1, "密码不能为空"),
});

// ===== 生成 JWT Token =====
// 有效期 7 天，payload 仅包含 userId
function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

// ===== MongoDB 错误转中文提示 =====
// 处理 Mongoose 唯一索引冲突 (error.code === 11000)
function formatMongoError(error: any): string {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return field === "email" ? "该邮箱已被注册" : "该用户名已被占用";
  }
  return "服务器内部错误";
}

/**
 * POST /api/auth/register — 用户注册
 * 流程：Zod 校验 → User.create (触发 pre-save bcrypt 哈希) → 返回 token + user
 * 状态码：201 (成功) / 400 (校验失败) / 409 (重复注册)
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    // Zod safeParse — 返回 { success: boolean, data/error }
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join("; ");
      res.status(400).json({ message: messages });
      return;
    }

    const { username, email, password } = parsed.data;

    const user = await User.create({ username, email, password }); // 触发 pre-save 哈希

    const token = generateToken(user._id as string);

    // 返回时不包含 password (UserSchema 设置了 select: false)
    res.status(201).json({
      message: "注册成功",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (error: any) {
    const message = formatMongoError(error);
    res.status(message.includes("已被") ? 409 : 500).json({ message });
  }
}

/**
 * POST /api/auth/login — 用户登录
 * 流程：Zod 校验 → 查用户 (+password) → bcrypt.compare → 返回 token + user
 * 状态码：200 (成功) / 400 (校验失败) / 401 (邮箱或密码错误)
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join("; ");
      res.status(400).json({ message: messages });
      return;
    }

    const { email, password } = parsed.data;

    // select("+password") 强制加载默认隐藏的 password 字段
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({ message: "邮箱或密码错误" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "邮箱或密码错误" });
      return;
    }

    const token = generateToken(user._id as string);

    res.json({
      message: "登录成功",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "服务器内部错误" });
  }
}
