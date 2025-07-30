import { useState, useCallback, useEffect } from 'react';

interface SkeletonConfig {
  /** Delay before showing skeleton (prevents flash for fast operations) */
  delay?: number;
  /** Minimum time to show skeleton (prevents flash) */
  minDuration?: number;
  /** Auto-hide after timeout */
  timeout?: number;
}

interface UseSkeletonStateReturn {
  /** Current loading state */
  isLoading: boolean;
  /** Show skeleton manually */
  showSkeleton: () => void;
  /** Hide skeleton manually */
  hideSkeleton: () => void;
  /** Toggle skeleton state */
  toggleSkeleton: () => void;
  /** Set loading state with config options */
  setLoading: (loading: boolean, config?: SkeletonConfig) => void;
}

export const useSkeletonState = (
  initialState: boolean = false,
  defaultConfig: SkeletonConfig = {}
): UseSkeletonStateReturn => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [startTime, setStartTime] = useState<number | null>(null);

  const showSkeleton = useCallback(() => {
    setIsLoading(true);
    setStartTime(Date.now());
  }, []);

  const hideSkeleton = useCallback((config: SkeletonConfig = {}) => {
    const { minDuration = 0 } = { ...defaultConfig, ...config };
    
    if (minDuration > 0 && startTime) {
      const elapsed = Date.now() - startTime;
      const remaining = minDuration - elapsed;
      
      if (remaining > 0) {
        setTimeout(() => {
          setIsLoading(false);
          setStartTime(null);
        }, remaining);
        return;
      }
    }
    
    setIsLoading(false);
    setStartTime(null);
  }, [startTime, defaultConfig]);

  const toggleSkeleton = useCallback(() => {
    if (isLoading) {
      hideSkeleton();
    } else {
      showSkeleton();
    }
  }, [isLoading, showSkeleton, hideSkeleton]);

  const setLoading = useCallback((loading: boolean, config: SkeletonConfig = {}) => {
    const { delay = 0, timeout } = { ...defaultConfig, ...config };
    
    if (loading) {
      if (delay > 0) {
        setTimeout(() => {
          showSkeleton();
          
          // Auto-hide after timeout
          if (timeout) {
            setTimeout(() => hideSkeleton(config), timeout);
          }
        }, delay);
      } else {
        showSkeleton();
        
        // Auto-hide after timeout
        if (timeout) {
          setTimeout(() => hideSkeleton(config), timeout);
        }
      }
    } else {
      hideSkeleton(config);
    }
  }, [showSkeleton, hideSkeleton, defaultConfig]);

  return {
    isLoading,
    showSkeleton,
    hideSkeleton,
    toggleSkeleton,
    setLoading
  };
};

// Hook for React Query integration
export const useSkeletonWithQuery = (isQueryLoading: boolean, config?: SkeletonConfig) => {
  const skeleton = useSkeletonState(false, config);
  
  useEffect(() => {
    skeleton.setLoading(isQueryLoading, config);
  }, [isQueryLoading, skeleton, config]);
  
  return skeleton;
};

// Hook for multiple loading states
export const useMultipleSkeletons = (keys: string[], defaultConfig?: SkeletonConfig) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    keys.reduce((acc, key) => ({ ...acc, [key]: false }), {})
  );
  
  const setLoading = useCallback((key: string, loading: boolean, config?: SkeletonConfig) => {
    const { delay = 0 } = { ...defaultConfig, ...config };
    
    if (loading && delay > 0) {
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, [key]: true }));
      }, delay);
    } else {
      setLoadingStates(prev => ({ ...prev, [key]: loading }));
    }
  }, [defaultConfig]);
  
  const isLoading = useCallback((key: string) => loadingStates[key] || false, [loadingStates]);
  
  const isAnyLoading = useCallback(() => 
    Object.values(loadingStates).some(Boolean), [loadingStates]
  );
  
  return {
    setLoading,
    isLoading,
    isAnyLoading,
    loadingStates
  };
};