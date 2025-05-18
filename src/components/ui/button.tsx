
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-inter relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-600/20 hover:shadow-orange-600/30 border border-orange-500/40 hover:border-orange-600/60 active:translate-y-0.5 active:shadow-sm",
        destructive: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 hover:shadow-red-600/30 border border-red-500/40 hover:border-red-600/60 active:translate-y-0.5 active:shadow-sm",
        outline: "border-2 border-orange-500/40 bg-transparent hover:bg-orange-500/15 text-orange-100 hover:border-orange-500/60 active:bg-orange-500/25 active:translate-y-0.5",
        secondary: "bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20 hover:shadow-teal-600/30 border border-teal-500/40 hover:border-teal-600/60 active:translate-y-0.5 active:shadow-sm",
        ghost: "hover:bg-orange-500/15 text-orange-100 hover:text-orange-50 active:bg-orange-500/25 active:translate-y-0.5",
        link: "text-orange-400 underline-offset-4 hover:underline hover:text-orange-300 after:content-[''] after:block after:w-full after:scale-x-0 after:h-0.5 after:bg-orange-300/60 after:transition-transform hover:after:scale-x-100 hover:after:transition-transform hover:after:duration-500",
        // Simplified gradient for better readability
        gradient: "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 border-none active:translate-y-0.5 active:shadow-sm",
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
