import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface SkeletonLoaderProps {
  variant?: 'text' | 'avatar' | 'card' | 'list' | 'button' | 'header';
  lines?: number;
  width?: string | number;
  height?: string | number;
  shape?: 'rectangle' | 'circle';
  count?: number;
  className?: string;
  animate?: 'shimmer' | 'pulse';
  spacing?: 'sm' | 'md' | 'lg';
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  lines = 1,
  width,
  height,
  shape = 'rectangle',
  count = 1,
  className,
  animate = 'shimmer',
  spacing = 'md'
}) => {
  const spacingClasses = {
    sm: 'space-y-2',
    md: 'space-y-3',
    lg: 'space-y-4'
  };

  const getAnimationClass = () => {
    return animate === 'shimmer' ? 'skeleton-shimmer' : 'skeleton-pulse';
  };

  const renderSkeleton = (index: number = 0) => {
    switch (variant) {
      case 'avatar':
        return (
          <Skeleton
            key={index}
            className={cn(
              'w-10 h-10 rounded-full',
              getAnimationClass(),
              className
            )}
            style={{ width, height }}
          />
        );

      case 'button':
        return (
          <Skeleton
            key={index}
            className={cn(
              'h-10 w-20 rounded-md',
              getAnimationClass(),
              className
            )}
            style={{ width, height }}
          />
        );

      case 'header':
        return (
          <div key={index} className={cn('space-y-2', spacingClasses[spacing])}>
            <Skeleton className={cn('h-8 w-3/4', getAnimationClass())} />
            <Skeleton className={cn('h-4 w-1/2', getAnimationClass())} />
          </div>
        );

      case 'card':
        return (
          <div key={index} className={cn('space-y-3', spacingClasses[spacing])}>
            <Skeleton className={cn('h-4 w-3/4', getAnimationClass())} />
            <Skeleton className={cn('h-4 w-1/2', getAnimationClass())} />
            <Skeleton className={cn('h-20 w-full', getAnimationClass())} />
          </div>
        );

      case 'list':
        return (
          <div key={index} className={cn('space-y-2', spacingClasses[spacing])}>
            {Array.from({ length: lines }).map((_, lineIndex) => (
              <div key={lineIndex} className="flex items-center space-x-3">
                <Skeleton className={cn('h-4 w-4 rounded-full', getAnimationClass())} />
                <Skeleton className={cn('h-4 flex-1', getAnimationClass())} />
              </div>
            ))}
          </div>
        );

      case 'text':
      default:
        return (
          <div key={index} className={cn('space-y-2', spacingClasses[spacing])}>
            {Array.from({ length: lines }).map((_, lineIndex) => (
              <Skeleton
                key={lineIndex}
                className={cn(
                  'h-4',
                  lineIndex === lines - 1 ? 'w-2/3' : 'w-full',
                  shape === 'circle' ? 'rounded-full' : 'rounded',
                  getAnimationClass(),
                  className
                )}
                style={{ 
                  width: typeof width === 'number' ? `${width}px` : width,
                  height: typeof height === 'number' ? `${height}px` : height
                }}
              />
            ))}
          </div>
        );
    }
  };

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <div className={cn('space-y-4', spacingClasses[spacing])}>
      {Array.from({ length: count }).map((_, index) => renderSkeleton(index))}
    </div>
  );
};

export { SkeletonLoader };