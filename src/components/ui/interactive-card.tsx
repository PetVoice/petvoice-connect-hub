import * as React from "react"
import { cn } from "@/lib/utils"

interface InteractiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: 'lift' | 'glow' | 'scale' | 'float' | 'none'
  clickable?: boolean
  loading?: boolean
  success?: boolean
  error?: boolean
}

const InteractiveCard = React.forwardRef<HTMLDivElement, InteractiveCardProps>(
  ({ className, hover = 'lift', clickable = false, loading = false, success = false, error = false, children, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false)
    const [isPressed, setIsPressed] = React.useState(false)

    const getHoverClasses = () => {
      switch (hover) {
        case 'lift':
          return 'hover:animate-card-lift hover:shadow-floating'
        case 'glow':
          return 'hover:animate-glow hover:shadow-glow'
        case 'scale':
          return 'hover:scale-105 hover:shadow-floating'
        case 'float':
          return 'hover:animate-hover-lift'
        case 'none':
          return ''
        default:
          return 'hover:animate-card-lift hover:shadow-floating'
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          // Base card styles
          "rounded-lg border bg-card text-card-foreground shadow-soft transition-all duration-300",
          
          // Hover interactions
          hover !== 'none' && getHoverClasses(),
          
          // Clickable state
          clickable && "cursor-pointer active:scale-95",
          
          // Loading state
          loading && "animate-loading-shimmer cursor-wait",
          
          // Success state
          success && "border-success/50 bg-success/5 animate-success-bounce",
          
          // Error state
          error && "border-destructive/50 bg-destructive/5 animate-error-vibrate",
          
          // Interactive states
          isHovered && "shadow-floating",
          isPressed && "scale-95",
          
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        {...props}
      >
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none rounded-lg" />
        )}
        
        {/* Success indicator */}
        {success && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-success text-success-foreground rounded-full flex items-center justify-center animate-success-check">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* Error indicator */}
        {error && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {children}
      </div>
    )
  }
)
InteractiveCard.displayName = "InteractiveCard"

const InteractiveCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 transition-all duration-200", className)}
    {...props}
  />
))
InteractiveCardHeader.displayName = "InteractiveCardHeader"

const InteractiveCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight transition-all duration-200 hover:text-primary",
      className
    )}
    {...props}
  />
))
InteractiveCardTitle.displayName = "InteractiveCardTitle"

const InteractiveCardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground transition-all duration-200", className)}
    {...props}
  />
))
InteractiveCardDescription.displayName = "InteractiveCardDescription"

const InteractiveCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 transition-all duration-200", className)} {...props} />
))
InteractiveCardContent.displayName = "InteractiveCardContent"

const InteractiveCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 transition-all duration-200", className)}
    {...props}
  />
))
InteractiveCardFooter.displayName = "InteractiveCardFooter"

export {
  InteractiveCard,
  InteractiveCardHeader,
  InteractiveCardFooter,
  InteractiveCardTitle,
  InteractiveCardDescription,
  InteractiveCardContent,
}