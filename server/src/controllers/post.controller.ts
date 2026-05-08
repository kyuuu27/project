// ===== Post Controller — 文章 CRUD + 点赞 =====
// GET  /api/posts       — 列表 (分页 + 标签/作者筛选)
// GET  /api/posts/:id   — 详情 (阅读量 +1)
// POST /api/posts       — 创建 (需登录)
// POST /api/posts/:id/like — 点赞/取消 (需登录, toggle 模式)

import { Response } from "express";
import { z } from "zod";
import { Post } from "../models/Post";
import { AuthRequest } from "../middleware/auth";

// ===== Zod 校验 Schema =====

const createPostSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(100, "标题最多 100 个字符"),
  content: z.string().min(1, "内容不能为空"),
  tags: z.array(z.string()).max(5, "最多 5 个标签").default([]),
  coverImage: z.string().optional().default(""),
});

const getPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),        // 页码 ≥ 1
  limit: z.coerce.number().int().min(1).max(50).default(10), // 每页 1~50
  tag: z.string().optional(),     // 按标签筛选
  author: z.string().optional(),  // 按作者 ID 筛选
});

/**
 * GET /api/posts — 获取文章列表
 * 查询流程：解析 query params → 构建筛选条件 → 分页查询 (lean, select 排除 content)
 * 返回：posts + pagination (page, limit, total, totalPages)
 */
export async function getPosts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = getPostsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "查询参数不合法" });
      return;
    }

    const { page, limit, tag, author } = parsed.data;
    const skip = (page - 1) * limit;

    // 构建筛选条件
    const filter: Record<string, unknown> = {};
    if (tag) filter.tags = tag;        // 标签精确匹配
    if (author) filter.author = author; // 作者 ID 筛选

    // 并行查询：文章列表 + 总数
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("author", "username avatar bio")  // 填充作者信息
        .sort({ createdAt: -1 })                     // 最新在前
        .skip(skip)
        .limit(limit)
        .select("-content")                          // 列表不返回完整正文
        .lean(),                                     // 返回纯 JS 对象 (更快)
      Post.countDocuments(filter),
    ]);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "服务器内部错误" });
  }
}

/**
 * GET /api/posts/:id — 获取文章详情
 * 每次请求 views +1 (findByIdAndUpdate + $inc)
 * populate likes → 显示点赞用户的 username/avatar
 */
export async function getPostById(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    // findByIdAndUpdate — 查找并原子递增 views
    const post = await Post.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },  // 阅读量 +1
      { new: true }             // 返回更新后的文档
    )
      .populate("author", "username avatar bio")
      .populate("likes", "username avatar");

    if (!post) {
      res.status(404).json({ message: "文章不存在" });
      return;
    }

    res.json({ post });
  } catch (error) {
    res.status(500).json({ message: "服务器内部错误" });
  }
}

/**
 * POST /api/posts — 创建文章 (需 requireAuth 中间件)
 * 创建者 = req.user._id (从 JWT 中提取)
 */
export async function createPost(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const parsed = createPostSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join("; ");
      res.status(400).json({ message: messages });
      return;
    }

    const post = await Post.create({
      ...parsed.data,
      author: req.user!._id,  // 作者是当前登录用户
    });

    const populated = await post.populate("author", "username avatar bio");

    res.status(201).json({
      message: "文章发布成功",
      post: populated,
    });
  } catch (error) {
    res.status(500).json({ message: "服务器内部错误" });
  }
}

/**
 * POST /api/posts/:id/like — 点赞/取消点赞 (toggle)
 * 逻辑：检查 userId 是否在 likes 数组中 → 有则删除，无则添加
 * 返回：liked (当前状态), likesCount (最新数量)
 */
export async function toggleLike(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ message: "文章不存在" });
      return;
    }

    const hasLiked = post.likes.some(
      (uid) => uid.toString() === userId.toString()
    );

    if (hasLiked) {
      // 取消点赞 — 从数组中移除
      post.likes = post.likes.filter(
        (uid) => uid.toString() !== userId.toString()
      );
    } else {
      // 点赞 — push 到数组
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      message: hasLiked ? "已取消点赞" : "点赞成功",
      liked: !hasLiked,
      likesCount: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({ message: "服务器内部错误" });
  }
}
