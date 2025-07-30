import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'primary' | 'secondary' | 'muted';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  variant = 'primary'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const variantClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary-foreground',
    muted: 'border-muted-foreground'
  };

  return (
    <div className="flex items-center justify-center loading-pulse">
      <div 
        className={cn(
          'animate-spin rounded-full border-2 border-transparent border-t-current',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
      />
    </div>
  );
};

interface LoadingCardProps {
  title?: string;
  description?: string;
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({ 
  title = 'Caricamento...',
  description = 'Stiamo preparando i tuoi dati',
  className 
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 space-y-4 bg-card rounded-lg shadow-elegant',
      className
    )}>
      <LoadingSpinner size="lg" />
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  message = 'Caricamento in corso...' 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center modal-backdrop">
      <div className="bg-card p-8 rounded-lg shadow-floating modal-content">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-lg font-medium text-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
};