import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Integration {
  id: string;
  integration_type: 'calendar' | 'health';
  provider: 'google' | 'apple' | 'microsoft';
  is_active: boolean;
  token_expires_at?: string;
  settings: any;
  created_at: string;
  updated_at: string;
}

export function useIntegrations() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  const loadIntegrations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading integrations:', error);
        toast.error('Errore nel caricamento delle integrazioni');
        return;
      }

      setIntegrations(data?.map(item => ({
        ...item,
        integration_type: item.integration_type as 'calendar' | 'health',
        provider: item.provider as 'google' | 'apple' | 'microsoft'
      })) || []);
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast.error('Errore nel caricamento delle integrazioni');
    } finally {
      setLoading(false);
    }
  };

  const connectIntegration = async (type: 'calendar' | 'health', provider: 'google' | 'apple' | 'microsoft') => {
    if (!user) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Sessione non valida');
        return;
      }

      let functionName = '';
      switch (provider) {
        case 'google':
          functionName = type === 'calendar' ? 'google-calendar-oauth' : 'google-fit-oauth';
          break;
        case 'microsoft':
          functionName = 'microsoft-outlook-oauth';
          break;
        case 'apple':
          functionName = type === 'calendar' ? 'apple-calendar-oauth' : 'apple-health-oauth';
          break;
      }

      if (provider === 'apple') {
        // Apple integrations use local device access
        const { error } = await supabase.functions.invoke(functionName, {
          body: {
            [type === 'calendar' ? 'calendarData' : 'healthData']: {
              enabled: true,
              sync_type: 'local'
            }
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (error) {
          console.error('Error connecting to Apple service:', error);
          toast.error(`Errore nella connessione con Apple ${type === 'calendar' ? 'Calendar' : 'Health'}`);
          return;
        }

        toast.success(`Apple ${type === 'calendar' ? 'Calendar' : 'Health'} connesso con successo!`);
        await loadIntegrations();
        return;
      }

      // For Google and Microsoft, use OAuth flow
      const { data, error } = await supabase.functions.invoke(functionName, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Error initiating OAuth:', error);
        toast.error('Errore nell\'avvio del processo di autenticazione');
        return;
      }

      if (data.auth_url) {
        // Open OAuth URL in a new window
        const authWindow = window.open(data.auth_url, '_blank', 'width=600,height=600');
        
        // Listen for window closure to refresh integrations
        const checkClosed = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkClosed);
            setTimeout(() => {
              loadIntegrations();
            }, 1000);
          }
        }, 1000);
      }

    } catch (error) {
      console.error('Error connecting integration:', error);
      toast.error('Errore nella connessione dell\'integrazione');
    }
  };

  const disconnectIntegration = async (integrationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_integrations')
        .update({ is_active: false })
        .eq('id', integrationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error disconnecting integration:', error);
        toast.error('Errore nella disconnessione dell\'integrazione');
        return;
      }

      toast.success('Integrazione disconnessa con successo');
      await loadIntegrations();
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      toast.error('Errore nella disconnessione dell\'integrazione');
    }
  };

  const getIntegrationStatus = (type: 'calendar' | 'health', provider: 'google' | 'apple' | 'microsoft') => {
    const integration = integrations.find(i => 
      i.integration_type === type && 
      i.provider === provider && 
      i.is_active
    );
    
    return {
      connected: !!integration,
      integration: integration || null,
      needsReauth: integration && integration.token_expires_at && 
                  new Date(integration.token_expires_at) < new Date()
    };
  };

  // Return legacy integrations object for backward compatibility
  const legacyIntegrations = {
    calendar: {
      google: getIntegrationStatus('calendar', 'google').connected,
      apple: getIntegrationStatus('calendar', 'apple').connected,
      outlook: getIntegrationStatus('calendar', 'microsoft').connected
    },
    health: {
      appleHealth: getIntegrationStatus('health', 'apple').connected,
      googleFit: getIntegrationStatus('health', 'google').connected
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, [user]);

  return {
    integrations: legacyIntegrations,
    loading,
    connectIntegration,
    disconnectIntegration,
    getIntegrationStatus,
    reload: loadIntegrations
  };
}