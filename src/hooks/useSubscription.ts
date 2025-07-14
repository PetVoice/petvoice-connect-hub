import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: 'free' | 'premium' | 'family';
  subscription_end: string | null;
  usage?: {
    analyses_this_month: number;
    total_pets: number;
    last_updated: string;
  };
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: 'free',
    subscription_end: null,
  });
  const [loading, setLoading] = useState(false);

  const checkSubscription = async (showErrorToast = false) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Only show toast for manual checks, not automatic ones
      if (showErrorToast) {
        toast({
          title: "Errore",
          description: "Impossibile verificare lo stato dell'abbonamento",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (plan: 'premium' | 'family') => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan }
      });
      
      if (error) throw error;
      
      return data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Errore",
        description: "Impossibile avviare il processo di pagamento",
        variant: "destructive",
      });
      return null;
    }
  };

  const openCustomerPortal = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Errore",
        description: "Impossibile aprire il portale di gestione",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);

  return {
    subscription,
    loading,
    checkSubscription,
    createCheckoutSession,
    openCustomerPortal,
  };
};