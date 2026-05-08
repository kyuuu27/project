"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/PostCard";
import type { PostSummary } from "@/lib/mock-api";
import { ArrowRight, Loader2, AlertCircle, FileText } from "lucide-react";

interface Props {
  title: string;
  description: string;
  posts: PostSummary[];
  loading: boolean;
  error: string;
  link: string;
  onRetry: () => void;
}

export function CategorySection({
  title,
  description,
  posts,
  loading,
  error,
  link,
  onRetry,
}: Props) {
  return (
    <section>
      {/* 标题行 */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
        <Link href={link}>
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground transition-colors">
            查看更多
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* 加载态 */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card overflow-hidden animate-pulse">
              <div className="aspect-video bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="flex gap-1.5">
                  <div className="h-4 bg-muted rounded w-10" />
                  <div className="h-4 bg-muted rounded w-12" />
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-muted rounded w-16" />
                  <div className="h-3 bg-muted rounded w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 错误态 */}
      {!loading && error && (
        <div className="flex flex-col items-center py-10 gap-3 border rounded-xl bg-muted/20">
          <AlertCircle className="h-8 w-8 text-destructive/70" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            重新加载
          </Button>
        </div>
      )}

      {/* 空态 */}
      {!loading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center py-10 gap-3 border rounded-xl bg-muted/20">
          <FileText className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">暂无相关内容</p>
        </div>
      )}

      {/* 数据态 */}
      {!loading && !error && posts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} variant="compact" />
          ))}
        </div>
      )}
    </section>
  );
}
