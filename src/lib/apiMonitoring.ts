// Sistema di monitoraggio per endpoint API non utilizzati
import { supabase } from '@/integrations/supabase/client';

interface APICall {
  endpoint: string;
  method: string;
  timestamp: number;
  duration: number;
  status: number;
}

class APIMonitor {
  private calls: APICall[] = [];
  private enabled = process.env.NODE_ENV === 'development';

  // Traccia le chiamate API
  logAPICall(endpoint: string, method: string, duration: number, status: number) {
    if (!this.enabled) return;

    this.calls.push({
      endpoint,
      method,
      timestamp: Date.now(),
      duration,
      status
    });

    // Mantieni solo le ultime 1000 chiamate per evitare memory leak
    if (this.calls.length > 1000) {
      this.calls = this.calls.slice(-1000);
    }
  }

  // Identifica endpoint non utilizzati negli ultimi N giorni
  getUnusedEndpoints(daysSince: number = 7): string[] {
    const cutoffTime = Date.now() - (daysSince * 24 * 60 * 60 * 1000);
    const usedEndpoints = new Set(
      this.calls
        .filter(call => call.timestamp > cutoffTime)
        .map(call => call.endpoint)
    );

    // Lista di tutti gli endpoint conosciuti
    const allEndpoints = [
      '/rest/v1/profiles',
      '/rest/v1/pets',
      '/rest/v1/training_protocols',
      '/rest/v1/training_sessions',
      '/rest/v1/community_messages',
      '/rest/v1/private_messages',
      '/rest/v1/private_chats',
      '/rest/v1/notifications',
      '/rest/v1/user_subscriptions',
      '/rest/v1/calendar_events',
      '/rest/v1/diary_entries',
      '/rest/v1/analysis_history',
      '/rest/v1/support_tickets',
      '/rest/v1/user_channel_subscriptions',
      '/functions/v1/ai-assistance',
      '/functions/v1/analyze-pet-behavior',
      '/functions/v1/analyze-pet-image',
      '/functions/v1/find-nearby-vets',
      '/functions/v1/get-weather',
      '/functions/v1/create-checkout',
      '/functions/v1/customer-portal',
      '/functions/v1/cancel-subscription',
      '/functions/v1/check-subscription',
      '/functions/v1/reactivate-subscription',
      '/functions/v1/delete-user-account'
    ];

    return allEndpoints.filter(endpoint => !usedEndpoints.has(endpoint));
  }

  // Identifica chiamate API ridondanti
  getRedundantCalls(timeWindow: number = 5000): APICall[][] {
    const redundantGroups: APICall[][] = [];
    const callsByEndpoint = new Map<string, APICall[]>();

    // Raggruppa per endpoint
    this.calls.forEach(call => {
      const key = `${call.method}:${call.endpoint}`;
      if (!callsByEndpoint.has(key)) {
        callsByEndpoint.set(key, []);
      }
      callsByEndpoint.get(key)!.push(call);
    });

    // Identifica chiamate multiple nello stesso timeWindow
    callsByEndpoint.forEach((calls, endpoint) => {
      for (let i = 0; i < calls.length - 1; i++) {
        const group = [calls[i]];
        for (let j = i + 1; j < calls.length; j++) {
          if (calls[j].timestamp - calls[i].timestamp <= timeWindow) {
            group.push(calls[j]);
          } else {
            break;
          }
        }
        if (group.length > 2) {
          redundantGroups.push(group);
        }
      }
    });

    return redundantGroups;
  }

  // Statistiche delle performance
  getPerformanceStats() {
    if (this.calls.length === 0) return null;

    const endpointStats = new Map<string, { count: number; avgDuration: number; errors: number }>();

    this.calls.forEach(call => {
      const key = `${call.method}:${call.endpoint}`;
      if (!endpointStats.has(key)) {
        endpointStats.set(key, { count: 0, avgDuration: 0, errors: 0 });
      }

      const stats = endpointStats.get(key)!;
      stats.count++;
      stats.avgDuration = ((stats.avgDuration * (stats.count - 1)) + call.duration) / stats.count;
      if (call.status >= 400) {
        stats.errors++;
      }
    });

    return Object.fromEntries(endpointStats.entries());
  }

  // Pulisci i dati vecchi
  cleanup(olderThanDays: number = 30) {
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    this.calls = this.calls.filter(call => call.timestamp > cutoffTime);
  }

  // Report completo
  generateReport() {
    return {
      totalCalls: this.calls.length,
      unusedEndpoints: this.getUnusedEndpoints(),
      redundantCalls: this.getRedundantCalls(),
      performanceStats: this.getPerformanceStats(),
      timeRange: {
        from: this.calls.length > 0 ? new Date(Math.min(...this.calls.map(c => c.timestamp))) : null,
        to: this.calls.length > 0 ? new Date(Math.max(...this.calls.map(c => c.timestamp))) : null
      }
    };
  }
}

export const apiMonitor = new APIMonitor();

// Intercetta le chiamate Supabase per il monitoraggio
const originalFrom = supabase.from;
supabase.from = function(table: string) {
  const query = originalFrom.call(this, table);
  const originalMethods = ['select', 'insert', 'update', 'delete', 'upsert'];
  
  originalMethods.forEach(method => {
    const original = query[method as keyof typeof query] as Function;
    if (original) {
      (query as any)[method] = function(...args: any[]) {
        const startTime = Date.now();
        const result = original.apply(this, args);
        
        if (result && result.then) {
          return result.then((response: any) => {
            apiMonitor.logAPICall(
              `/rest/v1/${table}`,
              method.toUpperCase(),
              Date.now() - startTime,
              response.error ? 400 : 200
            );
            return response;
          });
        }
        
        return result;
      };
    }
  });
  
  return query;
};

// Log per le edge functions
const originalInvoke = supabase.functions.invoke;
supabase.functions.invoke = function(functionName: string, options?: any) {
  const startTime = Date.now();
  const result = originalInvoke.call(this, functionName, options);
  
  return result.then((response: any) => {
    apiMonitor.logAPICall(
      `/functions/v1/${functionName}`,
      'POST',
      Date.now() - startTime,
      response.error ? 400 : 200
    );
    return response;
  });
};

// Pulizia automatica ogni ora
setInterval(() => {
  apiMonitor.cleanup();
}, 60 * 60 * 1000);