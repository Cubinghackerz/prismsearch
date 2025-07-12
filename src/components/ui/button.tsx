
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-inter relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-prism-primary hover:bg-prism-primary-dark text-white shadow-lg shadow-prism-primary/20 hover:shadow-prism-primary/30 border border-prism-primary/40 hover:border-prism-primary-dark/60",
        destructive: "bg-prism-danger hover:bg-prism-danger/90 text-white shadow-lg shadow-prism-danger/20 hover:shadow-prism-danger/30",
        outline: "border-2 border-prism-primary/40 bg-transparent hover:bg-prism-primary/15 text-prism-text hover:border-prism-primary/60",
        secondary: "bg-prism-accent hover:bg-prism-accent-dark text-white shadow-lg shadow-prism-accent/20 hover:shadow-prism-accent/30 border border-prism-accent/40 hover:border-prism-accent-dark/60",
        ghost: "hover:bg-prism-primary/15 text-prism-text hover:text-prism-primary",
        link: "text-prism-primary-light underline-offset-4 hover:underline hover:text-prism-accent-light",
        gradient: "bg-gradient-to-r from-prism-primary to-prism-accent hover:from-prism-primary-dark hover:to-prism-accent-dark text-white shadow-lg shadow-prism-primary/30 hover:shadow-prism-accent/50 border-none",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
