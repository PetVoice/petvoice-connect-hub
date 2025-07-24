import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  ArrowLeft, Sun, Moon, Star, Sparkles, Heart, Brain, Camera, Mic, 
  TrendingUp, Calendar, Music, Users, Shield, Zap, Check, ArrowRight,
  Play, MessageCircle, BarChart3, Palette, Globe, Smartphone, Award,
  Lock, Crown, Infinity
} from 'lucide-react';

const HiddenPage: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState('pro');
  
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const features = [
    {
      icon: Brain,
      title: "AI Emotion Recognition",
      description: "La nostra IA avanzata analizza espressioni facciali, postura e comportamento per identificare 15+ stati emotivi diversi del tuo pet.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Camera,
      title: "Analisi Foto & Video",
      description: "Carica foto o registra video per ricevere insight istantanei. Supporta analisi in tempo reale e storico delle emozioni.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Mic,
      title: "Riconoscimento Vocale",
      description: "Analizza miagolii, abbai e altri suoni per comprendere lo stato emotivo attraverso pattern vocali unici.",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: TrendingUp,
      title: "Analytics Avanzate",
      description: "Dashboard completa con grafici interattivi, trend temporali e report personalizzati sul benessere del tuo pet.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Calendar,
      title: "Calendario Benessere",
      description: "Traccia eventi, mood giornalieri e crea routine personalizzate basate sui pattern emotivi del tuo pet.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Music,
      title: "Terapia Musicale AI",
      description: "Genera playlist personalizzate basate sullo stato emotivo corrente per rilassare o energizzare il tuo pet.",
      color: "from-pink-500 to-rose-500"
    }
  ];

  const plans = [
    {
      id: 'free',
      name: 'Starter',
      price: 'Gratis',
      period: 'sempre',
      description: 'Perfetto per iniziare',
      features: [
        '5 analisi al mese',
        'Riconoscimento emotivo base',
        'Dashboard semplificata',
        'Supporto community'
      ],
      popular: false,
      color: 'border-gray-200'
    },
    {
      id: 'pro',
      name: 'Professional',
      price: '29€',
      period: 'al mese',
      description: 'Per pet parents appassionati',
      features: [
        'Analisi illimitate',
        'AI emotion recognition avanzata',
        'Analytics complete',
        'Calendario benessere',
        'Terapia musicale AI',
        'Supporto prioritario',
        'Export dati',
        'API access'
      ],
      popular: true,
      color: 'border-azure ring-2 ring-azure/20'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '59€',
      period: 'al mese',
      description: 'Soluzione completa per professionisti',
      features: [
        'Tutto del piano Pro',
        'Multi-pet (illimitati)',
        'White-label dashboard',
        'Integrazioni veterinarie',
        'Consulenze personalizzate',
        'Training AI personalizzato',
        'Supporto dedicato 24/7',
        'Custom features'
      ],
      popular: false,
      color: 'border-yellow-400'
    }
  ];

  const testimonials = [
    {
      name: "Dr. Maria Rossi",
      role: "Veterinaria",
      content: "PetVoice ha rivoluzionato il modo in cui comprendo i miei pazienti. L'accuratezza dell'AI è impressionante.",
      rating: 5,
      avatar: "from-blue-400 to-blue-600"
    },
    {
      name: "Luca Romano",
      role: "Pet Owner",
      content: "Finalmente capisco quando Luna è stressata! Ha migliorato significativamente la nostra relazione.",
      rating: 5,
      avatar: "from-green-400 to-green-600"
    },
    {
      name: "Sofia Chen",
      role: "Dog Trainer",
      content: "Uso PetVoice con tutti i miei clienti. I risultati sono tangibili e i proprietari sono entusiasti.",
      rating: 5,
      avatar: "from-purple-400 to-purple-600"
    }
  ];

  const faqs = [
    {
      question: "Come funziona il riconoscimento emotivo?",
      answer: "La nostra AI analizza micro-espressioni, postura corporea, movimenti e pattern vocali usando algoritmi di deep learning addestrati su migliaia di ore di video di animali domestici."
    },
    {
      question: "È sicuro per il mio pet?",
      answer: "Assolutamente sì! PetVoice è completamente non invasivo. Analizza solo foto, video e audio senza alcun contatto fisico o dispositivo indossabile."
    },
    {
      question: "Quanto è accurato il sistema?",
      answer: "I nostri test mostrano un'accuratezza del 94% nel riconoscimento degli stati emotivi principali, confermata da veterinari e comportamentalisti."
    },
    {
      question: "Posso usarlo con più animali?",
      answer: "Con il piano Professional puoi aggiungere fino a 3 pet, mentre il Premium supporta animali illimitati con profili individuali."
    },
    {
      question: "I miei dati sono al sicuro?",
      answer: "Usiamo crittografia end-to-end e storage sicuro. I tuoi dati non vengono mai condivisi e puoi eliminarli in qualsiasi momento."
    }
  ];

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-azure/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl gradient-azure flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-azure to-azure-dark bg-clip-text text-transparent">
              PetVoice
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <div className="flex items-center gap-1 p-1 bg-background/50 rounded-lg border border-azure/20">
              <Button
                variant={theme === 'light' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTheme('light')}
                className={`h-8 w-8 p-0 ${theme === 'light' ? 'bg-azure text-white' : 'hover:bg-azure/10'}`}
              >
                <Sun className="h-4 w-4" />
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTheme('dark')}
                className={`h-8 w-8 p-0 ${theme === 'dark' ? 'bg-azure text-white' : 'hover:bg-azure/10'}`}
              >
                <Moon className="h-4 w-4" />
              </Button>
            </div>

            {/* Action Buttons */}
            <Button
              variant="ghost"
              onClick={handleGoBack}
              className="hover:bg-azure/10 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button
              onClick={handleGetStarted}
              className="petvoice-button font-medium group"
            >
              Inizia Ora
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-azure/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-azure/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-azure/8 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-32 left-10 w-3 h-3 bg-azure rounded-full animate-bounce" />
      <div className="absolute top-40 right-20 w-2 h-2 bg-azure-light rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-32 left-20 w-4 h-4 bg-azure/60 rounded-full animate-bounce" style={{ animationDelay: '2s' }} />

      {/* Main Content */}
      <div className="relative z-10 pt-20">
        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8 animate-bounce-in">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-3xl gradient-azure flex items-center justify-center mx-auto mb-6 shadow-glow animate-glow">
                  <span className="text-white font-bold text-4xl">🐾</span>
                </div>
                <div className="absolute -inset-2 bg-azure/20 rounded-3xl blur-lg -z-10 animate-pulse" />
              </div>
            </div>

            <h1 className="text-6xl lg:text-8xl font-bold leading-tight mb-8">
              <span className="text-white">Comprendi le</span>
              <br />
              <span className="bg-gradient-to-r from-azure via-azure-light to-azure-glow bg-clip-text text-transparent animate-pulse">
                emozioni
              </span>
              <br />
              <span className="text-white">del tuo pet</span>
            </h1>

            <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto mb-12">
              L'intelligenza artificiale più avanzata per analizzare il comportamento e le emozioni 
              dei tuoi animali domestici. Crea un legame più profondo con chi ami.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button 
                onClick={handleGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-azure to-azure-dark text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
              >
                <span>Inizia Gratis</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline"
                className="px-8 py-4 border-2 border-white/30 hover:border-azure text-white hover:text-azure rounded-xl font-semibold text-lg transition-all duration-300 group bg-white/10 backdrop-blur-sm"
              >
                <Play className="mr-2 w-5 h-5" />
                <span>Guarda Demo</span>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-white/80">
              <div className="flex -space-x-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-br from-azure to-azure-dark border-3 border-white/30"></div>
                ))}
              </div>
              <div className="text-center sm:text-left">
                <div className="font-semibold text-lg">25.000+ Pet Parents</div>
                <div className="text-sm">si fidano di noi ogni giorno</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-gradient-to-b from-transparent to-card/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Perché <span className="text-azure-light">25.000+ pet parents</span> scelgono PetVoice
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Tecnologia AI rivoluzionaria che trasforma il modo in cui comprendi il tuo amico a quattro zampe
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card 
                    key={index}
                    className="group p-8 bg-card/90 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl border border-azure/20 hover:border-azure/40 transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-azure transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    <div className="flex items-center text-azure font-medium group-hover:translate-x-2 transition-transform">
                      <span>Scopri di più</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-6 bg-gradient-to-b from-card/50 to-transparent backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Scegli il piano <span className="text-azure-light">perfetto</span> per te
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Inizia gratis e scala in base alle tue esigenze. Tutti i piani includono la nostra garanzia di soddisfazione.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`relative p-8 bg-card/90 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer ${plan.color} ${plan.popular ? 'scale-105' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-azure to-azure-dark text-white px-4 py-1 font-semibold">
                        <Crown className="w-4 h-4 mr-1" />
                        Più Popolare
                      </Badge>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-azure">{plan.price}</span>
                      <span className="text-muted-foreground ml-2">{plan.period}</span>
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-foreground">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full h-12 font-semibold text-lg transition-all duration-300 ${
                      plan.popular 
                        ? 'petvoice-button hover:scale-105' 
                        : 'border-2 border-azure text-azure hover:bg-azure hover:text-white bg-transparent'
                    }`}
                    onClick={handleGetStarted}
                  >
                    {plan.id === 'free' ? 'Inizia Gratis' : 'Inizia Prova Gratuita'}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-6 bg-gradient-to-br from-azure/10 to-transparent backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Amato da professionisti <span className="text-azure-light">in tutta Italia</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-8 bg-card/90 backdrop-blur-md rounded-2xl shadow-lg border border-azure/20 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center space-x-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${testimonial.avatar} rounded-full`}></div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Domande <span className="text-azure-light">Frequenti</span>
              </h2>
              <p className="text-xl text-white/80">
                Tutto quello che devi sapere su PetVoice
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="p-6 bg-card/90 backdrop-blur-md border border-azure/20 hover:border-azure/40 transition-all duration-300">
                  <h3 className="text-lg font-semibold text-foreground mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6 bg-gradient-to-r from-azure/20 via-azure/10 to-azure/20 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-bold text-white mb-6">
              Pronto a scoprire cosa <br />
              <span className="text-azure-light">prova veramente</span> il tuo pet?
            </h2>
            
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Unisciti a migliaia di pet parents che hanno già migliorato la relazione con i loro amici a quattro zampe
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
              <Button 
                onClick={handleGetStarted}
                className="px-8 py-4 bg-white text-azure font-bold text-lg rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
              >
                Inizia Gratis Ora
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline"
                className="px-8 py-4 border-2 border-white text-white font-bold text-lg rounded-xl hover:bg-white hover:text-azure transition-all duration-300 bg-white/10 backdrop-blur-sm"
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                Contatta il Team
              </Button>
            </div>
            
            <div className="text-white/80 text-sm space-y-2">
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <span className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-400" />
                  Prova gratuita 14 giorni
                </span>
                <span className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-400" />
                  Nessuna carta richiesta
                </span>
                <span className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-400" />
                  Cancella quando vuoi
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-azure/20 bg-card/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="w-10 h-10 rounded-xl gradient-azure flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-azure to-azure-dark bg-clip-text text-transparent">
                  PetVoice
                </span>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-white/70">
                <span>© 2024 PetVoice. Tutti i diritti riservati.</span>
                <div className="flex items-center space-x-4">
                  <span>Privacy</span>
                  <span>Termini</span>
                  <span>Supporto</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HiddenPage;