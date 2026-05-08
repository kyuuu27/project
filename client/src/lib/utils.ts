// ===== cn() — Tailwind 类名合并工具 =====
// 解决条件类名冲突问题：后面的类名会覆盖前面的同名 Tailwind 工具类

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并任意数量的 Tailwind CSS 类名，自动处理冲突。
 * 例如 cn("px-2 py-1", "px-4") → "py-1 px-4" (后面的 px-4 覆盖前面的 px-2)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
