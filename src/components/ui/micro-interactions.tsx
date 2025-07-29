import * as React from "react"
import { cn } from "@/lib/utils"

// Hook per gestire le micro-interazioni
export const useMicroInteractions = () => {
  const [isPressed, setIsPressed] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)

  const handleMouseDown = () => setIsPressed(true)
  const handleMouseUp = () => setIsPressed(false)
  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setIsHovered(false)
    setIsPressed(false)
  }
  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  const interactionProps = {
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur
  }

  const interactionStates = {
    isPressed,
    isHovered,
    isFocused
  }

  return { interactionProps, interactionStates }
}

// Componente wrapper per micro-interazioni
interface MicroInteractionWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  type?: 'button' | 'card' | 'input' | 'nav'
  disabled?: boolean
  loading?: boolean
  success?: boolean
  error?: boolean
}

export const MicroInteractionWrapper = React.forwardRef<HTMLDivElement, MicroInteractionWrapperProps>(
  ({ children, type = 'button', disabled = false, loading = false, success = false, error = false, className, ...props }, ref) => {
    const { interactionProps, interactionStates } = useMicroInteractions()
    const { isPressed, isHovered, isFocused } = interactionStates

    const getTypeClasses = () => {
      switch (type) {
        case 'button':
          return cn(
            "transition-all duration-200",
            !disabled && [
              "hover:scale-105 hover:shadow-glow",
              "active:scale-95",
              "focus:ring-2 focus:ring-primary/50"
            ]
          )
        case 'card':
          return cn(
            "transition-all duration-300",
            !disabled && [
              "hover:animate-card-lift hover:shadow-floating",
              "active:scale-95",
              "focus:ring-2 focus:ring-primary/50"
            ]
          )
        case 'input':
          return cn(
            "transition-all duration-200",
            !disabled && [
              "hover:border-primary/50",
              "focus:scale-[1.02] focus:shadow-floating"
            ]
          )
        case 'nav':
          return cn(
            "transition-all duration-200",
            !disabled && [
              "hover:scale-105 hover:shadow-soft",
              "active:scale-95"
            ]
          )
        default:
          return "transition-all duration-200"
      }
    }

    const getStateClasses = () => {
      return cn(
        // Loading state
        loading && "animate-loading-shimmer cursor-wait",
        
        // Success state
        success && "animate-success-bounce border-success/50 bg-success/5",
        
        // Error state
        error && "animate-error-vibrate border-destructive/50 bg-destructive/5",
        
        // Disabled state
        disabled && "opacity-50 cursor-not-allowed",
        
        // Interactive states
        !disabled && [
          isHovered && "shadow-glow",
          isPressed && "scale-95",
          isFocused && "ring-2 ring-primary/50"
        ]
      )
    }

    return (
      <div
        ref={ref}
        className={cn(getTypeClasses(), getStateClasses(), className)}
        {...interactionProps}
        {...props}
      >
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none rounded-lg" />
        )}
        
        {children}
      </div>
    )
  }
)
MicroInteractionWrapper.displayName = "MicroInteractionWrapper"

// Utility component per feedback tattile
interface TactileFeedbackProps {
  children: React.ReactNode
  type?: 'ripple' | 'glow' | 'bounce' | 'shimmer'
  trigger?: 'hover' | 'click' | 'focus'
  intensity?: 'subtle' | 'medium' | 'strong'
}

export const TactileFeedback: React.FC<TactileFeedbackProps> = ({ 
  children, 
  type = 'ripple', 
  trigger = 'click',
  intensity = 'medium' 
}) => {
  const [isTriggered, setIsTriggered] = React.useState(false)

  const handleTrigger = () => {
    setIsTriggered(true)
    setTimeout(() => setIsTriggered(false), 600)
  }

  const getAnimationClass = () => {
    if (!isTriggered) return ""
    
    switch (type) {
      case 'ripple':
        return "animate-ripple"
      case 'glow':
        return "animate-glow"
      case 'bounce':
        return "animate-bounce-gentle"
      case 'shimmer':
        return "animate-shimmer"
      default:
        return "animate-ripple"
    }
  }

  const triggerProps = {
    ...(trigger === 'hover' && { onMouseEnter: handleTrigger }),
    ...(trigger === 'click' && { onClick: handleTrigger }),
    ...(trigger === 'focus' && { onFocus: handleTrigger })
  }

  return (
    <div className="relative overflow-hidden" {...triggerProps}>
      {children}
      {isTriggered && (
        <div 
          className={cn(
            "absolute inset-0 pointer-events-none",
            type === 'ripple' && "bg-primary/20 rounded-full",
            type === 'glow' && "bg-primary/10",
            getAnimationClass()
          )}
        />
      )}
    </div>
  )
}

// Hook per animazioni staggered
export const useStaggeredAnimation = (itemCount: number, delay: number = 100) => {
  const [animatedItems, setAnimatedItems] = React.useState<Set<number>>(new Set())

  React.useEffect(() => {
    const timeouts: NodeJS.Timeout[] = []
    
    for (let i = 0; i < itemCount; i++) {
      const timeout = setTimeout(() => {
        setAnimatedItems(prev => new Set([...prev, i]))
      }, i * delay)
      
      timeouts.push(timeout)
    }

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [itemCount, delay])

  const getItemProps = (index: number) => ({
    className: cn(
      "transition-all duration-300",
      animatedItems.has(index) 
        ? "animate-fade-in opacity-100 transform translate-y-0" 
        : "opacity-0 transform translate-y-4"
    ),
    style: {
      animationDelay: `${index * delay}ms`
    }
  })

  return { getItemProps, animatedItems }
}

export default {
  MicroInteractionWrapper,
  TactileFeedback,
  useMicroInteractions,
  useStaggeredAnimation
}