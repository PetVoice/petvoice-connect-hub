import React, { Suspense } from 'react';
import { LazyExoticComponent, ComponentType, ReactNode } from 'react';
import { SkeletonLoader } from './skeleton-loader';
import { Button } from './button';
import { Alert, AlertDescription } from './alert';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface LazyWrapperProps {
  /** Lazy component to render */
  Component?: LazyExoticComponent<ComponentType<any>>;
  /** Props to pass to the lazy component */
  componentProps?: Record<string, any>;
  /** Fallback type during loading */
  fallbackType?: 'skeleton' | 'spinner' | 'custom';
  /** Custom fallback component */
  customFallback?: ReactNode;
  /** Skeleton variant if using skeleton fallback */
  skeletonVariant?: 'card' | 'list' | 'text' | 'header';
  /** Error state */
  hasError?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Retry function */
  onRetry?: () => void;
  /** Can retry flag */
  canRetry?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Container className */
  className?: string;
}

// Error Boundary component
class LazyErrorBoundary extends React.Component<
  { children: ReactNode; onError: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; onError: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return null; // Let parent handle error display
    }

    return this.props.children;
  }
}

// Loading fallbacks
const LoadingFallbacks = {
  skeleton: (variant: string = 'card') => (
    <div className="p-6">
      <SkeletonLoader 
        variant={variant as any} 
        lines={variant === 'list' ? 5 : 3}
        animate="shimmer"
      />
    </div>
  ),
  
  spinner: () => (
    <div className="flex items-center justify-center p-12">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Caricamento componente...</p>
      </div>
    </div>
  ),
  
  custom: (fallback: ReactNode) => fallback
};

// Error fallback
const ErrorFallback: React.FC<{
  onRetry?: () => void;
  canRetry?: boolean;
  errorMessage?: string;
}> = ({ onRetry, canRetry, errorMessage }) => (
  <div className="p-6">
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex flex-col gap-3">
        <span>
          {errorMessage || 'Errore nel caricamento del componente. Riprova tra qualche momento.'}
        </span>
        {canRetry && onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="w-fit"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Riprova
          </Button>
        )}
      </AlertDescription>
    </Alert>
  </div>
);

const LazyWrapper: React.FC<LazyWrapperProps> = ({
  Component,
  componentProps = {},
  fallbackType = 'skeleton',
  customFallback,
  skeletonVariant = 'card',
  hasError = false,
  isLoading = false,
  onRetry,
  canRetry = true,
  errorMessage,
  className = ''
}) => {
  // Handle error state
  if (hasError) {
    return (
      <div className={className}>
        <ErrorFallback
          onRetry={onRetry}
          canRetry={canRetry}
          errorMessage={errorMessage}
        />
      </div>
    );
  }

  // Handle loading state
  if (isLoading || !Component) {
    const fallback = fallbackType === 'custom' && customFallback
      ? LoadingFallbacks.custom(customFallback)
      : fallbackType === 'spinner'
      ? LoadingFallbacks.spinner()
      : LoadingFallbacks.skeleton(skeletonVariant);

    return <div className={className}>{fallback}</div>;
  }

  // Render component with error boundary
  return (
    <div className={className}>
      <LazyErrorBoundary onError={(error) => console.error('Component error:', error)}>
        <Suspense fallback={LoadingFallbacks[fallbackType](skeletonVariant)}>
          <Component {...componentProps} />
        </Suspense>
      </LazyErrorBoundary>
    </div>
  );
};

export { LazyWrapper };