"use client";

// ===== Zustand Auth Store — 全局认证状态管理 =====
// 登录/注册成功后存储 token + user 到 localStorage
// 页面刷新后通过 hydrate() 从 localStorage 恢复登录态
// 切换真实后端时，将 import 源改为 @/lib/api 即可

import { create } from "zustand";
import * as authApi from "@/lib/mock-api";  // ← 切换真实后端改这里
import type { User } from "@/lib/mock-api";  // ← 同步修改

interface AuthState {
  user: User | null;         // 当前用户
  token: string | null;      // JWT token
  isLoading: boolean;        // 登录/注册请求中
  isHydrated: boolean;       // localStorage 恢复完成标记

  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  /** 从 localStorage 恢复登录态 (由 AuthHydrator 组件在挂载时调用) */
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isHydrated: false,

  // --- 登录 ---
  async login(email, password) {
    set({ isLoading: true });
    try {
      const res = await authApi.login(email, password);
      // 持久化到 localStorage
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      set({ user: res.user, token: res.token, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      const message = error.response?.data?.message || "登录失败";
      throw new Error(message); // 上抛给页面处理
    }
  },

  // --- 注册 ---
  async register(username, email, password) {
    set({ isLoading: true });
    try {
      const res = await authApi.register(username, email, password);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      set({ user: res.user, token: res.token, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      const message = error.response?.data?.message || "注册失败";
      throw new Error(message);
    }
  },

  // --- 登出 ---
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },

  // --- 水合恢复 ---
  hydrate() {
    if (typeof window === "undefined") return; // SSR 安全
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ user, token, isHydrated: true });
        return;
      } catch {
        // 数据损坏 → 清除
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    set({ isHydrated: true });
  },
}));
