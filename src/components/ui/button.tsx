import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:shadow-glow hover:scale-[1.02] active:scale-95 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/95 hover:to-primary/85 shadow-soft",
        destructive: "bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground hover:from-destructive/95 hover:to-destructive/85 shadow-soft",
        outline: "border-2 border-primary/30 bg-transparent hover:bg-primary/10 text-primary shadow-sm hover:border-primary/50",
        secondary: "bg-gradient-to-r from-secondary to-secondary/95 text-secondary-foreground hover:from-secondary/90 hover:to-secondary/85 shadow-sm",
        ghost: "text-primary hover:bg-primary/10 hover:text-primary/90",
        link: "text-primary hover:text-primary/80 underline-offset-4 hover:underline",
        success: "bg-gradient-to-r from-success to-success/90 text-success-foreground hover:from-success/95 hover:to-success/85 shadow-soft",
        warning: "bg-gradient-to-r from-warning to-warning/90 text-warning-foreground hover:from-warning/95 hover:to-warning/85 shadow-soft",
        premium: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-glow",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
        xl: "h-14 rounded-2xl px-10 text-lg font-bold",
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
