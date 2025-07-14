import React, { useState } from 'react';
import { Check, Crown, Gift, CheckCircle, Settings, AlertTriangle, BarChart3, Shield, CreditCard, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSubscription } from '@/hooks/useSubscription';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { cn } from '@/lib/utils';
import { UpgradeModal } from '@/components/UpgradeModal';
import { CancellationModal } from '@/components/CancellationModal';
import { ReactivationModal } from '@/components/ReactivationModal';

const SubscriptionPage = () => {
  const { subscription, loading, createCheckoutSession, openCustomerPortal, cancelSubscription, reactivateSubscription } = useSubscription();
  const { showUpgradeModal, setShowUpgradeModal } = usePlanLimits();
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
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
          <Gift className="w-4 h-4" />
          7 giorni di prova gratuita
        </div>
        <h1 className="text-4xl font-bold">
          Piano Premium con 7 giorni gratuiti
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Tutto quello che ti serve per i tuoi pet. Analisi illimitate, pet illimitati, AI insights avanzati.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            Sicuro al 100%
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-500" />
            Nessun pagamento ora
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            Cancella quando vuoi
          </div>
        </div>
      </div>

      {/* Current Usage Stats */}
      {subscription.subscribed && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Il tuo utilizzo
            </CardTitle>
            <CardDescription>
              Piano attuale: <Badge variant="outline" className="ml-1">Premium</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-6">
              <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                <CheckCircle className="w-6 h-6" />
                <span className="text-xl font-semibold">Utilizzo illimitato</span>
              </div>
              <p className="text-muted-foreground">
                Hai accesso a tutte le funzionalità premium senza limiti
              </p>
              {isEndOfPeriodCancellation && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Attivo fino al {cancellationEffectiveDate}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <Button onClick={openCustomerPortal} variant="outline" className="w-full">
                Gestisci abbonamento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Management Section */}
      {subscription.subscribed && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Gestione Abbonamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEndOfPeriodCancellation ? (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">⚠️ ABBONAMENTO IN CANCELLAZIONE</span>
                  </div>
                  <p className="text-sm text-yellow-800 mb-3">
                    Il tuo abbonamento Premium è stato cancellato ma rimane attivo fino al {cancellationEffectiveDate}
                  </p>
                </div>
                <Button 
                  onClick={() => setShowReactivationModal(true)}
                  className="w-full"
                  disabled={isProcessingCancellation}
                >
                  {isProcessingCancellation ? 'Elaborazione...' : 'RIATTIVA ABBONAMENTO'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Il tuo abbonamento Premium è attivo</p>
                  {subscription.subscription_end && (
                    <p className="text-sm text-muted-foreground">
                      Prossimo rinnovo: {new Date(subscription.subscription_end).toLocaleDateString('it-IT')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="destructive"
                    onClick={() => handleCancellation('immediate')}
                    disabled={isProcessingCancellation}
                    className="flex-1"
                  >
                    Cancella Immediatamente
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleCancellation('end_of_period')}
                    disabled={isProcessingCancellation}
                    className="flex-1"
                  >
                    Cancella a Fine Periodo
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Premium Plan Card */}
      <div className="max-w-md mx-auto">
        <Card className={cn(
          "relative transition-all duration-200 border-primary shadow-lg scale-105",
          subscription.subscribed && "ring-2 ring-green-500 border-green-500"
        )}>
          <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-blue-500 text-white">
            🎉 7 GIORNI GRATIS
          </Badge>
          
          {subscription.subscribed && (
            <Badge variant="secondary" className="absolute -top-3 right-4 z-50 bg-green-100 text-green-800 border-green-200">
              ✓ ATTIVO
            </Badge>
          )}
          
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle className="text-3xl text-primary">Premium</CardTitle>
            <CardDescription className="text-lg">Tutto quello che ti serve per i tuoi pet</CardDescription>
            <div className="pt-4 space-y-2">
              <div className="text-sm text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full">
                PROVA GRATUITA PER 7 GIORNI
              </div>
              <div>
                <span className="text-4xl font-bold text-primary">€0,97</span>
                <span className="text-muted-foreground">/mese</span>
              </div>
              <div className="text-sm text-muted-foreground">
                dopo 7 giorni gratis
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3">
              {[
                'Pet illimitati',
                'Analisi illimitate',
                'AI insights avanzati',
                'Music therapy',
                'Export completo',
                'Supporto prioritario',
                'Dashboard avanzata',
                'Notifiche personalizzate',
                'Backup automatico',
                'Accesso anticipato'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>

          <CardFooter className="pt-6">
            {subscription.subscribed ? (
              <div className="w-full space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Abbonamento Attivo
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Gestisci il tuo abbonamento nelle impostazioni
                </p>
              </div>
            ) : (
              <div className="w-full space-y-3">  
                <Button 
                  className="w-full text-lg py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" 
                  size="lg"
                  onClick={handleSubscribe}
                  disabled={processingPlan === 'premium' || loading}
                >
                  {processingPlan === 'premium' ? (
                    'Elaborazione...'
                  ) : (
                    <span className="flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      Inizia la Prova Gratuita
                    </span>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Nessun pagamento richiesto ora • Cancella quando vuoi
                </p>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Social Proof */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div>
            <div className="text-2xl font-bold text-foreground">10,000+</div>
            <div>Pet owners felici</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">50,000+</div>
            <div>Analisi completate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">4.9/5</div>
            <div>Rating medio</div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-8 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center">Domande frequenti</h2>
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">La prova gratuita è davvero gratis?</h3>
              <p className="text-muted-foreground">Sì! 7 giorni completamente gratuiti. Nessun pagamento richiesto all'inizio. Puoi cancellare prima della fine senza essere addebitato.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Posso cancellare in qualsiasi momento?</h3>
              <p className="text-muted-foreground">Assolutamente sì. Puoi cancellare il tuo abbonamento in qualsiasi momento. L'accesso alle funzioni premium continuerà fino alla fine del periodo di fatturazione.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">I dati sono sicuri?</h3>
              <p className="text-muted-foreground">Sì. Utilizziamo crittografia di livello bancario e rispettiamo tutte le normative GDPR per proteggere i tuoi dati.</p>
            </CardContent>
          </Card>
        </div>
      </div>

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
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>GDPR compliant</span>
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

      <UpgradeModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal} 
      />
    </div>
  );
};

export default SubscriptionPage;