import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Cache per i profili utente con TTL di 5 minuti
const CACHE_TTL = 5 * 60 * 1000; // 5 minuti

interface ProfileData {
  display_name: string;
  timestamp: number;
}

const profileCache = new Map<string, ProfileData>();

export function useProfileCache() {
  const [loading, setLoading] = useState(false);

  const getProfileName = useCallback(async (userId: string): Promise<string> => {
    // Controlla la cache
    const cached = profileCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.display_name?.split(' ')[0] || 'Utente';
    }

    // Se non in cache o scaduto, fetch dal database
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        // Salva in cache
        profileCache.set(userId, {
          display_name: data.display_name || 'Utente',
          timestamp: Date.now()
        });
        return data.display_name?.split(' ')[0] || 'Utente';
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }

    return 'Utente';
  }, []);

  const getMultipleProfiles = useCallback(async (userIds: string[]): Promise<Record<string, string>> => {
    const result: Record<string, string> = {};
    const uncachedIds: string[] = [];

    // Controlla quali profili sono già in cache
    userIds.forEach(userId => {
      const cached = profileCache.get(userId);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        result[userId] = cached.display_name?.split(' ')[0] || 'Utente';
      } else {
        uncachedIds.push(userId);
      }
    });

    // Fetch solo i profili non in cache
    if (uncachedIds.length > 0) {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', uncachedIds);

        if (!error && data) {
          data.forEach(profile => {
            const displayName = profile.display_name || 'Utente';
            // Salva in cache
            profileCache.set(profile.user_id, {
              display_name: displayName,
              timestamp: Date.now()
            });
            result[profile.user_id] = displayName.split(' ')[0];
          });
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setLoading(false);
      }
    }

    return result;
  }, []);

  const clearCache = useCallback(() => {
    profileCache.clear();
  }, []);

  const preloadProfile = useCallback(async (userId: string, displayName: string) => {
    profileCache.set(userId, {
      display_name: displayName,
      timestamp: Date.now()
    });
  }, []);

  // Pulizia automatica delle cache entries scadute
  const cleanupExpiredCache = useCallback(() => {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    profileCache.forEach((value, key) => {
      if (now - value.timestamp >= CACHE_TTL) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => profileCache.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log(`🧹 Cleaned up ${expiredKeys.length} expired profile cache entries`);
    }
  }, []);

  // Esegui pulizia ogni 10 minuti
  useState(() => {
    const cleanupInterval = setInterval(cleanupExpiredCache, 10 * 60 * 1000);
    return () => clearInterval(cleanupInterval);
  });

  return {
    getProfileName,
    getMultipleProfiles,
    clearCache,
    preloadProfile,
    loading
  };
}