import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/25 backdrop-blur-xl",
        className
      )}
      {...props}
    />
  );
}
