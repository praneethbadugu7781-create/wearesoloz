import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-32 w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-soloz-ember focus:ring-2 focus:ring-soloz-ember/25",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
