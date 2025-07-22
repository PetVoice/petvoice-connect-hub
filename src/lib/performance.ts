// Sistema di monitoraggio performance
import React from 'react';
import logger from './logger';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric> = new Map();
  private thresholds = {
    database: 1000,    // 1 secondo per query DB
    api: 2000,         // 2 secondi per chiamate API  
    component: 100,    // 100ms per render componenti
    navigation: 500    // 500ms per navigazione
  };

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasure(name: string, metadata?: Record<string, any>): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata
    });
  }

  endMeasure(name: string, additionalMetadata?: Record<string, any>): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      logger.warn(`Performance metric "${name}" not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    metric.endTime = endTime;
    metric.duration = duration;
    
    if (additionalMetadata) {
      metric.metadata = { ...metric.metadata, ...additionalMetadata };
    }

    // Controlla soglie di performance
    this.checkThresholds(metric);
    
    // Log solo in development o se superano soglie
    if (process.env.NODE_ENV === 'development' || this.isSlowOperation(metric)) {
      logger.debug(`Performance: ${name} took ${duration.toFixed(2)}ms`, metric.metadata);
    }

    this.metrics.delete(name);
    return duration;
  }

  private checkThresholds(metric: PerformanceMetric): void {
    if (!metric.duration) return;

    const category = this.categorizeMetric(metric.name);
    const threshold = this.thresholds[category];
    
    if (metric.duration > threshold) {
      logger.warn(`Slow ${category} operation: ${metric.name} took ${metric.duration.toFixed(2)}ms (threshold: ${threshold}ms)`, metric.metadata);
      
      // In produzione, invia a servizio di monitoring
      if (process.env.NODE_ENV === 'production') {
        this.reportSlowOperation(metric, category, threshold);
      }
    }
  }

  private categorizeMetric(name: string): keyof typeof this.thresholds {
    if (name.includes('supabase') || name.includes('database') || name.includes('query')) {
      return 'database';
    }
    if (name.includes('api') || name.includes('fetch') || name.includes('request')) {
      return 'api';
    }
    if (name.includes('render') || name.includes('component')) {
      return 'component';
    }
    if (name.includes('navigation') || name.includes('route')) {
      return 'navigation';
    }
    return 'api'; // default
  }

  private isSlowOperation(metric: PerformanceMetric): boolean {
    if (!metric.duration) return false;
    const category = this.categorizeMetric(metric.name);
    return metric.duration > this.thresholds[category];
  }

  private reportSlowOperation(metric: PerformanceMetric, category: string, threshold: number): void {
    // Qui potresti integrare con servizi come Sentry, DataDog, etc.
    console.warn('SLOW_OPERATION', {
      name: metric.name,
      category,
      duration: metric.duration,
      threshold,
      metadata: metric.metadata,
      timestamp: new Date().toISOString()
    });
  }

  measureAsync<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    this.startMeasure(name, metadata);
    return fn().then(
      (result) => {
        this.endMeasure(name, { success: true });
        return result;
      },
      (error) => {
        this.endMeasure(name, { success: false, error: error.message });
        throw error;
      }
    );
  }

  measureSync<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    this.startMeasure(name, metadata);
    try {
      const result = fn();
      this.endMeasure(name, { success: true });
      return result;
    } catch (error) {
      this.endMeasure(name, { success: false, error: (error as Error).message });
      throw error;
    }
  }

  getActiveMetrics(): string[] {
    return Array.from(this.metrics.keys());
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Helper functions
export const measureDatabaseOperation = <T>(
  operationName: string, 
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> => {
  return performanceMonitor.measureAsync(
    `supabase_${operationName}`, 
    operation, 
    metadata
  );
};

export const measureComponentRender = <T>(
  componentName: string, 
  renderFn: () => T,
  metadata?: Record<string, any>
): T => {
  return performanceMonitor.measureSync(
    `component_render_${componentName}`, 
    renderFn, 
    metadata
  );
};

export const measureApiCall = <T>(
  apiName: string, 
  apiCall: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> => {
  return performanceMonitor.measureAsync(
    `api_${apiName}`, 
    apiCall, 
    metadata
  );
};

export const measureNavigation = (routeName: string, metadata?: Record<string, any>) => {
  performanceMonitor.startMeasure(`navigation_${routeName}`, metadata);
  
  return () => {
    performanceMonitor.endMeasure(`navigation_${routeName}`);
  };
};

// React Hook per misurare rendering dei componenti
export const usePerformanceMeasure = (componentName: string, dependencies: any[] = []) => {
  React.useEffect(() => {
    const measureId = `component_effect_${componentName}`;
    performanceMonitor.startMeasure(measureId);
    
    return () => {
      performanceMonitor.endMeasure(measureId);
    };
  }, dependencies);
};