import { lazy, ComponentType, LazyExoticComponent } from 'react';
import { useState, useEffect, useCallback } from 'react';

interface LazyComponentConfig {
  /** Ritardo prima di mostrare il loading (evita flash per caricamenti veloci) */
  delay?: number;
  /** Timeout per il caricamento del componente */
  timeout?: number;
  /** Numero massimo di retry in caso di errore */
  maxRetries?: number;
  /** Preload del componente al mount */
  preload?: boolean;
}

interface LazyComponentState {
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  retryCount: number;
  Component?: LazyExoticComponent<ComponentType<any>>;
}

export const useLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  config: LazyComponentConfig = {}
) => {
  const {
    delay = 200,
    timeout = 10000,
    maxRetries = 3,
    preload = false
  } = config;

  const [state, setState] = useState<LazyComponentState>({
    isLoading: false,
    isLoaded: false,
    hasError: false,
    retryCount: 0,
    Component: undefined
  });

  // Create lazy component with enhanced error handling
  const createLazyComponent = useCallback(() => {
    return lazy(async () => {
      const startTime = Date.now();
      
      try {
        // Add artificial delay if specified
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Race between import and timeout
        const importPromise = importFn();
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Component load timeout')), timeout);
        });

        const module = await Promise.race([importPromise, timeoutPromise]);
        
        setState(prev => ({
          ...prev,
          isLoaded: true,
          isLoading: false,
          hasError: false
        }));

        return module;
      } catch (error) {
        console.error('Lazy component loading failed:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          hasError: true,
          retryCount: prev.retryCount + 1
        }));
        throw error;
      }
    });
  }, [importFn, delay, timeout]);

  // Initialize component
  useEffect(() => {
    if (!state.Component) {
      const LazyComponent = createLazyComponent();
      setState(prev => ({
        ...prev,
        Component: LazyComponent,
        isLoading: !preload // Se preload, non mostrare loading
      }));
    }
  }, [createLazyComponent, preload, state.Component]);

  // Preload component if requested
  useEffect(() => {
    if (preload && state.Component) {
      setState(prev => ({ ...prev, isLoading: true }));
      // Trigger the lazy loading
      state.Component;
    }
  }, [preload, state.Component]);

  // Retry function
  const retry = useCallback(() => {
    if (state.retryCount < maxRetries) {
      setState(prev => ({
        ...prev,
        hasError: false,
        isLoading: true,
        Component: undefined
      }));
    }
  }, [state.retryCount, maxRetries]);

  // Preload function for manual triggering
  const preloadComponent = useCallback(async () => {
    if (state.Component && !state.isLoaded) {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        // Force loading of the component
        await importFn();
      } catch (error) {
        console.error('Preload failed:', error);
      }
    }
  }, [state.Component, state.isLoaded, importFn]);

  return {
    Component: state.Component,
    isLoading: state.isLoading,
    isLoaded: state.isLoaded,
    hasError: state.hasError,
    canRetry: state.retryCount < maxRetries,
    retryCount: state.retryCount,
    retry,
    preload: preloadComponent
  };
};

// Utility hook for route-based preloading
export const useRoutePreloader = () => {
  const preloadedRoutes = new Set<string>();

  const preloadRoute = useCallback(async (routePath: string, importFn: () => Promise<any>) => {
    if (preloadedRoutes.has(routePath)) return;
    
    try {
      preloadedRoutes.add(routePath);
      await importFn();
      console.log(`Route preloaded: ${routePath}`);
    } catch (error) {
      preloadedRoutes.delete(routePath);
      console.error(`Failed to preload route ${routePath}:`, error);
    }
  }, []);

  return { preloadRoute };
};