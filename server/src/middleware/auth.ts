// ===== JWT 认证中间件 =====
// requireAuth：必须提供有效 Token → 返回 401
// optionalAuth：Token 可选，有则挂载用户，没有也放行 (用于文章列表)
// AuthRequest：扩展 Express Request，挂载当前用户对象

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

export interface AuthRequest extends Request {
  user?: IUser;  // 鉴权成功后挂载的用户对象
}

interface JwtPayload {
  userId: string;
  iat: number;  // issued at
  exp: number;  // expiration
}

/**
 * requireAuth — 强制鉴权
 * 流程：提取 Authorization: Bearer <token> → 验证 JWT → 查数据库 → 挂载 req.user
 */
export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "未登录，请先登录" });
      return;
    }

    const token = authHeader.split(" ")[1];                // "Bearer xxx" → "xxx"
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: "用户不存在" });
      return;
    }

    req.user = user;  // 挂载用户到 request
    next();
  } catch (error) {
    res.status(401).json({ message: "Token 无效或已过期" });
  }
}

/**
 * optionalAuth — 可选鉴权
 * Token 有效 → 挂载用户；无效/缺失 → 静默跳过，继续处理请求
 */
export async function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await User.findById(decoded.userId);
    if (user) {
      req.user = user;
    }
  } catch {
    // Token 无效 → 静默跳过，不阻断请求
  }
  next();
}

export { JWT_SECRET };
