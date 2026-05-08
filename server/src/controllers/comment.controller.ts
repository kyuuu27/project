// ===== Comment Controller — 评论发表 & 列表 =====
// POST /api/comments — 发表评论 (需登录，验证文章存在)
// GET  /api/comments?postId=xxx — 获取评论列表 (按时间倒序)

import { Response } from "express";
import { z } from "zod";
import { Comment } from "../models/Comment";
import { Post } from "../models/Post";
import { AuthRequest } from "../middleware/auth";

// ===== Zod 校验 Schema =====
const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "评论不能为空")
    .max(500, "评论最多 500 个字符"),
  postId: z.string().min(1, "文章 ID 不能为空"),
});

/**
 * POST /api/comments — 发表评论
 * 流程：Zod 校验 → 确认文章存在 → Comment.create → populate 作者信息
 * 状态码：201 (成功) / 400 (校验失败) / 404 (文章不存在)
 */
export async function createComment(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const parsed = createCommentSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join("; ");
      res.status(400).json({ message: messages });
      return;
    }

    const { content, postId } = parsed.data;

    // 确认目标文章存在
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: "文章不存在" });
      return;
    }

    const comment = await Comment.create({
      content,
      author: req.user!._id,
      post: postId,
    });

    // populate 作者信息返回给前端
    const populated = await comment.populate("author", "username avatar bio");

    res.status(201).json({
      message: "评论发表成功",
      comment: populated,
    });
  } catch (error) {
    res.status(500).json({ message: "服务器内部错误" });
  }
}

/**
 * GET /api/comments?postId=xxx — 获取某篇文章的评论列表
 * 按 createdAt 倒序 (最新评论在前)
 */
export async function getComments(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { postId } = req.query;
    if (!postId || typeof postId !== "string") {
      res.status(400).json({ message: "缺少 postId 参数" });
      return;
    }

    const comments = await Comment.find({ post: postId })
      .populate("author", "username avatar bio")  // 填充作者信息
      .sort({ createdAt: -1 })                     // 最新在前
      .lean();

    res.json({ comments });
  } catch (error) {
    res.status(500).json({ message: "服务器内部错误" });
  }
}
