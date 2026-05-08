// ===== 根布局组件 — 全宽顶部栏 + 侧边栏 + 内容区 =====

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SidebarProvider } from "@/components/SidebarContext";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { AuthHydrator } from "@/components/AuthHydrator";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CodeBlog - 开发者内容社区",
  description: "CodeBlog 是一个面向开发者的技术博客平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AuthHydrator />
        <SidebarProvider>
          {/* TopBar — 全宽，固定在顶部 */}
          <TopBar />

          {/* 主体：侧边栏 + 内容区 */}
          <div className="flex h-[calc(100vh-4rem)]">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden md:ml-60 custom-scrollbar">
              <main className="flex-1">{children}</main>
              <footer className="border-t py-6 text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} CodeBlog. Built with Next.js & Express.
              </footer>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
