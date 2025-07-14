import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2, Crown, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subLoading } = useSubscription();
  const location = useLocation();

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

  // Block access to all other pages if not premium
  if (!subscription.subscribed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-red-800">🚫 ACCESSO BLOCCATO</h2>
                <p className="text-red-700">
                  Per utilizzare PetVoice devi avere un abbonamento Premium attivo.
                </p>
                <p className="text-sm text-red-600">
                  <strong>Non esiste piano gratuito.</strong><br/>
                  L'accesso è consentito solo con abbonamento Premium a €0,97/mese.
                </p>
              </div>
              <Button 
                onClick={() => window.location.href = '/subscription'}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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