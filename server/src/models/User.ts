// ===== User Model — 用户数据模型 =====
// 密码通过 Mongoose pre-save 钩子自动 bcrypt 哈希 (12 轮 salt)
// 提供 comparePassword 实例方法

import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  avatar: string;
  bio: string;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, "用户名不能为空"],
    unique: true,                          // 用户名唯一索引
    trim: true,                            // 自动去首尾空格
    minlength: [2, "用户名至少 2 个字符"],
    maxlength: [20, "用户名最多 20 个字符"],
  },
  email: {
    type: String,
    required: [true, "邮箱不能为空"],
    unique: true,                          // 邮箱唯一索引
    lowercase: true,                       // 自动转小写
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "邮箱格式不正确"],
  },
  password: {
    type: String,
    required: [true, "密码不能为空"],
    minlength: [6, "密码至少 6 个字符"],
    select: false,                         // 查询时默认不返回密码字段
  },
  avatar: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
    maxlength: [200, "个人简介最多 200 个字符"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ===== 保存前自动哈希密码 =====
UserSchema.pre("save", async function (next) {
  // 仅当密码被修改时才重新哈希 (防止重复哈希)
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);          // 12 轮 salt
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ===== 比较密码实例方法 =====
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);
