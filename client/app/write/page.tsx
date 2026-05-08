"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth";
import { createPost } from "@/lib/mock-api";
import { X, Upload, Image, Video, File } from "lucide-react";

export default function WritePage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">写文章</h1>
          <p className="text-muted-foreground mb-8">请先登录后再发布文章</p>
          <Link href="/login">
            <Button>去登录</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim();
      if (!tags.includes(tag) && tags.length < 5) {
        setTags([...tags, tag]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    try {
      setSubmitting(true);
      setError("");
      const { post } = await createPost({
        title: title.trim(),
        content,
        tags,
        coverImage,
      });
      router.push(`/post/${post._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "文章发布失败");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMockUpload = () => {
    setCoverImage("/placeholder-cover.jpg");
    alert("Mock 模式：文件上传功能将在接入后端后可用\n\n已设置占位封面图");
  };

  return (
    <div className="px-4 sm:px-6 py-6">
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">发布文章</CardTitle>
        </CardHeader>

        <CardContent>
          {/* 双栏布局 */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 左栏：标题 + 标签 + 正文 */}
            <div className="flex-1 space-y-5">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  文章标题
                </label>
                <Input
                  id="title"
                  placeholder="输入文章标题..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="tags" className="text-sm font-medium">
                  标签{" "}
                  <span className="text-muted-foreground font-normal">
                    （回车添加，最多5个）
                  </span>
                </label>
                <Input
                  id="tags"
                  placeholder="输入标签后按回车..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  disabled={tags.length >= 5}
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  文章内容{" "}
                  <span className="text-muted-foreground font-normal">
                    （支持 Markdown）
                  </span>
                </label>
                <Textarea
                  id="content"
                  placeholder="开始写作...（支持 Markdown 语法）"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={18}
                  className="font-mono text-sm resize-y"
                />
                <p className="text-xs text-muted-foreground">
                  文章内容不会自动保存，请确认后再发布
                </p>
              </div>
            </div>

            {/* 右栏：封面图上传 + 发布按钮 */}
            <div className="lg:w-72 space-y-5">
              <div className="lg:sticky lg:top-20 space-y-5">
                {/* 封面图上传区 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">封面图片</label>
                  <div
                    className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={handleMockUpload}
                  >
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      拖拽或点击上传封面图片
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      支持 JPG, PNG, WebP, 最大 5MB
                    </p>
                    <Button variant="outline" size="sm" className="mt-3" type="button">
                      选择文件
                    </Button>
                  </div>

                  {coverImage && (
                    <div className="aspect-video rounded-md bg-muted flex items-center justify-center mt-2 overflow-hidden relative">
                      <img
                        src={coverImage}
                        alt="封面预览"
                        className="w-full h-full object-cover"
                      />
                      <button
                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive/80 text-white flex items-center justify-center"
                        onClick={() => setCoverImage("")}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {/* 文件类型图标 */}
                  <div className="flex gap-3 justify-center mt-3">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Image className="h-5 w-5" />
                      <span className="text-[10px]">图片</span>
                    </div>
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Video className="h-5 w-5" />
                      <span className="text-[10px]">视频</span>
                    </div>
                    <div className="flex flex-col items-center text-muted-foreground">
                      <File className="h-5 w-5" />
                      <span className="text-[10px]">文件</span>
                    </div>
                  </div>
                </div>

                {/* 错误提示 */}
                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    {error}
                  </p>
                )}

                {/* 操作按钮 */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={!title.trim() || !content.trim() || submitting}
                    className="w-full"
                  >
                    {submitting ? "发布中..." : "发布文章"}
                  </Button>
                  <Link href="/">
                    <Button variant="outline" className="w-full">
                      取消
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
