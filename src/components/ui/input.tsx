
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-orange-500/30 bg-orange-900/20 px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-orange-400/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-inter text-orange-100 transition-all duration-200 shadow-inner shadow-orange-950/10",
          // Added new styling for hover and focus states
          "hover:border-orange-500/50 hover:bg-orange-900/25",
          // Add shimmer effect with pseudo-elements on focus
          "relative focus-within:shadow-[0_0_0_1px_rgba(255,158,44,0.3)]",
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
