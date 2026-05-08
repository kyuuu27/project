// ===== Post Model — 文章数据模型 =====
// timestamps 自动管理 createdAt/updatedAt
// 索引：createdAt (列表排序)、tags (标签筛选)、author (按作者查询)

import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPost extends Document {
  title: string;
  content: string;         // Markdown 正文
  author: Types.ObjectId;  // 引用 User
  tags: string[];
  coverImage: string;
  likes: Types.ObjectId[]; // 点赞用户 ID 数组
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, "标题不能为空"],
      trim: true,
      minlength: [1, "标题至少 1 个字符"],
      maxlength: [100, "标题最多 100 个字符"],
    },
    content: {
      type: String,
      required: [true, "内容不能为空"],
      minlength: [1, "内容至少 1 个字符"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",               // 关联 User 集合
      required: true,
      index: true,               // 按作者查询的索引
    },
    tags: {
      type: [String],
      default: [],
    },
    coverImage: {
      type: String,
      default: "",
    },
    likes: {
      type: [Schema.Types.ObjectId],
      ref: "User",               // 关联用户
      default: [],
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,            // 自动添加 createdAt + updatedAt
  }
);

// ===== 复合索引 =====
PostSchema.index({ createdAt: -1 });  // 文章列表按时间倒序
PostSchema.index({ tags: 1 });        // 按标签筛选

export const Post = mongoose.model<IPost>("Post", PostSchema);
