import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: 'free' | 'premium' | 'family';
  subscription_end: string | null;
  is_cancelled: boolean;
  cancellation_type: 'immediate' | 'end_of_period' | null;
  cancellation_date: string | null;
  cancellation_effective_date: string | null;
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
    is_cancelled: false,
    cancellation_type: null,
    cancellation_date: null,
    cancellation_effective_date: null,
  });
  const [loading, setLoading] = useState(false);

  const checkSubscription = async (showErrorToast = false) => {
    if (!user) {
      // Set default free tier when no user is logged in
      setSubscription({
        subscribed: false,
        subscription_tier: 'free',
        subscription_end: null,
        is_cancelled: false,
        cancellation_type: null,
        cancellation_date: null,
        cancellation_effective_date: null,
      });
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Set default free tier on error
      setSubscription({
        subscribed: false,
        subscription_tier: 'free',
        subscription_end: null,
        is_cancelled: false,
        cancellation_type: null,
        cancellation_date: null,
        cancellation_effective_date: null,
      });
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

  const cancelSubscription = async (type: 'immediate' | 'end_of_period') => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { cancellation_type: type }
      });
      
      if (error) throw error;
      
      // Refresh subscription status
      await checkSubscription();
      
      toast({
        title: type === 'immediate' ? "Abbonamento cancellato" : "Cancellazione programmata",
        description: type === 'immediate' 
          ? "Sei tornato al piano Free" 
          : `Abbonamento attivo fino al ${new Date(data.cancellation_effective_date).toLocaleDateString()}`,
        variant: "default",
      });
      
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Errore",
        description: "Impossibile cancellare l'abbonamento",
        variant: "destructive",
      });
      return false;
    }
  };

  const reactivateSubscription = async () => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase.functions.invoke('reactivate-subscription');
      
      if (error) throw error;
      
      // Refresh subscription status
      await checkSubscription();
      
      toast({
        title: "Abbonamento riattivato",
        description: "Il rinnovo automatico è stato ripristinato",
        variant: "default",
      });
      
      return true;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast({
        title: "Errore",
        description: "Impossibile riattivare l'abbonamento",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    // Always call checkSubscription to ensure loading state is handled
    checkSubscription();
  }, [user]);

  return {
    subscription,
    loading,
    checkSubscription,
    createCheckoutSession,
    openCustomerPortal,
    cancelSubscription,
    reactivateSubscription,
  };
};