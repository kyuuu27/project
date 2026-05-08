// ===== 真实 API 层 — 通过 Axios 请求 Express 后端 =====
// 当前项目使用 mock-api.ts (无需后端)，此文件为对接真实后端预留
// 切换方式：全局替换 import { xxx } from "@/lib/mock-api" → "@/lib/api"
// 前提：启动 MongoDB + Express server (npm run dev:server)

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/** 全局 Axios 实例 — 基础 URL + 10s 超时 + JSON Content-Type */
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ===== 请求拦截器 — 自动从 localStorage 读取 token 附加到 Authorization 头 =====
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ===== 响应拦截器 — 收到 401 时清除本地登录态 =====
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    return Promise.reject(error);
  }
);

// ==================== 类型定义 ====================

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
  likes: PostAuthor[] | string[];
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

// ==================== Auth API ====================

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function register(
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await api.post("/auth/register", { username, email, password });
  return data;
}

// ==================== Posts API ====================

export async function fetchPosts(page = 1, limit = 10, tag?: string): Promise<PostsResponse> {
  const params: Record<string, string | number> = { page, limit };
  if (tag) params.tag = tag;
  const { data } = await api.get("/posts", { params });
  return data;
}

export async function fetchPostById(id: string): Promise<PostResponse> {
  const { data } = await api.get(`/posts/${id}`);
  return data;
}

export async function createPost(input: CreatePostInput): Promise<{ message: string; post: PostDetail }> {
  const { data } = await api.post("/posts", input);
  return data;
}

export async function toggleLike(id: string): Promise<{
  message: string;
  liked: boolean;
  likesCount: number;
}> {
  const { data } = await api.post(`/posts/${id}/like`);
  return data;
}

// ==================== Comments API ====================

export async function fetchComments(postId: string): Promise<{ comments: CommentData[] }> {
  const { data } = await api.get("/comments", { params: { postId } });
  return data;
}

export async function createComment(
  content: string,
  postId: string
): Promise<{ message: string; comment: CommentData }> {
  const { data } = await api.post("/comments", { content, postId });
  return data;
}
