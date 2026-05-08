// ===== Separator — 分隔线组件 (shadcn/ui) =====
// 支持水平/垂直两种方向
// horizontal：1px 高全宽线
// vertical：1px 宽全高线

import * as React from "react";
import { cn } from "@/lib/utils";

const Separator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
    <div
      ref={ref}
      role={decorative ? "none" : undefined}  // decorative=true 时对屏幕阅读器隐藏
      aria-orientation={orientation === "horizontal" ? undefined : orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = "Separator";

export { Separator };
