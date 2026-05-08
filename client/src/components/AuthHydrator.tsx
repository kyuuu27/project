"use client";

// ===== AuthHydrator — 客户端水合组件 =====
// 在根布局中渲染，页面加载时从 localStorage 恢复用户登录态
// 渲染 null (无 DOM 输出)，仅执行副作用

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

export function AuthHydrator() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate(); // 挂载时执行一次，从 localStorage 读取 token+user
  }, [hydrate]);

  return null; // 不渲染任何 DOM
}
