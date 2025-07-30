import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  fallbackSrc?: string;
  blurDataURL?: string;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
  containerClassName?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholderSrc,
  fallbackSrc = '/default-avatar.png',
  blurDataURL,
  threshold = 0.1,
  rootMargin = '50px',
  onLoad,
  onError,
  className,
  containerClassName,
  width,
  height,
  ...props
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [isInView, setIsInView] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>(placeholderSrc || blurDataURL || '');
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (isInView && src && imageState === 'loading') {
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setImageState('loaded');
        onLoad?.();
      };
      
      img.onerror = () => {
        setImageSrc(fallbackSrc);
        setImageState('error');
        onError?.();
      };
      
      img.src = src;
    }
  }, [isInView, src, fallbackSrc, onLoad, onError, imageState]);

  const getPlaceholderStyle = (): React.CSSProperties => {
    if (blurDataURL && imageState === 'loading') {
      return {
        backgroundImage: `url(${blurDataURL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(8px)',
      };
    }
    
    if (placeholderSrc && imageState === 'loading') {
      return {
        backgroundImage: `url(${placeholderSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(4px)',
      };
    }
    
    return {
      backgroundColor: 'hsl(var(--muted))',
    };
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'lazy-image-container relative overflow-hidden',
        containerClassName
      )}
      style={{ width, height }}
    >
      {/* Placeholder/Blur layer */}
      {imageState === 'loading' && (
        <div
          className="absolute inset-0 lazy-image-placeholder animate-pulse"
          style={getPlaceholderStyle()}
        />
      )}
      
      {/* Main image */}
      {(isInView || imageState !== 'loading') && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          className={cn(
            'lazy-image transition-all duration-500 ease-out',
            imageState === 'loaded' ? 'lazy-image-loaded opacity-100' : 'opacity-0',
            imageState === 'error' && 'lazy-image-error',
            className
          )}
          width={width}
          height={height}
          loading="lazy"
          {...props}
        />
      )}
      
      {/* Loading state overlay */}
      {imageState === 'loading' && isInView && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <div className="lazy-image-spinner animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
};

export { LazyImage };