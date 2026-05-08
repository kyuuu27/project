"use client";

// ===== CommentSection — 评论区组件 =====
// 功能：加载评论列表 + 发表评论
// - 已登录用户：textarea 输入框 + 提交按钮
// - 未登录用户：登录引导提示
// - 加载态：骨架屏占位 (3 行脉冲动画)
// - 空态：引导文案

import { useEffect, useState, useCallback } from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/auth";
import { fetchComments, createComment, type CommentData } from "@/lib/mock-api";
import Link from "next/link";

interface Props {
  postId: string;
}

// --- 工具函数：相对时间 ---
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

export function CommentSection({ postId }: Props) {
  // --- 状态 ---
  const [comments, setComments] = useState<CommentData[]>([]);
  const [input, setInput] = useState("");           // 评论输入框
  const [submitting, setSubmitting] = useState(false); // 发表中
  const [loading, setLoading] = useState(true);      // 列表加载中
  const [error, setError] = useState("");
  const { user } = useAuthStore();

  // --- 加载评论列表 ---
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const { comments } = await fetchComments(postId);
      setComments(comments);
    } catch {
      setError("评论加载失败");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // --- 发表评论 ---
  const handleSubmit = async () => {
    if (!input.trim() || submitting) return;
    try {
      setSubmitting(true);
      setError("");
      const { comment } = await createComment(input.trim(), postId);
      // 新评论插入列表头部 (最新在前)
      setComments((prev) => [comment, ...prev]);
      setInput("");
    } catch (err: any) {
      setError(err.response?.data?.message || "评论发表失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      {/* 评论区标题 + 计数 */}
      <h3 className="text-xl font-semibold mb-6">
        评论 ({comments.length})
      </h3>

      {/* ===== 发表评论区域 ===== */}
      {user ? (
        // 已登录 → 输入框 + 字数统计 + 提交按钮
        <div className="mb-8 space-y-3">
          <Textarea
            placeholder="写下你的评论..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            maxLength={500}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {input.length}/500
            </span>
            <Button onClick={handleSubmit} disabled={!input.trim() || submitting} size="sm">
              {submitting ? "发表中..." : "发表评论"}
            </Button>
          </div>
        </div>
      ) : (
        // 未登录 → 登录引导
        <div className="mb-8 p-4 rounded-lg border bg-muted/30 text-center">
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              登录
            </Link>
            {" "}后即可发表评论
          </p>
        </div>
      )}

      {/* ===== 评论列表 ===== */}
      {loading ? (
        // 加载态 → 骨架屏 (3 行脉冲动画)
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="h-9 w-9 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-3 w-full bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        // 空态
        <p className="text-muted-foreground text-sm">暂无评论，来发表第一条吧</p>
      ) : (
        // 数据态 → 评论列表
        <div className="space-y-5">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              {/* 头像占位 */}
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                {/* 作者 + 时间 */}
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/profile/${comment.author._id}`}
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    {comment.author.username}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(comment.createdAt)}
                  </span>
                </div>
                {/* 评论内容 — 保留换行 */}
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
