import React, { useState } from 'react';
import { Check, Crown, Users, Zap, Shield, CreditCard, BarChart3, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';

const SubscriptionPage = () => {
  const { subscription, loading, createCheckoutSession, openCustomerPortal } = useSubscription();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: 'premium' | 'family') => {
    setProcessingPlan(plan);
    const checkoutUrl = await createCheckoutSession(plan);
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
    }
    setProcessingPlan(null);
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '€0',
      period: '/mese',
      description: 'Perfetto per iniziare',
      features: [
        '1 pet',
        '5 analisi al mese',
        'Features base',
        'Accesso community',
        'Supporto email'
      ],
      limitations: [
        'Analisi limitate',
        'Nessun insight AI',
        'Export limitato'
      ],
      popular: false,
      current: subscription.subscription_tier === 'free'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '€0,97',
      period: '/mese',
      description: 'Il piano più popolare',
      features: [
        'Pet illimitati',
        'Analisi illimitate',
        'AI insights avanzati',
        'Music therapy',
        'Export completo',
        'Supporto prioritario',
        'Dashboard avanzata',
        'Notifiche personalizzate'
      ],
      limitations: [],
      popular: true,
      current: subscription.subscription_tier === 'premium'
    },
    {
      id: 'family',
      name: 'Family',
      price: '€1,97',
      period: '/mese',
      description: 'Perfetto per famiglie',
      features: [
        'Tutto del Premium',
        '6 account connessi',
        'Pet condivisi',
        'Group challenges',
        'Statistiche famiglia',
        'Gestione multiutente',
        'Backup automatico',
        'Support dedicato'
      ],
      limitations: [],
      popular: false,
      current: subscription.subscription_tier === 'family'
    }
  ];

  const faqItems = [
    {
      question: "Posso cancellare in qualsiasi momento?",
      answer: "Sì, puoi cancellare il tuo abbonamento in qualsiasi momento. L'accesso alle funzioni premium continuerà fino alla fine del periodo di fatturazione corrente."
    },
    {
      question: "C'è un periodo di prova gratuito?",
      answer: "Sì! Tutti i piani premium includono 7 giorni di prova gratuita. Puoi cancellare prima della fine del periodo di prova senza essere addebitato."
    },
    {
      question: "Posso cambiare piano in qualsiasi momento?",
      answer: "Certamente! Puoi effettuare l'upgrade o il downgrade del tuo piano in qualsiasi momento tramite il portale di gestione."
    },
    {
      question: "I dati sono sicuri?",
      answer: "Assolutamente sì. Utilizziamo crittografia di livello bancario e rispettiamo tutte le normative GDPR per proteggere i tuoi dati."
    }
  ];

  const testimonials = [
    {
      name: "Maria Rossi",
      text: "PetVoice ha trasformato il modo in cui capisco il mio cane. Le analisi AI sono incredibilmente accurate!",
      plan: "Premium"
    },
    {
      name: "Luca Bianchi", 
      text: "Il piano Family ci permette di monitorare tutti i nostri animali insieme. Fantastico per famiglie numerose!",
      plan: "Family"
    },
    {
      name: "Elena Verde",
      text: "Dopo 3 mesi di utilizzo, il comportamento del mio gatto è migliorato moltissimo grazie ai consigli dell'AI.",
      plan: "Premium"
    }
  ];

  const usageStats = subscription.usage;
  const analysesUsed = usageStats?.analyses_this_month || 0;
  const analysesLimit = subscription.subscription_tier === 'free' ? 5 : Infinity;
  const analysesPercentage = subscription.subscription_tier === 'free' ? (analysesUsed / analysesLimit) * 100 : 0;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
          <Gift className="w-4 h-4" />
          7 giorni di prova gratuita
        </div>
        <h1 className="text-4xl font-bold">
          Scegli il piano perfetto per te e i tuoi pet
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Sblocca il potenziale completo di PetVoice con analisi AI avanzate, 
          insights comportamentali e supporto prioritario.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            Sicuro al 100%
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-500" />
            Garanzia 30 giorni
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            Cancellazione istantanea
          </div>
        </div>
      </div>

      {/* Current Usage Stats */}
      {subscription.subscription_tier && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Il tuo utilizzo attuale
            </CardTitle>
            <CardDescription>
              Piano attuale: <Badge variant="outline" className="ml-1">
                {subscription.subscription_tier.charAt(0).toUpperCase() + subscription.subscription_tier.slice(1)}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Analisi questo mese</span>
                  <span className="font-medium">
                    {analysesUsed}
                    {subscription.subscription_tier === 'free' && ` / ${analysesLimit}`}
                  </span>
                </div>
                {subscription.subscription_tier === 'free' && (
                  <Progress value={analysesPercentage} className="h-2" />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pet registrati</span>
                  <span className="font-medium">{usageStats?.total_pets || 0}</span>
                </div>
              </div>
            </div>
            {subscription.subscribed && (
              <div className="pt-4 border-t">
                <Button onClick={openCustomerPortal} variant="outline" className="w-full">
                  Gestisci abbonamento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={cn(
              "relative transition-all duration-200",
              plan.popular && "border-primary shadow-lg scale-105",
              plan.current && "ring-2 ring-primary"
            )}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                Più popolare
              </Badge>
            )}
            {plan.current && (
              <Badge variant="secondary" className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                Piano attuale
              </Badge>
            )}
            
            <CardHeader className="text-center pb-8">
              <div className={cn(
                "w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4",
                plan.id === 'free' && "bg-gray-100",
                plan.id === 'premium' && "bg-gradient-to-br from-purple-100 to-blue-100",
                plan.id === 'family' && "bg-gradient-to-br from-green-100 to-blue-100"
              )}>
                {plan.id === 'free' && <Shield className="w-6 h-6" />}
                {plan.id === 'premium' && <Crown className="w-6 h-6 text-purple-600" />}
                {plan.id === 'family' && <Users className="w-6 h-6 text-green-600" />}
              </div>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
                {plan.id !== 'free' && (
                  <div className="text-sm text-green-600 font-medium mt-1">
                    Risparmia 20% con il piano annuale
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              {plan.limitations.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Limitazioni:</p>
                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-center gap-3 text-muted-foreground">
                        <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                        </div>
                        <span className="text-sm">{limitation}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>

            <CardFooter>
              {plan.current ? (
                <Button variant="outline" className="w-full" disabled>
                  Piano attuale
                </Button>
              ) : plan.id === 'free' ? (
                <Button variant="outline" className="w-full" disabled>
                  Piano gratuito
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  className="w-full hover-scale transition-all duration-200" 
                  onClick={() => handleSubscribe(plan.id as 'premium' | 'family')}
                  disabled={loading || processingPlan === plan.id}
                >
                  {processingPlan === plan.id ? 'Elaborazione...' : `Inizia con ${plan.name}`}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
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

      {/* Testimonials */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center">Cosa dicono i nostri utenti</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <p className="text-muted-foreground italic mb-4">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <Badge variant="outline" className="mt-1">{testimonial.plan}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-8 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center">Domande frequenti</h2>
        <div className="space-y-6">
          {faqItems.map((item, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">{item.question}</h3>
                <p className="text-muted-foreground">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
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
    </div>
  );
};

export default SubscriptionPage;