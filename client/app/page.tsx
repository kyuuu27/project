"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { CategorySection } from "@/components/CategorySection";
import { PostCard } from "@/components/PostCard";
import { fetchPosts, fetchHotPosts, type PostSummary } from "@/lib/mock-api";
import { categoryGroups } from "@/lib/mock-data";
import { Loader2 } from "lucide-react";

interface SectionState {
  posts: PostSummary[];
  loading: boolean;
  error: string;
}

export default function HomePage() {
  const [sections, setSections] = useState<Record<string, SectionState>>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [morePosts, setMorePosts] = useState<PostSummary[]>([]);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadSection = useCallback(async (groupId: string, tag: string) => {
    setSections((prev) => ({
      ...prev,
      [groupId]: { posts: [], loading: true, error: "" },
    }));

    try {
      let data: { posts: PostSummary[] };
      if (groupId === "hot-blog") {
        const posts = await fetchHotPosts(8);
        data = { posts };
      } else if (tag) {
        data = await fetchPosts(1, 8, tag);
      } else {
        data = await fetchPosts(1, 8);
      }

      setSections((prev) => ({
        ...prev,
        [groupId]: { posts: data.posts, loading: false, error: "" },
      }));
    } catch {
      setSections((prev) => ({
        ...prev,
        [groupId]: { posts: [], loading: false, error: "加载失败" },
      }));
    }
  }, []);

  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const data = await fetchPosts(page + 1, 6);
      if (data.posts.length === 0 || data.pagination.page >= data.pagination.totalPages) {
        setHasMore(false);
      } else {
        setMorePosts((prev) => [...prev, ...data.posts]);
        setPage((p) => p + 1);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasMore]);

  useEffect(() => {
    categoryGroups.forEach((group) => {
      loadSection(group.id, group.tag);
    });
  }, [loadSection]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMorePosts]);

  const allLoading = categoryGroups.every(
    (g) => !sections[g.id] || sections[g.id].loading
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-10 max-w-[1600px] mx-auto">
      {/* 首屏加载骨架 */}
      {allLoading && (
        <div className="space-y-10">
          {categoryGroups.map((group) => (
            <div key={group.id}>
              <div className="flex items-end justify-between mb-5">
                <div>
                  <div className="h-7 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-36 bg-muted rounded mt-1 animate-pulse" />
                </div>
              </div>
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
            </div>
          ))}
        </div>
      )}

      {/* 分类区块 */}
      {categoryGroups.map((group) => {
        const section = sections[group.id];
        if (!section) return null;
        return (
          <CategorySection
            key={group.id}
            title={group.name}
            description={group.description}
            posts={section.posts}
            loading={section.loading}
            error={section.error}
            link={group.tag ? `/?tag=${encodeURIComponent(group.tag)}` : "/"}
            onRetry={() => loadSection(group.id, group.tag)}
          />
        );
      })}

      {/* 无限滚动更多文章 */}
      {!allLoading && morePosts.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold tracking-tight">发现更多</h2>
              <p className="text-sm text-muted-foreground mt-0.5">探索更多精彩内容</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {morePosts.map((post) => (
              <PostCard key={post._id} post={post} variant="compact" />
            ))}
          </div>
        </section>
      )}

      {/* 底部哨兵 */}
      <div ref={loadMoreRef} className="flex justify-center py-10">
        {loadingMore && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">加载更多...</span>
          </div>
        )}
        {!hasMore && morePosts.length > 0 && (
          <span className="text-sm text-muted-foreground/60">— 已经到底了 —</span>
        )}
      </div>
    </div>
  );
}
