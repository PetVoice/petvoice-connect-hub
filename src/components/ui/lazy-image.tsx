import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  skeletonClassName?: string;
  threshold?: number;
  rootMargin?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallback = '/placeholder.svg',
  className,
  skeletonClassName,
  threshold = 0.1,
  rootMargin = '50px',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

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

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const imgSrc = hasError ? fallback : src;

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <Skeleton 
          className={cn(
            "absolute inset-0 z-10",
            skeletonClassName
          )} 
        />
      )}
      
      {isInView && (
        <img
          src={imgSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
          {...props}
        />
      )}
    </div>
  );
};

interface LazyBackgroundImageProps {
  src: string;
  children: React.ReactNode;
  className?: string;
  fallback?: string;
  threshold?: number;
  rootMargin?: string;
}

export const LazyBackgroundImage: React.FC<LazyBackgroundImageProps> = ({
  src,
  children,
  className,
  fallback = '/placeholder.svg',
  threshold = 0.1,
  rootMargin = '50px',
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);

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

    if (divRef.current) {
      observer.observe(divRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (isInView) {
      const img = new Image();
      img.onload = () => setIsLoading(false);
      img.onerror = () => {
        setIsLoading(false);
        setHasError(true);
      };
      img.src = src;
    }
  }, [isInView, src]);

  const backgroundImage = hasError ? fallback : src;

  return (
    <div
      ref={divRef}
      className={cn(
        "relative transition-opacity duration-300",
        isLoading && isInView ? "opacity-50" : "opacity-100",
        className
      )}
      style={{
        backgroundImage: isInView && !isLoading ? `url(${backgroundImage})` : undefined,
      }}
    >
      {isLoading && isInView && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      {children}
    </div>
  );
};