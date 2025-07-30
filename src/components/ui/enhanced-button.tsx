import * as React from "react";
import { Loader2, Check, X } from "lucide-react";
import { Button, ButtonProps } from "./button";
import { useButtonInteractions, UseButtonInteractionsProps } from "@/hooks/useButtonInteractions";
import { cn } from "@/lib/utils";

export interface EnhancedButtonProps extends Omit<ButtonProps, 'onError'>, UseButtonInteractionsProps {
  showStateIcons?: boolean;
  loadingText?: string;
  successText?: string;
  errorText?: string;
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    children, 
    className, 
    onClick,
    showStateIcons = true,
    loadingText,
    successText,
    errorText,
    onSuccess,
    onError,
    autoResetDelay,
    disabled,
    ...props 
  }, ref) => {
    const {
      state,
      ripples,
      isInteractive,
      handleClick,
      setLoading,
      setSuccess,
      setError,
      reset,
    } = useButtonInteractions({ 
      onSuccess: onSuccess || (() => {}), 
      onError: onError || (() => {}), 
      autoResetDelay 
    });

    const buttonRef = React.useRef<HTMLButtonElement>(null);

    React.useImperativeHandle(ref, () => buttonRef.current!);

    const getButtonContent = () => {
      switch (state) {
        case 'loading':
          return (
            <>
              <Loader2 className="w-4 h-4 animate-spinner" />
              {loadingText || children}
            </>
          );
        case 'success':
          return (
            <>
              {showStateIcons && <Check className="w-4 h-4" />}
              {successText || children}
            </>
          );
        case 'error':
          return (
            <>
              {showStateIcons && <X className="w-4 h-4" />}
              {errorText || children}
            </>
          );
        default:
          return children;
      }
    };

    const getStateClasses = () => {
      switch (state) {
        case 'loading':
          return 'cursor-wait';
        case 'success':
          return 'animate-button-success bg-success text-success-foreground';
        case 'error':
          return 'animate-button-error bg-destructive text-destructive-foreground';
        default:
          return '';
      }
    };

    // Espone i metodi per controllo esterno
    React.useEffect(() => {
      if (buttonRef.current) {
        (buttonRef.current as any).setLoading = setLoading;
        (buttonRef.current as any).setSuccess = setSuccess;
        (buttonRef.current as any).setError = setError;
        (buttonRef.current as any).reset = reset;
      }
    }, [setLoading, setSuccess, setError, reset]);

    return (
      <Button
        ref={buttonRef}
        className={cn(
          "relative overflow-hidden",
          "active:animate-button-press",
          "transition-all duration-200",
          getStateClasses(),
          className
        )}
        onClick={(e) => handleClick(e, onClick)}
        disabled={disabled || !isInteractive}
        {...props}
      >
        {/* Ripple Effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
          />
        ))}
        
        {/* Button Content */}
        <span className="relative z-10 flex items-center gap-2">
          {getButtonContent()}
        </span>
      </Button>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

export { EnhancedButton };