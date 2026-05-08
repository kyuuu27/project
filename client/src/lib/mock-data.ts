// ===== Mock 数据中心 — 模拟后端数据库 =====
// 数据在浏览器会话中保持（刷新页面后重置为初始状态）
// 切换真实后端时，删除本文件并用 api.ts 替换所有 import 路径即可

// ==================== 类型定义 ====================

export interface MockUser {
  _id: string;
  username: string;
  email: string;
  password: string;  // 明文存储，仅 mock 使用 (真实后端用 bcrypt 哈希)
  avatar: string;
  bio: string;
  createdAt: string;
}

export interface MockPost {
  _id: string;
  title: string;
  content: string;    // Markdown 正文
  author: string;     // userId
  tags: string[];
  coverImage: string;
  likes: string[];    // userId[] — 点赞用户 ID 数组
  views: number;      // 阅读量
  createdAt: string;
  updatedAt: string;
}

export interface MockComment {
  _id: string;
  content: string;
  author: string;     // userId
  post: string;       // postId — 所属文章
  createdAt: string;
}

// ==================== ID 生成工具 ====================

let uid = 0;
function nextId(prefix = ""): string {
  return prefix + ++uid + "_" + Date.now();
}

// ==================== 种子数据 ====================

// ==================== 热搜关键词 ====================

export const hotSearchTerms: string[] = [
  "TypeScript 5.5 新特性",
  "Next.js 14 最佳实践",
  "React Server Components",
  "MongoDB 索引优化",
  "Monorepo 架构",
  "Node.js 流式处理",
  "Tailwind CSS 技巧",
  "Docker 部署方案",
  "CI/CD 流水线",
  "Prisma ORM 实战",
];

// ==================== 分类配置 ====================

export interface CategoryGroup {
  id: string;
  name: string;
  tag: string;
  description: string;
}

export const categoryGroups: CategoryGroup[] = [
  { id: "hot-blog", name: "热门博客", tag: "", description: "最受关注的技术文章" },
  { id: "frontend", name: "前端开发", tag: "前端", description: "React, Vue, TypeScript" },
  { id: "backend", name: "后端开发", tag: "后端", description: "Node.js, 数据库, 架构" },
  { id: "fullstack", name: "全栈实践", tag: "全栈", description: "前后端贯通" },
  { id: "engineering", name: "工程化", tag: "工程化", description: "构建工具, 规范, CI/CD" },
];

// ==================== 种子数据 ====================

// 预设用户 (所有密码均为 "123456")
export const mockUsers: MockUser[] = [
  {
    _id: "u1",
    username: "前端架构师",
    email: "arch@codeblog.com",
    password: "123456",
    avatar: "",
    bio: "10 年前端开发经验，专注 TypeScript 和 React 生态",
    createdAt: "2025-01-15T10:30:00Z",
  },
  {
    _id: "u2",
    username: "全栈小王子",
    email: "fullstack@codeblog.com",
    password: "123456",
    avatar: "",
    bio: "全栈开发者，热爱 Node.js 和 Next.js",
    createdAt: "2025-02-20T08:15:00Z",
  },
  {
    _id: "u3",
    username: "后端老司机",
    email: "backend@codeblog.com",
    password: "123456",
    avatar: "",
    bio: "专注后端架构和数据库优化",
    createdAt: "2025-03-10T14:00:00Z",
  },
];

// 预设文章 (Markdown 内容为完整的中文技术文章)
export const mockPosts: MockPost[] = [
  {
    _id: "p1",
    title: "TypeScript 5.5 新特性全面解析",
    content: `## 引言\n\nTypeScript 5.5 于近期正式发布，带来了诸多令人兴奋的新特性。本文将深入解析其中最值得关注的更新。\n\n## 1. 推断类型谓词 (Inferred Type Predicates)\n\n这是本次更新最大的亮点之一。在之前的版本中，TypeScript 无法为 \`filter\` 等数组方法自动推断类型守卫。\n\n\`\`\`typescript\n// TypeScript 5.5 之前：需要手动标注\nconst nums = [1, 2, undefined, 4, 5];\nconst filtered = nums.filter(n => n !== undefined);\n// 类型: (number | undefined)[]  ← 无法收窄\n\n// TypeScript 5.5：自动推断类型谓词\nconst filtered2 = nums.filter(n => n !== undefined);\n// 类型: number[]  ← 自动收窄！\n\`\`\`\n\n## 2. 控制流收窄的改进\n\n对常量索引访问的控制流收窄也得到了显著增强：\n\n\`\`\`typescript\ninterface Cat {\n  kind: "cat";\n  meow(): void;\n}\n\ninterface Dog {\n  kind: "dog";\n  bark(): void;\n}\n\nfunction makeSound(animal: Cat | Dog) {\n  if (animal.kind === "cat") {\n    animal.meow(); // ✅ 正确收窄为 Cat\n  } else {\n    animal.bark(); // ✅ 正确收窄为 Dog\n  }\n}\n\`\`\`\n\n## 总结\n\nTypeScript 5.5 虽然没有大版本号的跨越感，但每一项改进都着眼于开发体验的提升。`,
    author: "u1",
    tags: ["TypeScript", "JavaScript", "前端"],
    coverImage: "",
    likes: ["u1", "u2", "u3"],
    views: 1280,
    createdAt: "2025-04-15T10:30:00Z",
    updatedAt: "2025-04-15T10:30:00Z",
  },
  {
    _id: "p2",
    title: "Next.js 14 App Router 最佳实践",
    content: `## 引言\n\n本文总结了在生产环境中使用 Next.js 14 App Router 的经验，涵盖路由设计、数据获取、性能优化等关键主题。\n\n## 1. 路由分组策略\n\n使用路由分组 \`(group)\` 来组织相关页面，同时不影响 URL 路径：\n\n\`\`\`\napp/\n├── (marketing)/\n│   ├── page.tsx        # /\n│   └── about/page.tsx   # /about\n├── (dashboard)/\n│   ├── layout.tsx\n│   └── settings/page.tsx # /settings\n└── layout.tsx\n\`\`\`\n\n## 2. 服务端组件优先\n\n默认使用 Server Components，只在需要交互时使用 Client Components。\n\n## 3. Streaming SSR\n\n使用 \`loading.tsx\` 和 \`Suspense\` 实现流式渲染，提升首屏加载体验。`,
    author: "u2",
    tags: ["Next.js", "React", "全栈"],
    coverImage: "",
    likes: ["u1", "u2"],
    views: 956,
    createdAt: "2025-04-12T08:15:00Z",
    updatedAt: "2025-04-12T08:15:00Z",
  },
  {
    _id: "p3",
    title: "MongoDB 索引优化实战指南",
    content: `## 引言\n\n索引是 MongoDB 性能优化的核心，本文从实际案例出发，分享索引设计和优化的最佳实践。\n\n## 1. ESR 规则\n\n创建复合索引时，遵循 **E**quality → **S**ort → **R**ange 的顺序：\n\n\`\`\`javascript\n// ✅ 正确的索引顺序\ndb.orders.createIndex({ status: 1, createdAt: -1, amount: 1 });\n// status: 等值查询\n// createdAt: 排序\n// amount: 范围查询\n\`\`\`\n\n## 2. 覆盖索引\n\n当查询只需要索引中的字段时，MongoDB 可以直接从索引返回结果，无需访问文档。\n\n## 3. 索引分析工具\n\n使用 \`explain()\` 分析查询执行计划，识别全表扫描。`,
    author: "u3",
    tags: ["MongoDB", "数据库", "后端"],
    coverImage: "",
    likes: ["u1", "u3"],
    views: 723,
    createdAt: "2025-04-10T14:00:00Z",
    updatedAt: "2025-04-10T14:00:00Z",
  },
  {
    _id: "p4",
    title: "从零搭建 Monorepo 项目架构",
    content: `## 引言\n\nMonorepo 已成为大中型项目的标配，本文将带你从零搭建一个基于 pnpm workspace 的 Monorepo 架构。\n\n## 1. 项目结构\n\n\`\`\`\nmy-project/\n├── package.json        # root workspace\n├── pnpm-workspace.yaml\n├── packages/\n│   ├── shared/         # 共享类型和工具\n│   ├── ui/             # UI 组件库\n│   └── config/         # eslint/tsconfig 共享配置\n├── apps/\n│   ├── web/            # 前端应用\n│   └── api/            # 后端服务\n└── turbo.json          # Turborepo 配置\n\`\`\`\n\n## 2. 依赖管理\n\n使用 \`pnpm\` 的 workspace 协议管理内部依赖，避免版本冲突。\n\n## 3. 构建优化\n\n配合 Turborepo 实现并行构建和缓存，大幅提升 CI/CD 效率。`,
    author: "u1",
    tags: ["工程化", "架构", "前端"],
    coverImage: "",
    likes: ["u1", "u2", "u3"],
    views: 2105,
    createdAt: "2025-04-08T16:45:00Z",
    updatedAt: "2025-04-08T16:45:00Z",
  },
  {
    _id: "p5",
    title: "React Server Components 深入理解",
    content: `## 引言\n\nRSC (React Server Components) 重新定义了 React 的渲染模式。理解其原理对构建高性能 React 应用至关重要。\n\n## 1. Server vs Client Components\n\n| 特性 | Server Component | Client Component |\n|------|-----------------|------------------|\n| 渲染位置 | 服务端 | 浏览器 |\n| 交互性 | ❌ | ✅ |\n| 数据获取 | 直接查询 DB | 通过 API |\n| Bundle 大小 | 0 KB | 包含完整代码 |\n\n## 2. \`use client\` 边界\n\n\`use client\` 指令标记的是客户端边界，而非严格的服务端/客户端分界线。\n\n## 3. 组合模式\n\n将 Client Component 作为 Server Component 的 children 传递，保持大部分代码在服务端运行。`,
    author: "u1",
    tags: ["React", "RSC", "前端"],
    coverImage: "",
    likes: ["u1", "u2"],
    views: 1678,
    createdAt: "2025-04-05T09:20:00Z",
    updatedAt: "2025-04-05T09:20:00Z",
  },
  {
    _id: "p6",
    title: "Node.js 流式处理大文件方案",
    content: `## 引言\n\n处理 GB 级别的大文件时，流式处理是唯一可行的方案。本文分享 Node.js 中流式处理的最佳实践。\n\n## 1. 为什么用 Stream\n\n\`\`\`javascript\n// ❌ 糟糕：将整个文件加载到内存\nconst data = await fs.readFile('huge-file.csv');\n// 内存爆炸！\n\n// ✅ 正确：流式读取\nconst stream = fs.createReadStream('huge-file.csv');\nstream.pipe(processLineByLine());\n\`\`\`\n\n## 2. Transform Stream\n\n使用 \`Transform\` 流在数据传输过程中进行转换处理。\n\n## 3. 背压处理\n\n理解 \`pipe()\` 和 \`pipeline()\` 的背压机制，避免内存泄漏。`,
    author: "u3",
    tags: ["Node.js", "后端", "性能优化"],
    coverImage: "",
    likes: ["u1", "u2", "u3"],
    views: 534,
    createdAt: "2025-04-01T11:00:00Z",
    updatedAt: "2025-04-01T11:00:00Z",
  },
  {
    _id: "p7",
    title: "Tailwind CSS v4 新特性抢先看",
    content: `## 引言\n\nTailwind CSS v4 带来了全新的配置方式和性能提升，本文带你一探究竟。\n\n## 1. CSS-first 配置\n\nv4 最大的变化是采用 CSS-first 配置方式，不再需要 tailwind.config.js。\n\n## 2. 性能飞跃\n\n新版本构建速度提升 5 倍以上，开发体验大幅改善。\n\n## 3. 新颜色系统\n\n引入了更丰富的调色板和动态色彩生成能力。`,
    author: "u1",
    tags: ["Tailwind CSS", "前端"],
    coverImage: "",
    likes: ["u1", "u2"],
    views: 892,
    createdAt: "2025-03-28T10:00:00Z",
    updatedAt: "2025-03-28T10:00:00Z",
  },
  {
    _id: "p8",
    title: "Docker Compose 微服务编排实战",
    content: `## 引言\n\n本文深入讲解如何使用 Docker Compose 编排微服务架构应用。\n\n## 1. 多服务编排\n\n一个完整的 compose 文件涵盖 Web、API、数据库、缓存等组件。\n\n## 2. 网络和卷管理\n\n正确配置网络隔离和数据持久化方案。\n\n## 3. 健康检查\n\n为每个服务配置 healthcheck 确保启动顺序正确。`,
    author: "u2",
    tags: ["Docker", "后端", "架构"],
    coverImage: "",
    likes: ["u1", "u3"],
    views: 671,
    createdAt: "2025-03-25T14:30:00Z",
    updatedAt: "2025-03-25T14:30:00Z",
  },
  {
    _id: "p9",
    title: "React 19 编译器自动记忆化解析",
    content: `## 引言\n\nReact 19 引入了新的编译器，可以自动处理 useMemo 和 useCallback。\n\n## 1. 编译器工作原理\n\nReact Compiler 在构建时分析组件状态依赖图。\n\n## 2. 告别手动优化\n\n不再需要手动添加 useMemo 和 useCallback 包裹。\n\n## 3. 迁移策略\n\n如何在现有项目中逐步启用 React Compiler。`,
    author: "u1",
    tags: ["React", "前端"],
    coverImage: "",
    likes: ["u1", "u2", "u3"],
    views: 1532,
    createdAt: "2025-03-20T09:15:00Z",
    updatedAt: "2025-03-20T09:15:00Z",
  },
  {
    _id: "p10",
    title: "Git 工作流最佳实践：从分支策略到提交规范",
    content: `## 引言\n\n一个团队的 Git 工作流直接影响协作效率和代码质量。\n\n## 1. Git Flow vs Trunk-Based\n\n不同团队规模选择不同的分支策略。\n\n## 2. Conventional Commits\n\n采用约定式提交让 CHANGELOG 自动化生成。\n\n## 3. Code Review 流程\n\nPR 大小控制在 400 行以内，Review 效率最高。`,
    author: "u3",
    tags: ["工程化", "Git"],
    coverImage: "",
    likes: ["u2", "u3"],
    views: 445,
    createdAt: "2025-03-15T16:00:00Z",
    updatedAt: "2025-03-15T16:00:00Z",
  },
  {
    _id: "p11",
    title: "Prisma ORM 性能调优指南",
    content: `## 引言\n\nPrisma 让数据库操作变得简单优雅，但不当使用可能导致性能瓶颈。\n\n## 1. N+1 问题排查\n\n使用 Prisma 的数据加载器避免关联查询性能陷阱。\n\n## 2. 原生查询\n\n在复杂场景下合理使用 raw queries 获取最佳性能。\n\n## 3. 连接池管理\n\n合理配置连接池大小，避免连接数耗尽。`,
    author: "u2",
    tags: ["Prisma", "数据库", "后端"],
    coverImage: "",
    likes: ["u1"],
    views: 398,
    createdAt: "2025-03-10T11:30:00Z",
    updatedAt: "2025-03-10T11:30:00Z",
  },
  {
    _id: "p12",
    title: "前端性能优化之图片加载策略",
    content: `## 引言\n\n图片加载对前端性能影响巨大，合理的策略可将 LCP 降低 50% 以上。\n\n## 1. 响应式图片\n\n使用 srcset 和 picture 元素适配不同分辨率。\n\n## 2. 懒加载\n\n通过 loading=\"lazy\" 和 Intersection Observer 延迟非关键图片。\n\n## 3. 现代格式\n\n使用 WebP/AVIF 并配置 CDN 自动转码。`,
    author: "u1",
    tags: ["前端", "性能优化"],
    coverImage: "",
    likes: ["u1", "u2", "u3"],
    views: 1102,
    createdAt: "2025-03-05T08:45:00Z",
    updatedAt: "2025-03-05T08:45:00Z",
  },
];

// 预设评论
export const mockComments: MockComment[] = [
  {
    _id: "c1",
    content: "非常详细的解析！推断类型谓词这个特性太实用了，终于不用手动类型断言了。",
    author: "u2",
    post: "p1",
    createdAt: "2025-04-15T14:20:00Z",
  },
  {
    _id: "c2",
    content: "请教一下，升级到 5.5 后之前的类型体操代码需要大规模修改吗？",
    author: "u3",
    post: "p1",
    createdAt: "2025-04-16T09:10:00Z",
  },
  {
    _id: "c3",
    content: "App Router 确实比 Pages Router 好很多，特别是布局嵌套这块。",
    author: "u1",
    post: "p2",
    createdAt: "2025-04-12T16:45:00Z",
  },
  {
    _id: "c4",
    content: "ESR 规则总结得很到位，之前建索引都是凭感觉来的。",
    author: "u2",
    post: "p3",
    createdAt: "2025-04-11T10:30:00Z",
  },
  {
    _id: "c5",
    content: "Monorepo 确实是大项目的标配，Turborepo 比 Nx 轻量很多。",
    author: "u2",
    post: "p4",
    createdAt: "2025-04-09T14:00:00Z",
  },
  {
    _id: "c6",
    content: "RSC 的概念一开始确实有点绕，看了这篇文章清楚多了。",
    author: "u3",
    post: "p5",
    createdAt: "2025-04-06T08:20:00Z",
  },
];

// ==================== 工具函数 ====================

/** 模拟网络延迟 (300~500ms 随机)，让 UI 的加载态有展示机会 */
export function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms + Math.random() * 200));
}

/** 根据 ID 查找用户，返回时去除 password 字段 (安全) */
export function findUserById(id: string): (Omit<MockUser, "password"> & { _id: string }) | null {
  const u = mockUsers.find((u) => u._id === id);
  if (!u) return null;
  const { password, ...safe } = u;
  return safe;
}

/** 根据邮箱查找用户，包含 password (用于登录验证) */
export function findUserByEmail(email: string): MockUser | undefined {
  return mockUsers.find((u) => u.email === email);
}
