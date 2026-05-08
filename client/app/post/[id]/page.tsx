"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, Heart, Clock, User, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CommentSection } from "@/components/CommentSection";
import { useAuthStore } from "@/store/auth";
import { fetchPostById, toggleLike, type PostDetail } from "@/lib/mock-api";
import { cn } from "@/lib/utils";

function formatTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return new Date(dateStr).toLocaleDateString("zh-CN");
}

export default function PostDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const { user } = useAuthStore();

  const loadPost = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { post } = await fetchPostById(id);
      setPost(post);
      setLikesCount(Array.isArray(post.likes) ? post.likes.length : 0);

      if (user && Array.isArray(post.likes)) {
        const ids = post.likes.map((item: any) =>
          typeof item === "string" ? item : item._id
        );
        setLiked(ids.includes(user.id));
      }
    } catch {
      setError("文章不存在或加载失败");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const handleLike = async () => {
    if (!user || likeLoading) return;
    try {
      setLikeLoading(true);
      const res = await toggleLike(id);
      setLiked(res.liked);
      setLikesCount(res.likesCount);
    } catch {
      // 静默失败
    } finally {
      setLikeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">加载文章中...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center py-20 gap-4 px-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold">{error || "文章不存在"}</h2>
        <p className="text-muted-foreground">该文章可能已被删除或链接无效</p>
        <Link href="/">
          <Button>返回首页</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 lg:px-12 py-6 max-w-5xl mx-auto">
      {/* 返回按钮 */}
      <Link href="/">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" />
          返回文章列表
        </Button>
      </Link>

      {/* 封面图 */}
      {post.coverImage && (
        <div className="aspect-video w-full rounded-lg overflow-hidden mb-8 bg-muted">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <article>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
          <Link
            href={`/profile/${post.author._id}`}
            className="flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition-colors"
          >
            <User className="h-4 w-4" />
            {post.author.username}
          </Link>

          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatTime(post.createdAt)}
          </span>

          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {post.views} 次阅读
          </span>

          <button
            onClick={handleLike}
            disabled={!user || likeLoading}
            className={cn(
              "flex items-center gap-1 transition-colors",
              user ? "cursor-pointer hover:text-red-500" : "cursor-default",
              liked && "text-red-500"
            )}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            {likesCount} 人点赞
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        <Separator className="mb-8" />

        <div className="mb-10">
          <MarkdownRenderer content={post.content} />
        </div>
      </article>

      <Separator className="mb-8" />

      <CommentSection postId={id} />
    </div>
  );
}
