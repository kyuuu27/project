import Link from "next/link";
import { Eye, Heart, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PostSummary } from "@/lib/mock-api";

interface Props {
  post: PostSummary;
  variant?: "default" | "compact";
}

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

// 每篇文章生成一致的封面图
function coverUrl(postId: string): string {
  return `https://picsum.photos/seed/${postId}/400/225`;
}

export function PostCard({ post, variant = "default" }: Props) {
  if (variant === "compact") {
    const displayTags = post.tags.slice(0, 3);
    return (
      <Link href={`/post/${post._id}`}>
        <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group h-full overflow-hidden border-muted/60">
          {/* 封面图 */}
          <div className="aspect-video overflow-hidden bg-muted">
            <img
              src={post.coverImage || coverUrl(post._id)}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>

          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2 text-sm leading-snug">
              {post.title}
            </h3>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {displayTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80 truncate max-w-[80px]">
                {post.author?.username ?? "匿名"}
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {post.views}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {Array.isArray(post.likes) ? post.likes.length : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // default variant
  return (
    <Link href={`/post/${post._id}`}>
      <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group overflow-hidden border-muted/60">
        <div className="flex flex-col sm:flex-row">
          {/* 封面图列 */}
          <div className="sm:w-48 shrink-0 aspect-video sm:aspect-auto overflow-hidden bg-muted">
            <img
              src={post.coverImage || coverUrl(post._id)}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>

          <CardContent className="p-5 flex-1">
            <h2 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-1">
              {post.title}
            </h2>

            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {post.tags?.length
                ? `标签: ${post.tags.join(" · ")}`
                : "暂无摘要"}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="font-medium text-foreground">
                  {post.author?.username ?? "匿名"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(post.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {post.views}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {Array.isArray(post.likes) ? post.likes.length : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}
