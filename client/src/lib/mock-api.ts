// ===== Mock API 层 — 模拟后端接口 =====
// 提供与 client/src/lib/api.ts 完全相同的函数签名和类型导出
// 切换真实后端：全局替换 import { xxx } from "@/lib/mock-api" → "@/lib/api"
//
// 数据在内存中操作，新用户/文章/评论会在会话内持久化 (刷新重置)
// 错误格式模拟 axios：throw { response: { data: { message: "..." } } }

import {
  mockUsers,
  mockPosts,
  mockComments,
  findUserById,
  findUserByEmail,
  delay,
  type MockUser,
  type MockPost,
  type MockComment,
} from "./mock-data";

// ==================== 类型（与真实 api.ts 保持一致） ====================

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface PostAuthor {
  _id: string;
  username: string;
  avatar: string;
  bio?: string;
}

export interface PostSummary {
  _id: string;
  title: string;
  content?: string;
  author: PostAuthor;
  tags: string[];
  coverImage: string;
  likes: string[];
  views: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PostDetail extends PostSummary {
  content: string;
  likes: string[] | PostAuthor[];
}

export interface PostsResponse {
  posts: PostSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PostResponse {
  post: PostDetail;
}

export interface CreatePostInput {
  title: string;
  content: string;
  tags?: string[];
  coverImage?: string;
}

export interface CommentData {
  _id: string;
  content: string;
  author: PostAuthor;
  post: string;
  createdAt: string;
}

// ==================== 会话状态 ====================

let currentUserId: string | null = null;  // 当前登录用户 ID (模拟 session)

/** 获取当前登录用户 ID */
export function getCurrentUserId(): string | null {
  return currentUserId;
}

/** 生成假 JWT token (格式: mock_token_<userId>_<timestamp>) */
function fakeToken(userId: string): string {
  return `mock_token_${userId}_${Date.now()}`;
}

// ==================== Auth API ====================

/** 登录 — 验证邮箱和密码，返回 token + user */
export async function login(email: string, password: string): Promise<AuthResponse> {
  await delay();

  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    // 模拟 axios 错误格式
    throw { response: { data: { message: "邮箱或密码错误" } } };
  }

  currentUserId = user._id;

  // 返回时去除 password
  const safeUser: User = {
    id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
  };

  return {
    message: "登录成功",
    token: fakeToken(user._id),
    user: safeUser,
  };
}

/** 注册 — 检查重复用户名/邮箱，创建用户并自动登录 */
export async function register(
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  await delay();

  // 检查邮箱和用户名唯一性
  if (mockUsers.find((u) => u.email === email)) {
    throw { response: { data: { message: "该邮箱已被注册" } } };
  }
  if (mockUsers.find((u) => u.username === username)) {
    throw { response: { data: { message: "该用户名已被占用" } } };
  }

  const newUser: MockUser = {
    _id: "u" + (mockUsers.length + 1),
    username,
    email,
    password,
    avatar: "",
    bio: "",
    createdAt: new Date().toISOString(),
  };

  mockUsers.push(newUser);       // 添加到内存 (会话持久)
  currentUserId = newUser._id;   // 自动登录

  const safeUser: User = {
    id: newUser._id,
    username: newUser.username,
    email: newUser.email,
    avatar: newUser.avatar,
    bio: newUser.bio,
  };

  return {
    message: "注册成功",
    token: fakeToken(newUser._id),
    user: safeUser,
  };
}

/** 获取热门文章 — 按浏览量降序排列 */
export async function fetchHotPosts(limit = 6): Promise<PostSummary[]> {
  await delay(200);
  const sorted = [...mockPosts].sort((a, b) => b.views - a.views);
  return sorted.slice(0, limit).map(toPostSummary);
}

// ==================== Posts API ====================

/** 将 MockPost 转为 PostSummary (列表用，不含完整正文) */
function toPostSummary(p: MockPost): PostSummary {
  const author = findUserById(p.author);
  return {
    _id: p._id,
    title: p.title,
    tags: p.tags,
    coverImage: p.coverImage,
    likes: p.likes,
    views: p.views,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    author: author
      ? { _id: author._id, username: author.username, avatar: author.avatar, bio: "" }
      : { _id: "unknown", username: "未知用户", avatar: "", bio: "" },
  };
}

/** 将 MockPost 转为 PostDetail (详情用，含完整正文) */
function toPostDetail(p: MockPost): PostDetail {
  const author = findUserById(p.author);
  return {
    _id: p._id,
    title: p.title,
    content: p.content,
    tags: p.tags,
    coverImage: p.coverImage,
    likes: p.likes,
    views: p.views,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    author: author
      ? { _id: author._id, username: author.username, avatar: author.avatar, bio: author.bio || "" }
      : { _id: "unknown", username: "未知用户", avatar: "", bio: "" },
  };
}

/** 获取文章列表 — 分页 + 按标签筛选 + 按时间倒序 */
export async function fetchPosts(
  page = 1,
  limit = 10,
  tag?: string
): Promise<PostsResponse> {
  await delay(200);

  let filtered = [...mockPosts];
  if (tag) {
    filtered = filtered.filter((p) => p.tags.includes(tag)); // 标签筛选
  }

  // 按创建时间倒序排列
  filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit); // 分页切片

  return {
    posts: paged.map(toPostSummary),
    pagination: { page, limit, total, totalPages },
  };
}

/** 获取单篇文章详情 — 阅读量 +1 */
export async function fetchPostById(id: string): Promise<PostResponse> {
  await delay(200);

  const post = mockPosts.find((p) => p._id === id);
  if (!post) {
    throw { response: { data: { message: "文章不存在" } } };
  }

  post.views += 1;  // 每次访问阅读量 +1

  return { post: toPostDetail(post) };
}

/** 创建文章 — 需已登录，新文章插入列表头部 */
export async function createPost(input: CreatePostInput): Promise<{
  message: string;
  post: PostDetail;
}> {
  await delay();

  if (!currentUserId) {
    throw { response: { data: { message: "请先登录" } } };
  }

  const newPost: MockPost = {
    _id: "p" + (mockPosts.length + 1) + "_" + Date.now(),
    title: input.title,
    content: input.content,
    author: currentUserId,
    tags: input.tags || [],
    coverImage: input.coverImage || "",
    likes: [],
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockPosts.unshift(newPost); // 插入头部 (最新文章在前)

  return {
    message: "文章发布成功",
    post: toPostDetail(newPost),
  };
}

/** 点赞/取消点赞 — 需已登录，toggle 模式 */
export async function toggleLike(id: string): Promise<{
  message: string;
  liked: boolean;
  likesCount: number;
}> {
  await delay(100);

  if (!currentUserId) {
    throw { response: { data: { message: "请先登录" } } };
  }

  const post = mockPosts.find((p) => p._id === id);
  if (!post) {
    throw { response: { data: { message: "文章不存在" } } };
  }

  const idx = post.likes.indexOf(currentUserId);
  let liked: boolean;

  if (idx >= 0) {
    // 已点赞 → 取消
    post.likes.splice(idx, 1);
    liked = false;
  } else {
    // 未点赞 → 添加
    post.likes.push(currentUserId);
    liked = true;
  }

  return {
    message: liked ? "点赞成功" : "已取消点赞",
    liked,
    likesCount: post.likes.length,
  };
}

// ==================== Comments API ====================

/** 获取某篇文章的评论列表 — 按时间倒序 */
export async function fetchComments(postId: string): Promise<{
  comments: CommentData[];
}> {
  await delay(200);

  const comments = mockComments
    .filter((c) => c.post === postId)                      // 按文章 ID 筛选
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() // 最新在前
    )
    .map((c) => {
      const author = findUserById(c.author);
      return {
        _id: c._id,
        content: c.content,
        post: c.post,
        createdAt: c.createdAt,
        author: author
          ? { _id: author._id, username: author.username, avatar: author.avatar, bio: "" }
          : { _id: "unknown", username: "未知用户", avatar: "", bio: "" },
      };
    });

  return { comments };
}

/** 发表评论 — 需已登录，新评论追加到数组尾部 */
export async function createComment(
  content: string,
  postId: string
): Promise<{ message: string; comment: CommentData }> {
  await delay();

  if (!currentUserId) {
    throw { response: { data: { message: "请先登录" } } };
  }

  const newComment: MockComment = {
    _id: "c" + (mockComments.length + 1) + "_" + Date.now(),
    content,
    author: currentUserId,
    post: postId,
    createdAt: new Date().toISOString(),
  };

  mockComments.push(newComment);

  const author = findUserById(currentUserId);

  return {
    message: "评论发表成功",
    comment: {
      _id: newComment._id,
      content: newComment.content,
      post: newComment.post,
      createdAt: newComment.createdAt,
      author: author
        ? { _id: author._id, username: author.username, avatar: author.avatar, bio: "" }
        : { _id: "unknown", username: "未知用户", avatar: "", bio: "" },
    },
  };
}
