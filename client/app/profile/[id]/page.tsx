"use client";

// ===== 用户主页 — 个人信息卡片 + 文章/评论/获赞统计 =====
// 注意：后端暂未提供 GET /api/users/:id，当前从 localStorage 获取当前用户信息
// 或显示 Mock 基本信息 (非当前用户时)

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { User, Calendar, MessageCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth";

// 用户资料数据结构
interface ProfileData {
  id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  createdAt: string;
}

export default function ProfilePage() {
  const params = useParams();
  const id = params.id as string;   // URL 中的用户 ID
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user: currentUser } = useAuthStore(); // 当前登录用户

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);

        // 先检查 localStorage 中的当前用户 (mock 模式)
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.id === id) {
            // 当前登录用户本人 — 使用完整信息
            setProfile({ ...parsed, createdAt: new Date().toISOString() });
            return;
          }
        }

        // 非当前用户 — 显示简化信息 (后端暂无用户 API)
        setProfile({
          id,
          username: "用户 " + id.slice(-6),
          email: "",
          avatar: "",
          bio: "该用户还没有填写个人简介",
          createdAt: new Date().toISOString(),
        });
      } catch {
        setError("用户不存在或加载失败");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [id]);

  // ===== 加载态 =====
  if (loading) {
    return (
      <div className="flex flex-col items-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ===== 错误态 =====
  if (error || !profile) {
    return (
      <div className="container py-16 text-center max-w-3xl">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-4">{error || "用户不存在"}</h2>
        <Link href="/">
          <Button>返回首页</Button>
        </Link>
      </div>
    );
  }

  // 判断是否为本人主页
  const isOwner = currentUser?.id === id;

  return (
    <div className="container py-10 max-w-3xl">
      <Card>
        <CardHeader className="flex flex-row items-center gap-6 pb-6">
          {/* 头像占位 — 圆形 Primary 浅色背景 */}
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-10 w-10 text-primary" />
          </div>

          {/* 用户名 + 简介 */}
          <div>
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            <p className="text-muted-foreground text-sm mt-1">{profile.bio}</p>
            {/* 加入时间 */}
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(profile.createdAt).toLocaleDateString("zh-CN")} 加入
            </div>
          </div>

          {/* 编辑资料按钮 — 仅本人可见 (当前禁用) */}
          {isOwner && (
            <div className="ml-auto">
              <Button variant="outline" size="sm" disabled>
                编辑资料
              </Button>
            </div>
          )}
        </CardHeader>

        {/* 统计数据 — 文章数 / 评论数 / 获赞数 (当前为占位 0) */}
        <CardContent>
          <div className="flex gap-8 text-center">
            <div>
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">文章</div>
            </div>
            <div>
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">评论</div>
            </div>
            <div>
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">获赞</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 引导用户写文章 / 空状态提示 */}
      <div className="mt-8 text-center">
        <p className="text-muted-foreground mb-4">该用户还没有发布文章</p>
        {isOwner && (
          <Link href="/write">
            <Button>
              <MessageCircle className="h-4 w-4 mr-1" />
              写一篇文章
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
