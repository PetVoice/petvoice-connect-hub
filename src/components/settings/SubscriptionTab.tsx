import React, { useState } from 'react';
import { Check, Crown, CheckCircle, Settings, AlertTriangle, Shield, CreditCard, Trash2, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { CancellationModal } from '@/components/CancellationModal';
import { ReactivationModal } from '@/components/ReactivationModal';

const SubscriptionTab = () => {
  const { subscription, loading, createCheckoutSession, openCustomerPortal, cancelSubscription, reactivateSubscription } = useSubscription();
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [showReactivationModal, setShowReactivationModal] = useState(false);
  const [cancellationType, setCancellationType] = useState<'immediate' | 'end_of_period'>('end_of_period');
  const [cancelLoading, setCancelLoading] = useState(false);

  const handleSubscribe = async () => {
    setSubscribeLoading(true);
    const checkoutUrl = await createCheckoutSession();
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
    console.log('🚀 BEFORE REACTIVATION - subscription state:', {
      subscribed: subscription.subscribed,
      subscription_end: subscription.subscription_end,
      cancellation_effective_date: subscription.cancellation_effective_date,
      is_cancelled: subscription.is_cancelled,
      cancellation_type: subscription.cancellation_type
    });
    
    const success = await reactivateSubscription();
    setCancelLoading(false);
    if (success) {
      console.log('✅ AFTER REACTIVATION - subscription state:', {
        subscribed: subscription.subscribed,
        subscription_end: subscription.subscription_end,
        cancellation_effective_date: subscription.cancellation_effective_date,
        is_cancelled: subscription.is_cancelled,
        cancellation_type: subscription.cancellation_type
      });
      setShowReactivationModal(false);
    }
  };

  const usageStats = subscription.usage;
  const analysesUsed = usageStats?.analyses_this_month || 0;
  
  // Check if subscription is cancelled but still active
  const isCancelled = subscription.is_cancelled;
  const isEndOfPeriodCancellation = subscription.cancellation_type === 'end_of_period' && subscription.cancellation_effective_date;
  const canReactivate = subscription.can_reactivate !== false; // Default true se non specificato
  const cancellationEffectiveDate = subscription.cancellation_effective_date 
    ? new Date(subscription.cancellation_effective_date).toLocaleDateString('it-IT')
    : '';

  // Calcola giorni rimanenti al rinnovo - usa cancellation_effective_date se l'abbonamento è cancellato
  const calculateDaysToRenewal = () => {
    const effectiveEndDate = isEndOfPeriodCancellation 
      ? subscription.cancellation_effective_date 
      : subscription.subscription_end;
      
    if (!effectiveEndDate) return null;
    
    const endDate = new Date(effectiveEndDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  const daysToRenewal = calculateDaysToRenewal();

  // Debug logging per troubleshooting
  console.log('🔍 Subscription Debug:', {
    subscribed: subscription.subscribed,
    is_cancelled: subscription.is_cancelled,
    cancellation_type: subscription.cancellation_type,
    can_reactivate: subscription.can_reactivate,
    isCancelled,
    isEndOfPeriodCancellation,
    canReactivate,
    daysToRenewal,
    subscription_end: subscription.subscription_end,
    cancellation_effective_date: subscription.cancellation_effective_date,
    shouldShowCard: !!(subscription.subscription_end || subscription.cancellation_effective_date),
    shouldShowReactivationSection: isEndOfPeriodCancellation
  });

  // Show loading skeleton during initial load
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            🎵 PetVoice Premium
          </h2>
          <p className="text-lg text-muted-foreground">
            L'unico piano disponibile per sbloccare tutto il potenziale di PetVoice
          </p>
        </div>
        
        <Card className="petvoice-card">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Caricamento stato abbonamento...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4">
      {/* Header Section */}
      <div className="text-center space-y-6 py-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-full blur-3xl"></div>
          <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary shadow-2xl">
            <Crown className="w-12 h-12 text-primary-foreground drop-shadow-lg" />
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-5xl font-black bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
            PetVoice Premium
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Il piano completo per prenderti cura al meglio del tuo amico a quattro zampe
          </p>
        </div>
      </div>

      {/* Main Content */}
      {subscription.subscribed ? (
        // Active Subscription Layout
        <div className="space-y-8">
          {/* Status Card */}
          <Card className="relative overflow-hidden border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-green-50/30 dark:from-emerald-950/20 dark:to-green-950/10 dark:border-emerald-700">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-500/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <CardHeader className="text-center pb-6 relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500 mb-4 shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                Abbonamento Attivo
              </CardTitle>
              <CardDescription className="text-lg text-emerald-600 dark:text-emerald-300">
                Stai sfruttando tutte le funzionalità premium
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 relative z-10">
              {/* Subscription Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-emerald-200 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Piano Attuale</div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Premium</div>
                    <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">€0,97/mese</div>
                  </CardContent>
                </Card>
                
                {(subscription.subscription_end || subscription.cancellation_effective_date) && (
                  <Card className="border-emerald-200 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                    <CardContent className="p-6 text-center">
                      <div className="text-sm font-medium text-muted-foreground mb-2">Valido fino al</div>
                      <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                        {new Date(
                          isEndOfPeriodCancellation 
                            ? subscription.cancellation_effective_date! 
                            : subscription.subscription_end!
                        ).toLocaleDateString('it-IT')}
                      </div>
                      {daysToRenewal !== null && (
                        <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                          {daysToRenewal} giorni rimanenti
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Warning for Cancelled Subscription */}
              {isEndOfPeriodCancellation && (
                <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-700">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="w-5 h-5" />
                      Abbonamento in Cancellazione
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-amber-600 dark:text-amber-300">
                      Il tuo abbonamento è stato cancellato ma rimane attivo fino al {cancellationEffectiveDate}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                {!isCancelled && (
                  <>
                    <Button
                      onClick={() => handleCancelSubscription('immediate')}
                      variant="destructive"
                      size="lg"
                      disabled={cancelLoading}
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Cancella Subito
                    </Button>
                    
                    <Button
                      onClick={() => handleCancelSubscription('end_of_period')}
                      variant="outline"
                      size="lg"
                      disabled={cancelLoading}
                      className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Cancella a Fine Periodo
                    </Button>
                  </>
                )}

                {isEndOfPeriodCancellation && canReactivate && (
                  <Button 
                    onClick={() => setShowReactivationModal(true)}
                    size="lg"
                    disabled={cancelLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Riattiva Abbonamento
                  </Button>
                )}
                
                <Button
                  onClick={handleOpenCustomerPortal}
                  size="lg"
                  disabled={portalLoading}
                  className="w-full bg-primary hover:bg-primary/90 shadow-lg"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Gestisci Pagamenti
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Subscription Upgrade Layout
        <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/5">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full translate-y-24 -translate-x-24"></div>
          </div>
          
          <CardHeader className="text-center pb-8 relative z-10">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"></div>
              <div className="relative inline-flex items-center justify-center w-28 h-28 rounded-full bg-primary shadow-2xl">
                <Crown className="w-14 h-14 text-primary-foreground drop-shadow-lg" />
              </div>
            </div>
            
            <div className="space-y-4">
              <CardTitle className="text-5xl font-black bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                PETVOICE PREMIUM
              </CardTitle>
              <div className="space-y-2">
                <div className="text-6xl font-black text-primary drop-shadow-sm">€0,97</div>
                <div className="text-2xl text-muted-foreground font-medium">/mese</div>
              </div>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Sblocca tutte le funzionalità avanzate per il benessere del tuo pet
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8 relative z-10">
            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: "🐕", title: "Gestione Multi-Pet", desc: "Tutti i tuoi animali in un unico posto" },
                { icon: "🧠", title: "AI Avanzata", desc: "Analisi emotive e comportamentali" },
                { icon: "📊", title: "Monitoraggio Salute", desc: "Tracking completo del benessere" },
                { icon: "🎵", title: "Musicoterapia", desc: "Playlist personalizzate per il relax" },
                { icon: "📅", title: "Calendario Vet", desc: "Promemoria e appuntamenti" },
                { icon: "📝", title: "Diario Comportamentale", desc: "Registra e analizza i progressi" },
                { icon: "💊", title: "Gestione Farmaci", desc: "Non dimenticare mai una dose" },
                { icon: "📈", title: "Analytics Premium", desc: "Statistiche dettagliate e trend" },
                { icon: "📱", title: "Sync Multi-Device", desc: "Accesso da tutti i tuoi dispositivi" },
                { icon: "🆘", title: "Supporto Prioritario", desc: "Assistenza dedicata 24/7" }
              ].map((feature, index) => (
                <Card key={index} className="group p-4 border-primary/20 bg-white/50 dark:bg-black/20 backdrop-blur-sm hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{feature.title}</div>
                      <div className="text-sm text-muted-foreground">{feature.desc}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* CTA Button */}
            <div className="space-y-6">
              <Button
                onClick={handleSubscribe}
                size="lg"
                disabled={subscribeLoading}
                className="w-full py-8 text-xl font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                {subscribeLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Elaborazione in corso...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Crown className="w-6 h-6 mr-3" />
                    ATTIVA PREMIUM ORA
                  </div>
                )}
              </Button>

              {/* Security Badge */}
              <Card className="p-4 bg-muted/30 border-muted">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="w-4 h-4" />
                  <span>Pagamento sicuro con Stripe • Cancellabile in qualsiasi momento</span>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
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

export default SubscriptionTab;