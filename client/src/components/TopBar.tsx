"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PenLine, Menu, Search, User, Crown, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useSidebar } from "./SidebarContext";
import { hotSearchTerms } from "@/lib/mock-data";

export function TopBar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { setOpen } = useSidebar();

  const [keywordIndex, setKeywordIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setKeywordIndex((i) => (i + 1) % hotSearchTerms.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const currentKeyword = hotSearchTerms[keywordIndex] || "";

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur h-16">
      <div className="flex items-center justify-between h-full px-4 lg:px-6 gap-4">
        {/* 左侧：汉堡菜单 + Logo + 搜索框 */}
        <div className="flex items-center gap-3 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo — 全宽顶栏中的品牌 */}
          <Link href="/" className="hidden md:flex items-center gap-2 font-bold text-xl text-primary shrink-0 mr-2">
            <PenLine className="h-6 w-6" />
            <span>CodeBlog</span>
          </Link>

          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={currentKeyword}
              className="pl-9 h-9 bg-muted/40 border-transparent focus:border-border animate-fade-text placeholder:text-muted-foreground/50 rounded-full"
              readOnly
            />
          </div>
        </div>

        {/* 右侧：写文章 + 头像下拉 / 登录 */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/write">
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 shadow-sm hover:shadow-md transition-shadow"
            >
              <PenLine className="h-4 w-4" />
              <span className="hidden sm:inline">写文章</span>
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 rounded-full p-0 ml-1 ring-2 ring-transparent hover:ring-primary/20 transition-all">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                      {user.username[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-0.5">
                    <span>{user.username}</span>
                    <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/profile/${user.id}`)}>
                  <User className="mr-2 h-4 w-4" />
                  个人资料
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="text-muted-foreground/50">
                  <Crown className="mr-2 h-4 w-4" />
                  会员中心
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button size="sm" variant="outline" className="ml-1">
                登录
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
