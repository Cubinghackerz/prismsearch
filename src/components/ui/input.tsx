
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-orange-500/30 bg-orange-900/20 px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-orange-400/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-inter text-orange-100 transition-all duration-300 shadow-inner shadow-orange-950/10",
          // Enhanced hover state with smoother transition and refined colors
          "hover:border-orange-500/60 hover:bg-orange-900/30",
          // Improved focus state with refined glow effect
          "relative focus-visible:shadow-[0_0_0_1px_rgba(255,158,44,0.35),0_0_12px_rgba(255,158,44,0.25)]",
          // Added pulse effect on focus for better visibility
          "focus-visible:animate-pulse-glow",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
