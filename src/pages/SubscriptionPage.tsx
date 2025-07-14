import React, { useState } from 'react';
import { Check, Crown, CheckCircle, Settings, AlertTriangle, Shield, CreditCard, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { CancellationModal } from '@/components/CancellationModal';
import { ReactivationModal } from '@/components/ReactivationModal';

const SubscriptionPage = () => {
  const { subscription, loading, createCheckoutSession, openCustomerPortal, cancelSubscription, reactivateSubscription } = useSubscription();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [showReactivationModal, setShowReactivationModal] = useState(false);
  const [cancellationType, setCancellationType] = useState<'immediate' | 'end_of_period'>('end_of_period');
  const [isProcessingCancellation, setIsProcessingCancellation] = useState(false);

  const handleSubscribe = async () => {
    setProcessingPlan('premium');
    const checkoutUrl = await createCheckoutSession('premium');
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
    }
    setProcessingPlan(null);
  };

  const handleCancellation = (type: 'immediate' | 'end_of_period') => {
    setCancellationType(type);
    setShowCancellationModal(true);
  };

  const confirmCancellation = async () => {
    setIsProcessingCancellation(true);
    const success = await cancelSubscription(cancellationType);
    setIsProcessingCancellation(false);
    if (success) {
      setShowCancellationModal(false);
    }
  };

  const confirmReactivation = async () => {
    setIsProcessingCancellation(true);
    const success = await reactivateSubscription();
    setIsProcessingCancellation(false);
    if (success) {
      setShowReactivationModal(false);
    }
  };

  const usageStats = subscription.usage;
  const analysesUsed = usageStats?.analyses_this_month || 0;
  
  // Check if subscription is cancelled but still active
  const isCancelled = subscription.is_cancelled;
  const isEndOfPeriodCancellation = isCancelled && subscription.cancellation_type === 'end_of_period';
  const cancellationEffectiveDate = subscription.cancellation_effective_date 
    ? new Date(subscription.cancellation_effective_date).toLocaleDateString('it-IT')
    : '';

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">
          💎 PetVoice Premium
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          L'unico piano disponibile. Pagamento obbligatorio per accedere all'app.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            Pagamenti sicuri
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-500" />
            Stripe certificato
          </div>
        </div>
      </div>

      {/* Active Subscription Status */}
      {subscription.subscribed && (
        <Card className="max-w-2xl mx-auto border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-6 h-6" />
              ✅ ABBONAMENTO PREMIUM ATTIVO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="font-medium">Piano: Premium €0,97/mese</p>
                {subscription.subscription_end && (
                  <p className="text-sm text-muted-foreground">
                    Prossimo rinnovo: {new Date(subscription.subscription_end).toLocaleDateString('it-IT')}
                  </p>
                )}
              </div>
              
              {isEndOfPeriodCancellation && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Cancellato - Attivo fino al {cancellationEffectiveDate}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="destructive"
                  onClick={() => handleCancellation('immediate')}
                  disabled={isProcessingCancellation}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  🗑️ Cancella Immediatamente
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleCancellation('end_of_period')}
                  disabled={isProcessingCancellation}
                  className="flex-1"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  📅 Cancella a Fine Periodo
                </Button>
              </div>
              
              <Button onClick={openCustomerPortal} variant="secondary" className="w-full">
                ⚙️ Gestisci Pagamenti
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reactivation Section */}
      {isEndOfPeriodCancellation && (
        <Card className="max-w-2xl mx-auto border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="w-5 h-5" />
              ⚠️ ABBONAMENTO IN CANCELLAZIONE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-yellow-800">
              Il tuo abbonamento Premium è stato cancellato ma rimane attivo fino al {cancellationEffectiveDate}
            </p>
            <Button 
              onClick={() => setShowReactivationModal(true)}
              className="w-full"
              disabled={isProcessingCancellation}
            >
              {isProcessingCancellation ? 'Elaborazione...' : 'RIATTIVA ABBONAMENTO'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Premium Plan Card - ONLY OPTION */}
      <div className="max-w-md mx-auto">
        <Card className="relative border-primary shadow-lg">
          {subscription.subscribed && (
            <Badge variant="secondary" className="absolute -top-3 right-4 z-50 bg-green-100 text-green-800 border-green-200">
              ✓ ATTIVO
            </Badge>
          )}
          
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle className="text-3xl text-primary">💎 PETVOICE PREMIUM</CardTitle>
            <div className="pt-4">
              <div>
                <span className="text-4xl font-bold text-primary">€0,97</span>
                <span className="text-muted-foreground">/mese</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3">
              {[
                '✅ Pet illimitati',
                '✅ Analisi emotive illimitate', 
                '✅ AI insights avanzati',
                '✅ Music therapy',
                '✅ Export completo',
                '✅ Support prioritario'
              ].map((feature, index) => (
                <div key={index} className="text-sm font-medium">
                  {feature}
                </div>
              ))}
            </div>
          </CardContent>

          <CardFooter className="pt-6">
            {subscription.subscribed ? (
              <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                <CheckCircle className="w-4 h-4 mr-2" />
                Abbonamento Attivo
              </Button>
            ) : (
              <Button 
                className="w-full text-lg py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" 
                size="lg"
                onClick={handleSubscribe}
                disabled={processingPlan === 'premium' || loading}
              >
                {processingPlan === 'premium' ? 'Elaborazione...' : '[ ATTIVA PREMIUM ]'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Important Notice */}
      {!subscription.subscribed && (
        <Card className="max-w-2xl mx-auto border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
              <h3 className="font-bold text-red-800">ACCESSO BLOCCATO</h3>
              <p className="text-red-700">
                Per utilizzare PetVoice devi avere un abbonamento Premium attivo.
                <br />
                <strong>Non è disponibile nessun piano gratuito.</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trust Badges */}
      <div className="border-t pt-8">
        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Pagamenti sicuri SSL</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span>Stripe certified</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CancellationModal
        isOpen={showCancellationModal}
        onClose={() => setShowCancellationModal(false)}
        onConfirm={confirmCancellation}
        cancellationType={cancellationType}
        subscriptionTier="premium"
        subscriptionEnd={subscription.subscription_end}
        isLoading={isProcessingCancellation}
      />

      <ReactivationModal
        isOpen={showReactivationModal}
        onClose={() => setShowReactivationModal(false)}
        onConfirm={confirmReactivation}
        subscriptionTier="premium"
        subscriptionEnd={subscription.subscription_end}
        isLoading={isProcessingCancellation}
      />

    </div>
  );
};

export default SubscriptionPage;