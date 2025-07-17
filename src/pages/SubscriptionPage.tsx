import React, { useState } from 'react';
import { Check, Crown, CheckCircle, Settings, AlertTriangle, Shield, CreditCard, Trash2, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { CancellationModal } from '@/components/CancellationModal';
import { ReactivationModal } from '@/components/ReactivationModal';

const SubscriptionPage = () => {
  const { subscription, loading, createCheckoutSession, openCustomerPortal, cancelSubscription, reactivateSubscription } = useSubscription();
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [showReactivationModal, setShowReactivationModal] = useState(false);
  const [cancellationType, setCancellationType] = useState<'immediate' | 'end_of_period'>('end_of_period');
  const [cancelLoading, setCancelLoading] = useState(false);

  const handleSubscribe = async () => {
    setSubscribeLoading(true);
    const checkoutUrl = await createCheckoutSession('premium');
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
    }
    setSubscribeLoading(false);
  };

  const handleOpenCustomerPortal = async () => {
    setPortalLoading(true);
    await openCustomerPortal();
    setPortalLoading(false);
  };

  const handleCancelSubscription = (type: 'immediate' | 'end_of_period') => {
    setCancellationType(type);
    setShowCancellationModal(true);
  };

  const confirmCancellation = async () => {
    setCancelLoading(true);
    const success = await cancelSubscription(cancellationType);
    setCancelLoading(false);
    if (success) {
      setShowCancellationModal(false);
    }
  };

  const confirmReactivation = async () => {
    setCancelLoading(true);
    const success = await reactivateSubscription();
    setCancelLoading(false);
    if (success) {
      setShowReactivationModal(false);
    }
  };

  const usageStats = subscription.usage;
  const analysesUsed = usageStats?.analyses_this_month || 0;
  
  // Check if subscription is cancelled but still active
  const isCancelled = subscription.is_cancelled;
  const isEndOfPeriodCancellation = isCancelled && subscription.cancellation_type === 'end_of_period';
  const canReactivate = subscription.can_reactivate !== false; // Default true se non specificato
  const cancellationEffectiveDate = subscription.cancellation_effective_date 
    ? new Date(subscription.cancellation_effective_date).toLocaleDateString('it-IT')
    : '';

  // Debug logging per troubleshooting
  console.log('🔍 Subscription Debug:', {
    subscribed: subscription.subscribed,
    is_cancelled: subscription.is_cancelled,
    cancellation_type: subscription.cancellation_type,
    can_reactivate: subscription.can_reactivate,
    isCancelled,
    isEndOfPeriodCancellation,
    canReactivate,
    shouldShowReactivationSection: isEndOfPeriodCancellation
  });

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">
          🎵 PetVoice Premium
        </h1>
        <p className="text-xl text-muted-foreground">
          L'unico piano disponibile per sbloccare tutto il potenziale di PetVoice
        </p>
      </div>

      <div className="grid gap-8">
        {subscription.subscribed ? (
          // Active subscription card
          <Card className="petvoice-card border-2 border-success">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full gradient-coral flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-success mb-2">
                ✅ ABBONAMENTO PREMIUM ATTIVO
              </CardTitle>
              <CardDescription className="text-lg">
                Hai accesso completo a tutte le funzionalità
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8">
              <div className="text-center space-y-4">
                <Card className="petvoice-card">
                  <CardContent className="p-6">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Piano Attivo</div>
                    <div className="text-2xl font-bold">Premium €0,97/mese</div>
                    {subscription.subscription_end && (
                      <div className="text-sm mt-2 text-muted-foreground">
                        Prossimo rinnovo: {new Date(subscription.subscription_end).toLocaleDateString('it-IT')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {isEndOfPeriodCancellation && (
                <Card className="petvoice-card border-warning">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-warning">
                      ⚠️ Cancellato - Attivo fino al {cancellationEffectiveDate}
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!isCancelled ? (
                  <>
                    <Button
                      onClick={() => handleCancelSubscription('immediate')}
                      variant="destructive"
                      size="lg"
                      disabled={cancelLoading}
                      className="flex-1 sm:flex-none"
                    >
                      <Trash2 className="w-5 h-5 mr-2" />
                      🗑️ Cancella Immediatamente
                    </Button>
                    
                    <Button
                      onClick={() => handleCancelSubscription('end_of_period')}
                      variant="outline"
                      size="lg"
                      disabled={cancelLoading}
                      className="flex-1 sm:flex-none"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      📅 Cancella a Fine Periodo
                    </Button>
                  </>
                ) : isEndOfPeriodCancellation && canReactivate ? (
                  <Button 
                    onClick={() => setShowReactivationModal(true)}
                    size="lg"
                    disabled={cancelLoading}
                    className="flex-1 sm:flex-none petvoice-button"
                  >
                    <Shield className="w-5 h-5 mr-2" />
                    🔄 Riattiva Abbonamento
                  </Button>
                ) : null}
                
                <Button
                  onClick={handleOpenCustomerPortal}
                  size="lg"
                  disabled={portalLoading}
                  className="flex-1 sm:flex-none petvoice-button"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  ⚙️ Gestisci Pagamenti
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Subscribe card
          <Card className="petvoice-card border-2 border-primary relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5" />
            
            <CardHeader className="text-center pb-6 relative z-10">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full gradient-coral flex items-center justify-center shadow-glow">
                  <Crown className="w-10 h-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-4xl font-bold text-primary mb-3">
                💎 PETVOICE PREMIUM
              </CardTitle>
              <div className="space-y-2">
                <div className="text-5xl font-bold text-primary">€0,97</div>
                <div className="text-xl text-muted-foreground">/mese</div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-8 relative z-10">
              <div className="space-y-2 mb-6">
                <p className="text-center font-medium text-muted-foreground">
                  Tutto quello che serve per il benessere del tuo pet:
                </p>
              </div>
              
              <div className="grid gap-3">
                {[
                  { icon: "🐕", text: "Gestisci tutti i tuoi animali" },
                  { icon: "🧠", text: "Analisi emotive avanzate con AI" },
                  { icon: "📊", text: "Monitoraggio salute completo" },
                  { icon: "🎵", text: "Musicoterapia personalizzata" },
                  { icon: "📅", text: "Calendario veterinario integrato" },
                  { icon: "📝", text: "Diario comportamentale dettagliato" },
                  { icon: "💊", text: "Gestione farmaci e vaccinazioni" },
                  { icon: "📈", text: "Statistiche e trend analitici" },
                  { icon: "📱", text: "Sincronizzazione multi-dispositivo" },
                  { icon: "🆘", text: "Supporto dedicato 24/7" }
                ].map((feature, index) => (
                  <Card key={index} className="petvoice-card p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg flex-shrink-0">{feature.icon}</span>
                      <span className="font-medium text-sm">{feature.text}</span>
                    </div>
                  </Card>
                ))}
              </div>

              <Button
                onClick={handleSubscribe}
                size="lg"
                disabled={subscribeLoading}
                className="w-full petvoice-button py-6 text-xl shadow-glow transform hover:scale-105 transition-all duration-200"
              >
                {subscribeLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Elaborazione...
                  </>
                ) : (
                  <>
                    <Crown className="w-6 h-6 mr-3" />
                    ATTIVA PREMIUM
                  </>
                )}
              </Button>

              <Card className="petvoice-card p-3">
                <p className="text-center text-sm text-muted-foreground">
                  💳 Pagamento sicuro con Stripe • Cancellabile in qualsiasi momento
                </p>
              </Card>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reactivation Section - Solo se cancellato a fine periodo E può riattivare */}
      {isEndOfPeriodCancellation && (
        <Card className="petvoice-card border-warning mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              ⚠️ ABBONAMENTO IN CANCELLAZIONE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Il tuo abbonamento Premium è stato cancellato ma rimane attivo fino al {cancellationEffectiveDate}
            </p>
            
            {/* Mostra pulsante riattiva SOLO se can_reactivate è true */}
            {canReactivate ? (
              <Button 
                onClick={() => setShowReactivationModal(true)}
                className="w-full petvoice-button"
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Elaborazione...' : 'RIATTIVA ABBONAMENTO'}
              </Button>
            ) : (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-destructive font-medium">
                  ❌ Riattivazione non più disponibile
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  L'abbonamento è stato cancellato definitivamente. 
                  Per riprendere il servizio Premium, sottoscrivi un nuovo abbonamento.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <CancellationModal
        isOpen={showCancellationModal}
        onClose={() => setShowCancellationModal(false)}
        onConfirm={confirmCancellation}
        cancellationType={cancellationType}
        subscriptionTier={subscription.subscription_tier || 'premium'}
        subscriptionEnd={subscription.subscription_end}
        isLoading={cancelLoading}
      />

      <ReactivationModal
        isOpen={showReactivationModal}
        onClose={() => setShowReactivationModal(false)}
        onConfirm={confirmReactivation}
        subscriptionTier={subscription.subscription_tier || 'premium'}
        subscriptionEnd={subscription.subscription_end}
        isLoading={cancelLoading}
      />
    </div>
  );
};

export default SubscriptionPage;