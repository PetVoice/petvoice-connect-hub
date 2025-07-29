import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 overflow-hidden group active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/95 hover:to-primary/85 shadow-soft hover:shadow-floating hover:scale-105 active:animate-button-press",
        destructive: "bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground hover:from-destructive/95 hover:to-destructive/85 shadow-soft hover:shadow-floating hover:scale-105",
        outline: "border-2 border-primary/30 bg-transparent hover:bg-primary/10 text-primary shadow-sm hover:border-primary/50 hover:scale-105 hover:shadow-glow",
        secondary: "bg-gradient-to-r from-secondary to-secondary/95 text-secondary-foreground hover:from-secondary/90 hover:to-secondary/85 shadow-sm hover:scale-105",
        ghost: "text-primary hover:bg-primary/10 hover:text-primary/90 hover:scale-105",
        link: "text-primary hover:text-primary/80 underline-offset-4 hover:underline relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full",
        success: "bg-gradient-to-r from-success to-success/90 text-success-foreground hover:from-success/95 hover:to-success/85 shadow-soft hover:shadow-floating hover:scale-105",
        warning: "bg-gradient-to-r from-warning to-warning/90 text-warning-foreground hover:from-warning/95 hover:to-warning/85 shadow-soft hover:shadow-floating hover:scale-105",
        premium: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-glow hover:animate-glow hover:scale-105",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
        xl: "h-14 rounded-2xl px-10 text-lg font-bold",
      },
      loading: {
        true: "cursor-not-allowed",
        false: "cursor-pointer"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      loading: false
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  ripple?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, ripple = false, children, ...props }, ref) => {
    const [isClicked, setIsClicked] = React.useState(false)
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading) return
      
      setIsClicked(true)
      setTimeout(() => setIsClicked(false), 200)
      
      if (props.onClick) {
        props.onClick(e)
      }
    }
    
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, loading, className }))}
        ref={ref}
        onClick={handleClick}
        disabled={loading || props.disabled}
        {...props}
      >
        {/* Ripple effect */}
        {ripple && isClicked && (
          <span className="absolute inset-0 bg-white/20 rounded-lg animate-ripple pointer-events-none" />
        )}
        
        {/* Loading shimmer effect */}
        {loading && (
          <>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-loading-shimmer" />
            <span className="opacity-0">{children}</span>
            <span className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            </span>
          </>
        )}
        
        {!loading && children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
