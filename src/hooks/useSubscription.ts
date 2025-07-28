import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: 'premium';
  subscription_end: string | null;
  is_cancelled: boolean;
  cancellation_type: 'immediate' | 'end_of_period' | null;
  cancellation_date: string | null;
  cancellation_effective_date: string | null;
  can_reactivate?: boolean; // Se può riattivare l'abbonamento (default: true)
  immediate_cancellation_after_period_end?: boolean; // Se ha cancellato immediatamente dopo period_end
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
    subscription_tier: 'premium',
    subscription_end: null,
    is_cancelled: false,
    cancellation_type: null,
    cancellation_date: null,
    cancellation_effective_date: null,
  });
  const [loading, setLoading] = useState(false);

  const checkSubscription = async (showErrorToast = false) => {
    if (!user) {
      // Set default state when no user is logged in
      setSubscription({
        subscribed: false,
        subscription_tier: 'premium',
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
      // Leggi direttamente dalla tabella subscribers invece di usare l'edge function
      const { data: subscriberData, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('📋 RAW SUBSCRIBER DATA FROM DB:', subscriberData);
      console.log('🔍 ERROR FROM DB:', error);

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Converti i dati dalla tabella al formato SubscriptionData
      const subscriptionData: SubscriptionData = {
        subscribed: subscriberData?.subscription_status === 'active',
        subscription_tier: 'premium',
        subscription_end: subscriberData?.subscription_end_date || subscriberData?.cancellation_effective_date || null,
        is_cancelled: subscriberData?.is_cancelled || false,
        cancellation_type: (subscriberData?.cancellation_type as 'immediate' | 'end_of_period') || null,
        cancellation_date: subscriberData?.cancellation_date || null,
        cancellation_effective_date: subscriberData?.cancellation_effective_date || null,
        can_reactivate: subscriberData?.can_reactivate !== false,
      };
      
      console.log('✅ MAPPED SUBSCRIPTION DATA:', subscriptionData);
      
      setSubscription(subscriptionData);
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Set default state on error
      setSubscription({
        subscribed: false,
        subscription_tier: 'premium',
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

  const createCheckoutSession = async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: 'premium' }
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
      console.log('🚀 STARTING CANCELLATION:', { type, user: user.email });
      
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { cancellation_type: type }
      });
      
      if (error) throw error;
      
      console.log('✅ CANCELLATION SUCCESS:', data);
      
      // FORCE IMMEDIATE REFRESH - NO DELAYS
      console.log('🔄 FORCING IMMEDIATE SUBSCRIPTION CHECK...');
      await checkSubscription();
      
      // Aggiungi un delay e riprova per essere sicuri
      setTimeout(async () => {
        console.log('🔄 RETRY SUBSCRIPTION CHECK AFTER 1s...');
        await checkSubscription();
        
        // Log lo stato corrente per debug
        console.log('📊 CURRENT SUBSCRIPTION STATE:', subscription);
      }, 1000);
      
      // Se cancellazione immediata, forza refresh pagina
      if (type === 'immediate') {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
      
      toast({
        title: type === 'immediate' ? "Abbonamento cancellato" : "Cancellazione programmata",
        description: type === 'immediate' 
          ? "Abbonamento cancellato immediatamente. Accesso bloccato." 
          : `Abbonamento attivo fino al ${new Date(data.cancellation_effective_date).toLocaleDateString()}`,
        variant: "destructive",
      });
      
      return true;
    } catch (error) {
      console.error('❌ CANCELLATION ERROR:', error);
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
      
      // Forza un refresh completo chiamando check-subscription per aggiornare i dati
      console.log('🔄 Refreshing subscription after reactivation...');
      const { data: checkData, error: checkError } = await supabase.functions.invoke('check-subscription');
      
      console.log('📋 CHECK-SUBSCRIPTION RESPONSE:', { checkData, checkError });
      
      if (!checkError && checkData) {
        const newSubscriptionData: SubscriptionData = {
          subscribed: checkData.subscribed || false,
          subscription_tier: 'premium',
          subscription_end: checkData.subscription_end || null,
          is_cancelled: checkData.is_cancelled || false,
          cancellation_type: checkData.cancellation_type || null,
          cancellation_date: checkData.cancellation_date || null,
          cancellation_effective_date: checkData.cancellation_effective_date || null,
          can_reactivate: checkData.can_reactivate !== false,
          usage: checkData.usage
        };
        
        console.log('🔄 UPDATING SUBSCRIPTION STATE TO:', newSubscriptionData);
        setSubscription(newSubscriptionData);
        console.log('✅ Subscription updated after reactivation:', newSubscriptionData);
      } else {
        console.error('❌ Error calling check-subscription:', checkError);
      }
      
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
    setLoading(true);
    checkSubscription();

    // Listen for payment success messages from child windows
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'PAYMENT_SUCCESS') {
        // Refresh subscription status when payment is successful
        setTimeout(() => {
          checkSubscription();
        }, 1000);
        
        toast({
          title: "Abbonamento attivato!",
          description: "Il tuo abbonamento è ora attivo. Benvenuto in PetVoice Premium!",
        });
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
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