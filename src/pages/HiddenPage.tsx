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
  const [selectedPlan, setSelectedPlan] = useState('premium');
  
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
      title: "Analisi Emozionale AI",
      description: "Analizza foto, video e audio per identificare 7 stati emotivi principali: felice, calmo, ansioso, eccitato, triste, aggressivo, giocoso.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Camera,
      title: "Monitoraggio Comportamentale",
      description: "Carica foto e video per ricevere insight comportamentali dettagliati e raccomandazioni personalizzate per il benessere.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Mic,
      title: "Analisi Audio Avanzata",
      description: "Registra i suoni del tuo pet per analizzare vocalizzazioni e comprendere il suo stato emotivo attraverso l'AI.",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: TrendingUp,
      title: "Dashboard & Statistiche",
      description: "Monitora i progressi con score di benessere, giorni consecutivi di analisi, miglioramenti e trend dettagliati.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Calendar,
      title: "Diario & Calendario",
      description: "Traccia le attività quotidiane, eventi importanti e gestisci promemoria per cure veterinarie e farmaci.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Music,
      title: "Musicoterapia AI",
      description: "Playlist personalizzate generate dall'AI basate sullo stato emotivo del tuo pet per favorire relax ed equilibrio.",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Users,
      title: "Community & Training",
      description: "Connettiti con altri pet owners, accedi a protocolli di addestramento AI e guide di primo soccorso.",
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: Shield,
      title: "Gestione Multi-Pet",
      description: "Gestisci tutti i tuoi animali domestici con profili separati, analisi individuali e monitoraggio centralizzato.",
      color: "from-emerald-500 to-green-500"
    }
  ];

  const plans = [
    {
      id: 'premium',
      name: 'PetVoice Premium',
      price: '€0,97',
      period: 'al mese',
      description: 'L\'unico piano disponibile - Completo e accessibile',
      features: [
        '🐕 Gestisci tutti i tuoi animali',
        '🧠 Analisi emotive avanzate con AI',
        '📊 Monitoraggio salute completo',
        '🎵 Musicoterapia personalizzata',
        '📅 Calendario veterinario integrato',
        '📝 Diario comportamentale dettagliato',
        '💊 Gestione farmaci e vaccinazioni',
        '📈 Statistiche e trend analitici',
        '📱 Sincronizzazione multi-dispositivo',
        '🆘 Supporto dedicato 24/7',
        '🏥 Guide di primo soccorso',
        '👥 Accesso alla community',
        '🎓 Protocolli di addestramento AI',
        '🌤️ Predittore mood meteorologico'
      ],
      popular: true,
      color: 'border-azure ring-2 ring-azure/20'
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
      question: "Come funziona l'analisi emotiva?",
      answer: "La nostra AI analizza foto, video e audio per identificare 7 stati emotivi principali: felice, calmo, ansioso, eccitato, triste, aggressivo e giocoso. Il sistema fornisce insights comportamentali e raccomandazioni personalizzate."
    },
    {
      question: "Quanto costa PetVoice?",
      answer: "PetVoice ha un unico piano Premium a €0,97 al mese che include tutte le funzionalità: analisi illimitate, gestione multi-pet, musicoterapia AI, calendario, diario, statistiche e supporto 24/7."
    },
    {
      question: "Posso gestire più animali?",
      answer: "Sì! Con PetVoice Premium puoi gestire tutti i tuoi animali domestici con profili individuali, analisi separate e monitoraggio centralizzato."
    },
    {
      question: "Cosa include la musicoterapia AI?",
      answer: "La musicoterapia AI genera playlist personalizzate basate sullo stato emotivo corrente del tuo pet per favorire relax, ridurre stress o aumentare l'energia secondo le necessità del momento."
    },
    {
      question: "È sicuro per i miei pet?",
      answer: "Assolutamente sì! PetVoice è completamente non invasivo. Analizza solo foto, video e audio senza alcun contatto fisico o dispositivo indossabile."
    },
    {
      question: "I miei dati sono protetti?",
      answer: "Usiamo crittografia avanzata e storage sicuro. I tuoi dati non vengono mai condivisi con terze parti e puoi eliminarli in qualsiasi momento dalla piattaforma."
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
              className="hover:bg-azure/10 transition-colors text-foreground hover:text-azure"
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

      {/* Floating Elements with enhanced animations */}
      <div className="absolute top-32 left-10 w-3 h-3 bg-azure rounded-full animate-bounce animate-gentle-float" />
      <div className="absolute top-40 right-20 w-2 h-2 bg-azure-light rounded-full animate-bounce animate-gentle-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-32 left-20 w-4 h-4 bg-azure/60 rounded-full animate-bounce animate-gentle-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-2/3 right-10 w-2 h-2 bg-azure-glow rounded-full animate-pulse animate-gentle-float" style={{ animationDelay: '3s' }} />
      <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-azure/40 rounded-full animate-ping animate-gentle-float" style={{ animationDelay: '0.5s' }} />

      {/* Main Content */}
      <div className="relative z-10 pt-20">
        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8 animate-bounce-in">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-3xl gradient-azure flex items-center justify-center mx-auto mb-6 shadow-glow animate-glow animate-gentle-float">
                  <span className="text-white font-bold text-4xl">🐾</span>
                </div>
                <div className="absolute -inset-2 bg-azure/20 rounded-3xl blur-lg -z-10 animate-pulse" />
              </div>
            </div>

            <h1 className="text-6xl lg:text-8xl font-bold leading-tight mb-8 animate-fade-in">
              <span className="text-foreground">Comprendi le</span>
              <br />
              <span className="text-azure font-black animate-pulse">
                emozioni
              </span>
              <br />
              <span className="text-foreground">del tuo pet</span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              L'intelligenza artificiale più avanzata per analizzare il comportamento e le emozioni 
              dei tuoi animali domestici. Crea un legame più profondo con chi ami.
            </p>

            <div className="flex justify-center mb-16 animate-scale-in" style={{ animationDelay: '0.4s' }}>
              <Button 
                onClick={handleGetStarted}
                className="petvoice-button px-8 py-4 font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-azure-light/20 to-azure/20 animate-shimmer"></div>
                <span>Prova PetVoice</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-muted-foreground animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="flex -space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-3 border-white/30 animate-gentle-float"></div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-3 border-white/30 animate-gentle-float" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-3 border-white/30 animate-gentle-float" style={{ animationDelay: '1s' }}></div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-3 border-white/30 animate-gentle-float" style={{ animationDelay: '1.5s' }}></div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-3 border-white/30 animate-gentle-float" style={{ animationDelay: '2s' }}></div>
              </div>
              <div className="text-center sm:text-left">
                <div className="font-semibold text-lg">25.000+ Amanti degli Animali</div>
                <div className="text-sm">si fidano di noi ogni giorno</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-gradient-to-b from-transparent to-card/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Perché <span className="text-azure font-bold">25.000+ amanti degli animali</span> scelgono PetVoice
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Tecnologia AI rivoluzionaria che trasforma il modo in cui comprendi il tuo amico a quattro zampe
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card 
                    key={index}
                    className="group p-8 bg-card/90 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl border border-azure/20 hover:border-azure/40 transition-all duration-500 hover:-translate-y-2 cursor-pointer animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 animate-gentle-float`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-azure transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-6 bg-gradient-to-b from-card/50 to-transparent backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                <span className="text-azure font-bold">Un solo piano</span>, tutte le funzionalità
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Accesso completo alle tecnologie AI più avanzate per il benessere del tuo pet.
              </p>
            </div>

            <div className="flex justify-center max-w-2xl mx-auto">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`relative p-10 bg-card/90 backdrop-blur-md rounded-2xl shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer ${plan.color} scale-105 animate-scale-in`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 animate-gentle-float">
                    <Badge className="bg-gradient-to-r from-azure to-azure-dark text-white px-6 py-2 font-bold text-lg">
                      <Crown className="w-5 h-5 mr-2" />
                      Piano Unico
                    </Badge>
                  </div>

                  <div className="text-center mb-10">
                    <h3 className="text-3xl font-bold text-foreground mb-4 animate-slide-up">{plan.name}</h3>
                    <div className="mb-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
                      <span className="text-6xl font-bold text-azure">{plan.price}</span>
                      <span className="text-xl text-muted-foreground ml-3">{plan.period}</span>
                    </div>
                    <p className="text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>{plan.description}</p>
                  </div>

                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-foreground text-lg animate-slide-in-left" style={{ animationDelay: `${index * 0.05}s` }}>
                        <Check className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full h-14 petvoice-button font-bold text-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group animate-bounce-in"
                    onClick={handleGetStarted}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-azure-light/20 to-azure/20 animate-shimmer"></div>
                    <Crown className="w-6 h-6 mr-3 relative z-10" />
                    <span className="relative z-10">Attiva PetVoice Premium</span>
                  </Button>
                  
                  <div className="text-center mt-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.8s' }}>
                    💳 Pagamento sicuro • 🔄 Cancella quando vuoi
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-6 bg-gradient-to-br from-azure/10 to-transparent backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Amato da professionisti <span className="text-azure font-bold">in tutta Italia</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card 
                  key={index} 
                  className="p-8 bg-card/90 backdrop-blur-md rounded-2xl shadow-lg border border-azure/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-in-right"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="flex items-center space-x-1 mb-6 animate-fade-in" style={{ animationDelay: `${index * 0.2 + 0.1}s` }}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current animate-bounce-in" style={{ animationDelay: `${index * 0.2 + i * 0.1}s` }} />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic leading-relaxed animate-slide-up" style={{ animationDelay: `${index * 0.2 + 0.2}s` }}>
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center space-x-4 animate-fade-in" style={{ animationDelay: `${index * 0.2 + 0.3}s` }}>
                    <div className={`w-12 h-12 bg-gradient-to-br ${testimonial.avatar} rounded-full animate-gentle-float`} style={{ animationDelay: `${index}s` }}></div>
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
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Domande <span className="text-azure font-bold">Frequenti</span>
              </h2>
              <p className="text-xl text-muted-foreground">
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
            <h2 className="text-5xl font-bold text-foreground mb-6">
              Pronto a scoprire cosa <br />
              <span className="text-azure font-bold">prova veramente</span> il tuo pet?
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Unisciti a migliaia di amanti degli animali che hanno già migliorato la relazione con i loro amici a quattro zampe
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
              <Button 
                onClick={handleGetStarted}
                className="px-8 py-4 bg-white text-azure font-bold text-lg rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
              >
                Attiva PetVoice Premium
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
            
            <div className="text-muted-foreground text-sm space-y-2">
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <span className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-400" />
                  Solo €0,97 al mese
                </span>
                <span className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-400" />
                  Tutte le funzionalità incluse
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
              
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
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