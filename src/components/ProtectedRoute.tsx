import React, { useState } from 'react';
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
  const { subscription, loading: subLoading } = useSubscription();
  const location = useLocation();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscribeLoading, setSubscribeLoading] = useState(false);

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
    
  if (isBlocked) {
    // Determine if user is cancelled or new
    const isCancelledUser = subscription.is_cancelled || subscription.cancellation_date !== null;
    
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

  return <>{children}</>;
};

export default ProtectedRoute;