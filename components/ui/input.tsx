import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-soloz-ember focus:ring-2 focus:ring-soloz-ember/25",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
