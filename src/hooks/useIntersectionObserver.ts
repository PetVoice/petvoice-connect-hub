import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useIntersectionObserver = ({
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
}: UseIntersectionObserverProps = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<Element | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        
        if (isVisible && (!triggerOnce || !hasTriggered)) {
          setIsIntersecting(true);
          if (triggerOnce) {
            setHasTriggered(true);
          }
        } else if (!triggerOnce) {
          setIsIntersecting(isVisible);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  return { elementRef, isIntersecting };
};

// Hook specifico per lazy loading di immagini
export const useLazyImageLoading = (
  options: UseIntersectionObserverProps = {}
) => {
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true,
    ...options,
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => setIsLoaded(true);
  const handleError = () => {
    setIsLoaded(true);
    setHasError(true);
  };

  return {
    imageRef: elementRef,
    shouldLoad: isIntersecting,
    isLoaded,
    hasError,
    handleLoad,
    handleError,
  };
};

// Hook per preloading dei componenti
export const usePreloadOnHover = (
  preloadFn: () => Promise<any>,
  delay: number = 100
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(preloadFn, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { handleMouseEnter, handleMouseLeave };
};