
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-inter button-ripple",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-b from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white shadow-lg shadow-orange-600/15 hover:shadow-orange-600/25 border border-orange-500/30",
        destructive: "bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white shadow-lg shadow-red-600/15 hover:shadow-red-600/25 border border-red-500/30",
        outline: "border border-orange-500/40 bg-transparent hover:bg-orange-500/10 text-orange-100 shadow-lg shadow-orange-600/5 hover:shadow-orange-600/10",
        secondary: "bg-gradient-to-b from-teal-600 to-teal-800 hover:from-teal-500 hover:to-teal-700 text-white shadow-lg shadow-teal-600/15 hover:shadow-teal-600/25 border border-teal-500/30",
        ghost: "hover:bg-orange-500/15 text-orange-100 hover:text-orange-50",
        link: "text-orange-400 underline-offset-4 hover:underline hover:text-orange-300",
        gradient: "bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 border-none",
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
    
    // Handle ripple effect
    const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (props.disabled) return;
      
      const button = event.currentTarget;
      const circle = document.createElement("span");
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;
      
      const rect = button.getBoundingClientRect();
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${event.clientX - rect.left - radius}px`;
      circle.style.top = `${event.clientY - rect.top - radius}px`;
      
      circle.classList.add("ripple-effect");
      
      const ripple = button.getElementsByClassName("ripple-effect")[0];
      if (ripple) {
        ripple.remove();
      }
      
      button.appendChild(circle);
      
      // Clean up after animation
      setTimeout(() => {
        if (circle && circle.parentNode === button) {
          button.removeChild(circle);
        }
      }, 600);
    };
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={(e) => {
          createRipple(e);
          if (props.onClick) props.onClick(e);
        }}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
