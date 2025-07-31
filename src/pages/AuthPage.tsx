import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Moon, Sun, ArrowLeft, Heart, Shield, Zap, Users, Star, Play, CheckCircle, MessageSquare, Calendar, Bell, Mail, Lock, ArrowRight, Sparkles, ChevronDown, Menu, X } from 'lucide-react';
import { TermsOfService, PrivacyPolicy, LicenseAgreement } from '@/components/legal/LegalDocuments';

const AuthPage: React.FC = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMode, setResetMode] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  const { user, signIn, signUp, resetPassword } = useAuth();
  const { theme, setTheme } = useTheme();

  // Redirect authenticated users
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    console.log('handleLogin called');
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    if (!error) {
      setAuthModalOpen(false);
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(registerEmail, registerPassword, displayName);
    setLoading(false);
    if (!error) {
      setRegisterEmail('');
      setRegisterPassword('');
      setDisplayName('');
      setAuthModalOpen(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(resetEmail);
    setLoading(false);
    if (!error) {
      setResetMode(false);
      setResetEmail('');
    }
  };

  const features = [
    {
      icon: Heart,
      title: "Analisi Emotiva",
      description: "AI avanzata per riconoscere lo stato emotivo del tuo animale attraverso voce, comportamento e foto"
    },
    {
      icon: Shield,
      title: "Sicurezza Totale",
      description: "I dati dei tuoi animali sono protetti con crittografia end-to-end e privacy garantita"
    },
    {
      icon: Zap,
      title: "Risultati Istantanei",
      description: "Ottieni analisi in tempo reale con raccomandazioni personalizzate per il benessere"
    },
    {
      icon: Users,
      title: "Community",
      description: "Connettiti con altri proprietari di animali e condividi esperienze nella nostra community"
    }
  ];

  const stats = [
    { number: "50K+", label: "Animali Analizzati" },
    { number: "95%", label: "Precisione AI" },
    { number: "24/7", label: "Supporto Attivo" },
    { number: "4.9★", label: "Rating Utenti" }
  ];

  const steps = [
    {
      step: "1",
      title: "Registra il tuo Pet",
      description: "Crea un profilo per il tuo animale con foto e informazioni base"
    },
    {
      step: "2", 
      title: "Cattura i Momenti",
      description: "Registra video, audio o scatta foto del comportamento del tuo animale"
    },
    {
      step: "3",
      title: "Analisi AI",
      description: "La nostra intelligenza artificiale analizza i dati per comprendere lo stato emotivo"
    },
    {
      step: "4",
      title: "Ricevi Insights",
      description: "Ottieni report dettagliati e consigli personalizzati per il benessere"
    }
  ];

  const testimonials = [
    {
      name: "Maria Rossi",
      role: "Proprietaria di Luna",
      content: "PetVoice mi ha aiutato a capire quando Luna era stressata. Ora posso intervenire prima che il problema peggiori.",
      rating: 5
    },
    {
      name: "Giuseppe Bianchi", 
      role: "Veterinario",
      content: "Uso PetVoice per i miei pazienti. L'analisi comportamentale è incredibilmente precisa e utile per le diagnosi.",
      rating: 5
    },
    {
      name: "Anna Verde",
      role: "Proprietaria di Max",
      content: "La community di PetVoice è fantastica. Ho trovato supporto e consigli preziosi da altri proprietari.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-azure flex items-center justify-center">
                <span className="text-white font-bold text-xl">🐾</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-azure to-azure-dark bg-clip-text text-transparent">
                PetVoice
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-foreground/80 hover:text-azure transition-colors">Features</a>
              <a href="#how-it-works" className="text-foreground/80 hover:text-azure transition-colors">Come Funziona</a>
              <a href="#testimonials" className="text-foreground/80 hover:text-azure transition-colors">Testimonianze</a>
            </div>

            {/* Theme Toggle & CTA */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="w-9 h-9 p-0"
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              
              <Button onClick={() => setAuthModalOpen(true)} className="hidden md:flex">
                Prova Ora
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden w-9 h-9 p-0"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border/40 py-4 space-y-3">
              <a href="#features" className="block text-foreground/80 hover:text-azure transition-colors">Features</a>
              <a href="#how-it-works" className="block text-foreground/80 hover:text-azure transition-colors">Come Funziona</a>
              <a href="#testimonials" className="block text-foreground/80 hover:text-azure transition-colors">Testimonianze</a>
              <Button onClick={() => setAuthModalOpen(true)} className="w-full mt-4">
                Prova Ora
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 gradient-hero relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-azure/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-azure/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-azure/8 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-azure-light to-white bg-clip-text text-transparent animate-fade-in">
              Comprendi le Emozioni del Tuo Pet
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Intelligenza artificiale avanzata per analizzare comportamenti, suoni e stati emotivi dei tuoi animali domestici
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Button 
                size="lg" 
                className="text-lg px-8 py-4 h-auto group"
                onClick={() => setAuthModalOpen(true)}
              >
                 Prova Ora
                 <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
               </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-white/80 text-sm md:text-base">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-white/80" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Funzionalità <span className="bg-gradient-to-r from-azure to-azure-dark bg-clip-text text-transparent">Innovative</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Tecnologie all'avanguardia per il benessere e la comprensione dei tuoi animali domestici
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-azure/20">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full gradient-azure flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Come <span className="bg-gradient-to-r from-azure to-azure-dark bg-clip-text text-transparent">Funziona</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Semplice, veloce e preciso. In pochi passaggi comprendi meglio il tuo animale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-azure/50 to-transparent transform translate-x-4" />
                )}
                
                <div className="w-16 h-16 mx-auto rounded-full gradient-azure flex items-center justify-center text-white font-bold text-xl mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Cosa Dicono i <span className="bg-gradient-to-r from-azure to-azure-dark bg-clip-text text-transparent">Nostri Utenti</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Migliaia di proprietari di animali si affidano a PetVoice ogni giorno
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-azure/20">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-azure text-azure" />
                    ))}
                  </div>
                  <CardDescription className="text-base">"{testimonial.content}"</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 gradient-azure text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Inizia il Viaggio con il Tuo Pet
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Unisciti a migliaia di proprietari che hanno già migliorato la relazione con i loro animali
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-4 h-auto bg-white text-azure hover:bg-white/90"
            onClick={() => setAuthModalOpen(true)}
          >
            Prova Ora
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/40">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-azure flex items-center justify-center">
                <span className="text-white font-bold text-sm">🐾</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-azure to-azure-dark bg-clip-text text-transparent">
                PetVoice
              </span>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-muted-foreground">
              <span>© 2024 PetVoice. Tutti i diritti riservati.</span>
              <div className="flex gap-6">
                <button 
                  onClick={() => setPrivacyModalOpen(true)}
                  className="hover:text-azure transition-colors cursor-pointer"
                >
                  Privacy
                </button>
                <button 
                  onClick={() => setTermsModalOpen(true)}
                  className="hover:text-azure transition-colors cursor-pointer"
                >
                  Termini
                </button>
                <button 
                  onClick={() => setSupportModalOpen(true)}
                  className="hover:text-azure transition-colors cursor-pointer"
                >
                  Supporto
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-md border-azure/20">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-azure to-azure-dark bg-clip-text text-transparent">
              {resetMode ? "Reset Password" : "Inizia Ora"}
            </DialogTitle>
          </DialogHeader>
          
          {resetMode ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="la-tua-email@esempio.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Invio..." : "Invia Link Reset"}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setResetMode(false)}>
                  Torna al Login
                </Button>
              </div>
            </form>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Accedi</TabsTrigger>
                <TabsTrigger value="register">Registrati</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="la-tua-email@esempio.com"
                        value={loginEmail}
                        onChange={(e) => {
                          console.log('Email change:', e.target.value);
                          setLoginEmail(e.target.value);
                        }}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showLoginPassword ? 'text' : 'password'}
                        placeholder="La tua password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-9 pr-12"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowLoginPassword(!showLoginPassword);
                        }}
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    className="w-full" 
                    disabled={loading}
                    onClick={handleLogin}
                  >
                    {loading ? "Accesso..." : "Accedi"}
                  </Button>
                  <Button type="button" variant="link" className="w-full text-sm" onClick={() => setResetMode(true)}>
                    Password dimenticata?
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Nome</Label>
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="Il tuo nome"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="la-tua-email@esempio.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-password"
                        type={showRegisterPassword ? 'text' : 'password'}
                        placeholder="Scegli una password sicura"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="pl-9 pr-12"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowRegisterPassword(!showRegisterPassword);
                        }}
                      >
                        {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    className="w-full" 
                    disabled={loading}
                    onClick={handleSignUp}
                  >
                    {loading ? "Registrazione..." : "Crea Account"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Demo Modal */}
      <Dialog open={demoModalOpen} onOpenChange={setDemoModalOpen}>
        <DialogContent className="max-w-4xl bg-card/95 backdrop-blur-md border-azure/20">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-azure to-azure-dark bg-clip-text text-transparent">
              Demo Interattiva PetVoice
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Step 1: Registra Pet */}
            <Card className="border-azure/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full gradient-azure flex items-center justify-center text-white font-bold text-sm">1</div>
                  Registra il tuo Pet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Informazioni Base</h4>
                      <p className="text-sm text-muted-foreground">📝 Nome: Luna</p>
                      <p className="text-sm text-muted-foreground">🐕 Tipo: Cane</p>
                      <p className="text-sm text-muted-foreground">🎂 Età: 3 anni</p>
                      <p className="text-sm text-muted-foreground">⚖️ Peso: 25kg</p>
                    </div>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg text-center">
                    <div className="w-24 h-24 mx-auto rounded-full bg-azure/20 flex items-center justify-center mb-2">
                      <span className="text-2xl">🐕</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Foto del profilo caricata</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Cattura Momento */}
            <Card className="border-azure/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full gradient-azure flex items-center justify-center text-white font-bold text-sm">2</div>
                  Cattura i Momenti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-secondary/50 p-4 rounded-lg text-center">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-azure" />
                    <h4 className="font-semibold mb-1">Audio</h4>
                    <p className="text-xs text-muted-foreground">Abbaiare mattutino registrato</p>
                    <div className="mt-2 bg-azure/20 rounded-full h-2">
                      <div className="bg-azure h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg text-center">
                    <Play className="w-8 h-8 mx-auto mb-2 text-azure" />
                    <h4 className="font-semibold mb-1">Video</h4>
                    <p className="text-xs text-muted-foreground">Comportamento durante il gioco</p>
                    <div className="mt-2 w-full h-16 bg-azure/10 rounded flex items-center justify-center">
                      <Play className="w-6 h-6 text-azure" />
                    </div>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg text-center">
                    <Heart className="w-8 h-8 mx-auto mb-2 text-azure" />
                    <h4 className="font-semibold mb-1">Foto</h4>
                    <p className="text-xs text-muted-foreground">Espressione del momento</p>
                    <div className="mt-2 w-full h-16 bg-azure/10 rounded flex items-center justify-center">
                      <span className="text-2xl">📸</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Analisi AI */}
            <Card className="border-azure/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full gradient-azure flex items-center justify-center text-white font-bold text-sm">3</div>
                  Analisi AI in Corso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-azure border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Analizzando patterns vocali...</span>
                    <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-azure border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Riconoscimento comportamentale...</span>
                    <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-azure border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Generazione insights...</span>
                    <div className="w-4 h-4 border-2 border-muted border-t-transparent rounded-full animate-spin ml-auto"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 4: Risultati */}
            <Card className="border-azure/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full gradient-azure flex items-center justify-center text-white font-bold text-sm">4</div>
                  Report Completo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                      <h4 className="font-semibold text-green-700 dark:text-green-400 mb-1">Stato Emotivo</h4>
                      <p className="text-sm">😊 Felice e Giocoso (85%)</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                      <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-1">Livello di Energia</h4>
                      <p className="text-sm">⚡ Alto (78%)</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg">
                      <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-1">Raccomandazioni</h4>
                      <p className="text-sm">🎾 Tempo di gioco ottimale</p>
                      <p className="text-sm">🚶‍♀️ Passeggiate nel pomeriggio</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg">
                      <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-1">Trend</h4>
                      <p className="text-sm">📈 Miglioramento del 15%</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <Button className="w-full md:w-auto" onClick={() => {setDemoModalOpen(false); setAuthModalOpen(true);}}>
                    Inizia con il Tuo Pet
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Modal */}
      <Dialog open={privacyModalOpen} onOpenChange={setPrivacyModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card/95 backdrop-blur-md border-azure/20">
          <PrivacyPolicy onClose={() => setPrivacyModalOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Terms Modal */}
      <Dialog open={termsModalOpen} onOpenChange={setTermsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card/95 backdrop-blur-md border-azure/20">
          <TermsOfService onClose={() => setTermsModalOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Support Modal */}
      <Dialog open={supportModalOpen} onOpenChange={setSupportModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card/95 backdrop-blur-md border-azure/20">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-azure to-azure-dark bg-clip-text text-transparent">
              Centro Supporto
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contatti */}
              <Card className="border-azure/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-azure" />
                    Contatti Diretti
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">📧 Email</h4>
                    <p className="text-sm text-muted-foreground">petvoice2025@gmail.com</p>
                    <p className="text-xs text-muted-foreground">Risposta entro 24 ore</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">💬 Chat Live</h4>
                    <p className="text-sm text-muted-foreground">Disponibile 24/7 nell'app</p>
                    <p className="text-xs text-muted-foreground">Risposta immediata</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">🎫 Sistema Ticket</h4>
                    <p className="text-sm text-muted-foreground">Per problemi complessi</p>
                    <p className="text-xs text-muted-foreground">Tracciamento completo</p>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card className="border-azure/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-azure" />
                    Domande Frequenti
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">❓ Come funziona l'analisi AI?</h4>
                    <p className="text-sm text-muted-foreground">
                      Utilizziamo algoritmi avanzati per analizzare comportamenti, suoni e immagini dei tuoi animali.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">🔒 I miei dati sono sicuri?</h4>
                    <p className="text-sm text-muted-foreground">
                      Sì, utilizziamo crittografia end-to-end e non condividiamo mai i tuoi dati.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">💰 Come funziona l'abbonamento?</h4>
                    <p className="text-sm text-muted-foreground">
                      Offriamo piani flessibili con trial gratuito e cancellazione in qualsiasi momento.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Risoluzione Problemi */}
              <Card className="border-azure/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-azure" />
                    Risoluzione Problemi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">🔄 App non funziona</h4>
                    <p className="text-sm text-muted-foreground">
                      1. Riavvia l'app<br/>
                      2. Verifica connessione internet<br/>
                      3. Aggiorna app se disponibile
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">📱 Problemi di upload</h4>
                    <p className="text-sm text-muted-foreground">
                      Controlla spazio di archiviazione e qualità della connessione internet.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">🚨 Bug Report</h4>
                    <p className="text-sm text-muted-foreground">
                      Invia screenshot e descrizione dettagliata al nostro team tecnico.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Community */}
              <Card className="border-azure/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-azure" />
                    Community & Risorse
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">👥 Forum Community</h4>
                    <p className="text-sm text-muted-foreground">
                      Condividi esperienze con altri proprietari di animali.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">📚 Guide e Tutorial</h4>
                    <p className="text-sm text-muted-foreground">
                      Video guide per utilizzare al meglio tutte le funzionalità.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">🎓 Webinar Gratuiti</h4>
                    <p className="text-sm text-muted-foreground">
                      Sessioni live con esperti veterinari e comportamentalisti.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center pt-6 border-t border-border/40">
              <p className="text-sm text-muted-foreground mb-4">
                Il nostro team di supporto è sempre pronto ad aiutarti per qualsiasi esigenza.
              </p>
              <Button onClick={() => setSupportModalOpen(false)} className="w-full md:w-auto">
                Chiudi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthPage;
