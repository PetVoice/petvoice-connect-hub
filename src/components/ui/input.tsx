import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  success?: boolean
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, success, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)
    
    React.useEffect(() => {
      setHasValue(!!props.value || !!props.defaultValue)
    }, [props.value, props.defaultValue])
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      if (props.onFocus) props.onFocus(e)
    }
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(!!e.target.value)
      if (props.onBlur) props.onBlur(e)
    }
    
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            
            // Default state
            "border-input hover:border-primary/50",
            
            // Focus state with premium animations
            "focus:border-primary focus:ring-primary focus:animate-pulse-glow",
            
            // Success state
            success && "border-success/50 focus:border-success focus:ring-success bg-success/5",
            
            // Error state with shake animation
            error && "border-destructive/50 focus:border-destructive focus:ring-destructive bg-destructive/5 animate-error-vibrate",
            
            // Focused state
            isFocused && "scale-[1.02] shadow-floating",
            
            // Has value state
            hasValue && "border-primary/30",
            
            className
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {/* Success indicator */}
        {success && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-success animate-success-check">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* Error indicator */}
        {error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-destructive">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
