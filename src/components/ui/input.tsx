
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-prism-blue-primary/30 bg-prism-dark-bg-800/20 px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-prism-text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-prism-blue-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-inter text-prism-text-light transition-all duration-300 shadow-inner shadow-prism-dark-bg/10",
          // Enhanced states with improved readability
          "hover:border-prism-blue-primary/50 hover:bg-prism-dark-bg-800/25",
          // Improved focus state with refined glow effect and better contrast
          "relative focus-visible:shadow-[0_0_0_1px_rgba(79,70,229,0.35),0_0_8px_rgba(79,70,229,0.25)]",
          // Removed pulse animation for better readability
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
