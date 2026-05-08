"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PenLine,
  Home,
  Flame,
  UserPlus,
  FileText,
  Newspaper,
  Tags,
  Bookmark,
  Clock,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";

interface NavSection {
  title: string;
  items: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

const navSections: NavSection[] = [
  {
    title: "推荐",
    items: [
      { href: "/", label: "首页", icon: Home },
      { href: "/?category=hot", label: "热门", icon: Flame },
      { href: "/?category=following", label: "关注", icon: UserPlus },
    ],
  },
  {
    title: "内容",
    items: [
      { href: "/?category=blog", label: "博客", icon: FileText },
      { href: "/?category=news", label: "资讯", icon: Newspaper },
      { href: "/?category=tags", label: "标签", icon: Tags },
    ],
  },
  {
    title: "个人",
    items: [
      { href: "/?category=bookmarks", label: "收藏", icon: Bookmark },
      { href: "/?category=history", label: "历史", icon: Clock },
      { href: "/?category=settings", label: "设置", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();

  return (
    <>
      {/* 移动端遮罩层 */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-60 border-r bg-background flex flex-col",
          "transition-transform duration-200",
          "-translate-x-full md:translate-x-0"
        )}
      >
        {/* 导航区域 */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-6">
          {navSections.map((section) => (
            <div key={section.title}>
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href === "/" && pathname === "/");
                  return (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* 底部信息 */}
        <div className="p-4 border-t bg-muted/20">
          <p className="text-xs text-muted-foreground">CodeBlog v1.0</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
            开发者内容社区
          </p>
        </div>
      </aside>
    </>
  );
}
