import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2, Crown, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubscriptionBlockModal } from '@/components/SubscriptionBlockModal';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subLoading, checkSubscription } = useSubscription();
  const location = useLocation();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscribeLoading, setSubscribeLoading] = useState(false);

  // Listen for payment success messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'PAYMENT_SUCCESS') {
        console.log('🎉 Payment success detected in ProtectedRoute');
        // Force refresh subscription status using check-subscription edge function
        setTimeout(async () => {
          try {
            const { data, error } = await supabase.functions.invoke('check-subscription');
            if (!error && data) {
              console.log('📋 Forced Stripe sync after payment:', data);
              // Force another local check
              await checkSubscription();
            }
          } catch (error) {
            console.error('Error syncing with Stripe:', error);
          }
        }, 2000);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [checkSubscription]);

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-coral" />
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }


  const handleSubscribe = async () => {
    if (!user) return;
    
    try {
      setSubscribeLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: 'premium' }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
    } finally {
      setSubscribeLoading(false);
    }
  };

  // Block access to all other pages if not premium or cancelled immediately
  const isBlocked = !subscription.subscribed || 
    (subscription.is_cancelled && subscription.cancellation_type === 'immediate');
  
  // DEBUG: Log della logica di blocco
  console.log('🔒 PROTECTED ROUTE DEBUG:', {
    subscribed: subscription.subscribed,
    is_cancelled: subscription.is_cancelled,
    cancellation_type: subscription.cancellation_type,
    // subscription_status non è nel tipo, rimosso dal log
    isBlocked: isBlocked,
    fullSubscription: subscription
  });
    
  if (isBlocked) {
    // Determine if user is cancelled or new
    const isCancelledUser = subscription.is_cancelled || subscription.cancellation_date !== null;
    
    console.log('📛 SHOWING MODAL - User is blocked:', { isCancelledUser, isBlocked });
    
    // Show modal for ALL pages including subscription page
    return (
      <>
        {children}
        <SubscriptionBlockModal
          isOpen={true}
          onSubscribe={handleSubscribe}
          isLoading={subscribeLoading}
          isCancelledUser={isCancelledUser}
        />
      </>
    );
  }

  console.log('✅ ACCESS GRANTED - User has active subscription');

  return <>{children}</>;
};

export default ProtectedRoute;