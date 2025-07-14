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

  // Allow access to subscription page even without premium
  if (location.pathname === '/subscription') {
    return <>{children}</>;
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

  // Block access to all other pages if not premium
  if (!subscription.subscribed) {
    // Determine if user is cancelled or new
    const isCancelledUser = subscription.is_cancelled || subscription.cancellation_date !== null;
    
    // Show modal for dashboard and other pages
    if (location.pathname !== '/subscription') {
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
    
    // For subscription page, show normal blocking UI
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="petvoice-card max-w-md w-full border-2 border-destructive">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <div className="space-y-3">
                <h2 className="text-xl font-bold">🚫 ACCESSO BLOCCATO</h2>
                <p className="text-muted-foreground">
                  Per utilizzare PetVoice devi avere un abbonamento Premium attivo.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Non esiste piano gratuito.</strong><br/>
                  L'accesso è consentito solo con abbonamento Premium a €0,97/mese.
                </p>
              </div>
              <Button 
                onClick={() => window.location.href = '/subscription'}
                className="w-full petvoice-button"
              >
                <Crown className="w-4 h-4 mr-2" />
                Attiva Premium Ora
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;