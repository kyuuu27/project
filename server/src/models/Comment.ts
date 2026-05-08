// ===== Comment Model — 评论数据模型 =====
// post 字段建索引：按文章 ID 快速查询评论

import mongoose, { Document, Schema, Types } from "mongoose";

export interface IComment extends Document {
  content: string;
  author: Types.ObjectId;   // 引用 User
  post: Types.ObjectId;     // 引用 Post
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>({
  content: {
    type: String,
    required: [true, "评论内容不能为空"],
    trim: true,
    minlength: [1, "评论至少 1 个字符"],
    maxlength: [500, "评论最多 500 个字符"],
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: true,
    index: true,              // 按文章查询评论的索引
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Comment = mongoose.model<IComment>("Comment", CommentSchema);
