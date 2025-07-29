import React, { memo, useMemo } from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { LazyImage } from './lazy-image';

interface PerformanceOptimizedLayoutProps {
  children: React.ReactNode;
  className?: string;
  name?: string;
  enablePerfMonitoring?: boolean;
}

// Layout ottimizzato per le performance con monitoraggio integrato
export const PerformanceOptimizedLayout = memo<PerformanceOptimizedLayoutProps>(({
  children,
  className,
  name = 'layout',
  enablePerfMonitoring = process.env.NODE_ENV === 'development',
}) => {
  usePerformanceMonitor({
    name: `layout_${name}`,
    enabled: enablePerfMonitoring,
  });

  return (
    <div className={className}>
      {children}
    </div>
  );
});

PerformanceOptimizedLayout.displayName = 'PerformanceOptimizedLayout';

interface OptimizedImageGridProps {
  images: Array<{
    src: string;
    alt: string;
    id: string;
  }>;
  className?: string;
  imageClassName?: string;
  onImageClick?: (image: any) => void;
}

// Griglia di immagini ottimizzata con lazy loading e virtualizzazione
export const OptimizedImageGrid = memo<OptimizedImageGridProps>(({
  images,
  className = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
  imageClassName = 'w-full h-48 object-cover rounded-lg',
  onImageClick,
}) => {
  // Usa useMemo per evitare ri-rendering inutili
  const memoizedImages = useMemo(() => images, [images]);

  return (
    <div className={className}>
      {memoizedImages.map((image) => (
        <div
          key={image.id}
          className="cursor-pointer transition-transform hover:scale-105"
          onClick={() => onImageClick?.(image)}
        >
          <LazyImage
            src={image.src}
            alt={image.alt}
            className={imageClassName}
            threshold={0.1}
            rootMargin="50px"
          />
        </div>
      ))}
    </div>
  );
});

OptimizedImageGrid.displayName = 'OptimizedImageGrid';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  className?: string;
}

// Lista virtualizzata per gestire grandi dataset
export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  className,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);

  // Calcola quali elementi sono visibili
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = useMemo(() => {
    return items.slice(visibleStart, visibleEnd);
  }, [items, visibleStart, visibleEnd]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      className={className}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${visibleStart * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) =>
            renderItem(item, visibleStart + index)
          )}
        </div>
      </div>
    </div>
  );
}

// HOC per aggiungere monitoraggio delle performance a qualsiasi componente
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  const WrappedComponent = memo<P>((props) => {
    usePerformanceMonitor({
      name: componentName,
      enabled: process.env.NODE_ENV === 'development',
    });

    return <Component {...props} />;
  });

  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  return WrappedComponent;
}