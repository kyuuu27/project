"use client";

// ===== MarkdownRenderer — Markdown 渲染组件 =====
// 使用 react-markdown + remark-gfm (GitHub Flavored Markdown)
// 代码块使用 Prism 语法高亮 (oneDark 主题)
// 行内代码：bg-muted 背景
// 代码块：语言标签头 + 深色代码区

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";

interface Props {
  content: string;  // Markdown 字符串
}

export function MarkdownRenderer({ content }: Props) {
  return (
    // prose 类提供排版样式 (行距、标题、列表等)
    <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:scroll-m-20 prose-pre:p-0 prose-pre:bg-transparent prose-img:rounded-lg">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}  // 支持表格、删除线、任务列表等 GFM 扩展
        components={createCodeBlock} // 自定义代码渲染
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// ===== 自定义代码块渲染 =====
const createCodeBlock: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || ""); // 提取语言标记
    const codeStr = String(children).replace(/\n$/, "");

    // --- 行内代码 (没有 language-xxx 标记) ---
    if (!match) {
      return (
        <code
          className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm"
          {...props}
        >
          {children}
        </code>
      );
    }

    // --- 代码块 (有 language-xxx 标记) ---
    return (
      <div className="relative my-4">
        {/* 语言标签头 — 显示语言名称的小横条 */}
        <div className="flex items-center justify-between rounded-t-lg border border-b-0 bg-muted/50 px-4 py-2">
          <span className="text-xs font-mono text-muted-foreground">
            {match[1]}
          </span>
        </div>
        {/* Prism 语法高亮代码区 */}
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          customStyle={{
            margin: 0,
            borderRadius: "0 0 0.5rem 0.5rem",
            fontSize: "0.875rem",
          }}
        >
          {codeStr}
        </SyntaxHighlighter>
      </div>
    );
  },
  // 禁止 pre 标签的默认样式 (由上面的 code 组件完全控制)
  pre({ children }) {
    return <>{children}</>;
  },
};
