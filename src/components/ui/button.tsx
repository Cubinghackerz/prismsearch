
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-inter relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white shadow-lg shadow-orange-600/10 hover:shadow-orange-600/20 border border-orange-500/30 hover:border-orange-500/50 active:translate-y-0.5 active:shadow-sm",
        destructive: "bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white shadow-lg shadow-red-600/10 hover:shadow-red-600/20 border border-red-500/30 hover:border-red-500/50 active:translate-y-0.5 active:shadow-sm",
        outline: "border border-orange-500/30 bg-transparent hover:bg-orange-500/10 text-orange-100 hover:border-orange-500/50 active:bg-orange-500/20 active:translate-y-0.5",
        secondary: "bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-500 hover:to-teal-700 text-white shadow-lg shadow-teal-600/10 hover:shadow-teal-600/20 border border-teal-500/30 hover:border-teal-500/50 active:translate-y-0.5 active:shadow-sm",
        ghost: "hover:bg-orange-500/10 text-orange-100 hover:text-orange-50 active:bg-orange-500/20 active:translate-y-0.5",
        link: "text-orange-400 underline-offset-4 hover:underline hover:text-orange-300 after:content-[''] after:block after:w-full after:scale-x-0 after:h-0.5 after:bg-orange-300/50 after:transition-transform hover:after:scale-x-100",
        gradient: "bg-gradient-to-r from-orange-400 via-orange-500 to-teal-400 hover:from-orange-500 hover:via-orange-600 hover:to-teal-500 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 border-none active:translate-y-0.5 active:shadow-sm",
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
