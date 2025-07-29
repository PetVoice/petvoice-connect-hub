import { useEffect, useRef } from 'react';
import { performanceMonitor } from '@/lib/performance';

interface UsePerformanceMonitorOptions {
  name: string;
  metadata?: Record<string, any>;
  enabled?: boolean;
}

// Hook per monitorare le performance di un componente
export const usePerformanceMonitor = ({
  name,
  metadata = {},
  enabled = true,
}: UsePerformanceMonitorOptions) => {
  const startTimeRef = useRef<number>();

  useEffect(() => {
    if (!enabled) return;

    // Inizia la misurazione al mount del componente
    startTimeRef.current = performance.now();
    performanceMonitor.startMeasure(name, {
      ...metadata,
      type: 'component_render',
    });

    // Termina la misurazione al unmount del componente
    return () => {
      if (startTimeRef.current) {
        performanceMonitor.endMeasure(name, {
          renderTime: performance.now() - startTimeRef.current,
        });
      }
    };
  }, [name, enabled, metadata]);

  // Funzione per misurare operazioni specifiche
  const measureOperation = async <T>(
    operationName: string,
    operation: () => Promise<T>,
    operationMetadata?: Record<string, any>
  ): Promise<T> => {
    if (!enabled) return operation();

    return performanceMonitor.measureAsync(
      `${name}_${operationName}`,
      operation,
      {
        ...metadata,
        ...operationMetadata,
        parentComponent: name,
      }
    );
  };

  return { measureOperation };
};

// Hook specializzato per il lazy loading
export const useLazyLoadPerformance = (componentName: string) => {
  const loadStartRef = useRef<number>();
  const isLoadedRef = useRef(false);

  const startMeasuring = () => {
    if (!isLoadedRef.current) {
      loadStartRef.current = performance.now();
      performanceMonitor.startMeasure(`lazy_load_${componentName}`, {
        type: 'lazy_loading',
        component: componentName,
      });
    }
  };

  const stopMeasuring = () => {
    if (!isLoadedRef.current && loadStartRef.current) {
      isLoadedRef.current = true;
      performanceMonitor.endMeasure(`lazy_load_${componentName}`, {
        loadTime: performance.now() - loadStartRef.current,
      });
    }
  };

  useEffect(() => {
    // Auto-start measuring when hook is used
    startMeasuring();
    
    // Stop measuring after a short delay (component should be loaded by then)
    const timer = setTimeout(stopMeasuring, 100);
    
    return () => {
      clearTimeout(timer);
      stopMeasuring();
    };
  }, [componentName]);

  return { startMeasuring, stopMeasuring };
};

// Hook per monitorare le immagini lazy-loaded
export const useImageLoadPerformance = (imageSrc: string) => {
  const startTimeRef = useRef<number>();

  const onImageLoadStart = () => {
    startTimeRef.current = performance.now();
    performanceMonitor.startMeasure(`image_load_${imageSrc}`, {
      type: 'image_loading',
      src: imageSrc,
    });
  };

  const onImageLoadEnd = (hasError: boolean = false) => {
    if (startTimeRef.current) {
      performanceMonitor.endMeasure(`image_load_${imageSrc}`, {
        loadTime: performance.now() - startTimeRef.current,
        hasError,
        imageSize: 'unknown', // Could be enhanced to detect image size
      });
    }
  };

  return { onImageLoadStart, onImageLoadEnd };
};

// Hook per monitorare le performance di navigazione
export const useNavigationPerformance = () => {
  const navigationStartRef = useRef<number>();

  const startNavigation = (route: string) => {
    navigationStartRef.current = performance.now();
    performanceMonitor.startMeasure(`navigation_${route}`, {
      type: 'navigation',
      route,
    });
  };

  const endNavigation = (route: string) => {
    if (navigationStartRef.current) {
      performanceMonitor.endMeasure(`navigation_${route}`, {
        navigationTime: performance.now() - navigationStartRef.current,
      });
    }
  };

  return { startNavigation, endNavigation };
};