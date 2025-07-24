import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Brain, 
  Camera, 
  TrendingUp, 
  ArrowRight, 
  Play, 
  Star, 
  Check, 
  Menu, 
  X,
  Sparkles,
  Zap,
  Upload,
  Sun,
  Moon,
  Users,
  Shield,
  Clock,
  Award
} from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Fisso */}
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo + Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-sky-accent rounded-xl flex items-center justify-center shadow-glow">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-sky-accent bg-clip-text text-transparent">
              PetVoice
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-foreground hover:text-primary transition-colors">Funzionalità</a>
            <a href="#pricing" className="text-foreground hover:text-primary transition-colors">Prezzi</a>
            <a href="#testimonials" className="text-foreground hover:text-primary transition-colors">Testimonianze</a>
            <a href="#support" className="text-foreground hover:text-primary transition-colors">Supporto</a>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/auth" 
              className="px-4 py-2 text-foreground hover:text-primary font-medium transition-colors"
            >
              Accedi
            </Link>
            <Link 
              to="/auth" 
              className="px-6 py-2 bg-gradient-to-r from-primary to-sky-accent text-white rounded-lg hover:shadow-glow hover:scale-105 transition-all duration-200 font-medium"
            >
              Registrati
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-background border-t border-border">
            <nav className="flex flex-col space-y-4 px-6 py-4">
              <a href="#features" className="text-foreground hover:text-primary transition-colors">Funzionalità</a>
              <a href="#pricing" className="text-foreground hover:text-primary transition-colors">Prezzi</a>
              <a href="#testimonials" className="text-foreground hover:text-primary transition-colors">Testimonianze</a>
              <Link to="/auth" className="text-primary font-medium">Accedi / Registrati</Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-soft/20 via-background to-sky-light/10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-accent/10 rounded-full blur-3xl animate-float-delayed"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">AI-Powered Pet Emotions</span>
              </div>
              
              {/* Main Headline */}
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="text-foreground">Comprendi le</span>
                <br />
                <span className="bg-gradient-to-r from-primary via-sky-accent to-sky-dark bg-clip-text text-transparent">
                  emozioni
                </span>
                <br />
                <span className="text-foreground">del tuo pet</span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                L'intelligenza artificiale che analizza il comportamento e le emozioni 
                dei tuoi animali domestici. Crea un legame più profondo con chi ami.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/auth"
                  className="group px-8 py-4 bg-gradient-to-r from-primary to-sky-accent text-white rounded-xl font-semibold text-lg hover:shadow-glow hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Inizia Gratis</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <button className="px-8 py-4 border-2 border-border hover:border-primary text-foreground hover:text-primary rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Guarda Demo</span>
                </button>
              </div>
              
              {/* Social Proof */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-sky-accent border-3 border-background shadow-soft"></div>
                  ))}
                </div>
                <div>
                  <div className="font-semibold text-foreground">10.000+ Pet Parents</div>
                  <div className="text-sm text-muted-foreground">si fidano di noi ogni giorno</div>
                </div>
              </div>
            </div>
            
            {/* Right Visual */}
            <div className="relative animate-slide-in-right">
              
              {/* Main Device Mockup */}
              <div className="relative bg-card rounded-3xl shadow-elegant p-8 border border-border hover:shadow-glow transition-all duration-500">
                
                {/* Animated Pet Cards */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary/10 to-sky-accent/10 rounded-2xl animate-bounce-in">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-sky-accent rounded-full flex items-center justify-center">
                      <Heart className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Luna è felice! 😊</div>
                      <div className="text-sm text-muted-foreground">Livello gioia: 92%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 bg-sky-soft/20 rounded-2xl animate-bounce-in" style={{animationDelay: '0.2s'}}>
                    <div className="w-16 h-16 bg-gradient-to-br from-sky-soft to-sky-accent rounded-full flex items-center justify-center">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Max è rilassato</div>
                      <div className="text-sm text-muted-foreground">Stress: Basso</div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary rounded-full animate-bounce"></div>
                <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-sky-accent/30 rounded-full animate-pulse"></div>
              </div>
              
              {/* Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-sky-accent/5 rounded-3xl transform rotate-3 -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Perché <span className="text-primary">10.000+ pet parents</span> scelgono PetVoice
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Tecnologia AI avanzata che trasforma il modo in cui comprendi e ti prendi cura del tuo amico a quattro zampe
            </p>
          </div>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature Card 1 */}
            <div className="group p-8 bg-card rounded-2xl shadow-elegant hover:shadow-glow border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 animate-slide-up">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-sky-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">AI Emotion Detection</h3>
              <p className="text-muted-foreground mb-6">Analisi comportamentale avanzata che riconosce oltre 12 stati emotivi diversi del tuo pet</p>
              <div className="flex items-center text-primary font-medium">
                <span>Scopri di più</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
            
            {/* Feature Card 2 */}
            <div className="group p-8 bg-card rounded-2xl shadow-elegant hover:shadow-glow border border-border hover:border-sky-accent/30 transition-all duration-300 hover:-translate-y-2 animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-sky-accent to-sky-dark rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Analisi Foto & Video</h3>
              <p className="text-muted-foreground mb-6">Carica una foto o registra un video per ricevere insight istantanei sullo stato emotivo</p>
              <div className="flex items-center text-sky-accent font-medium">
                <span>Prova ora</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
            
            {/* Feature Card 3 */}
            <div className="group p-8 bg-card rounded-2xl shadow-elegant hover:shadow-glow border border-border hover:border-sky-soft/30 transition-all duration-300 hover:-translate-y-2 animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-sky-soft to-sky-light rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Tracking Benessere</h3>
              <p className="text-muted-foreground mb-6">Monitora l'evoluzione emotiva nel tempo con grafici dettagliati e consigli personalizzati</p>
              <div className="flex items-center text-sky-soft font-medium">
                <span>Vedi esempio</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>

            {/* Feature Card 4 */}
            <div className="group p-8 bg-card rounded-2xl shadow-elegant hover:shadow-glow border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 animate-slide-up" style={{animationDelay: '0.3s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-sky-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Monitoraggio 24/7</h3>
              <p className="text-muted-foreground mb-6">Tieni traccia del benessere del tuo pet in ogni momento con notifiche intelligenti</p>
              <div className="flex items-center text-primary font-medium">
                <span>Attiva ora</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>

            {/* Feature Card 5 */}
            <div className="group p-8 bg-card rounded-2xl shadow-elegant hover:shadow-glow border border-border hover:border-sky-accent/30 transition-all duration-300 hover:-translate-y-2 animate-slide-up" style={{animationDelay: '0.4s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-sky-accent to-sky-dark rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Community & Esperti</h3>
              <p className="text-muted-foreground mb-6">Connettiti con altri proprietari e ricevi consigli da veterinari esperti</p>
              <div className="flex items-center text-sky-accent font-medium">
                <span>Unisciti</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>

            {/* Feature Card 6 */}
            <div className="group p-8 bg-card rounded-2xl shadow-elegant hover:shadow-glow border border-border hover:border-sky-soft/30 transition-all duration-300 hover:-translate-y-2 animate-slide-up" style={{animationDelay: '0.5s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-sky-soft to-sky-light rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Privacy Sicura</h3>
              <p className="text-muted-foreground mb-6">I tuoi dati e quelli del tuo pet sono protetti con crittografia di livello bancario</p>
              <div className="flex items-center text-sky-soft font-medium">
                <span>Maggiori info</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Semplice come <span className="text-sky-accent">1, 2, 3</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Inizia a comprendere il tuo pet in meno di 2 minuti
            </p>
          </div>
          
          {/* Steps */}
          <div className="relative">
            
            {/* Connection Line */}
            <div className="absolute top-24 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary via-sky-accent to-sky-soft transform -translate-x-1/2 hidden lg:block"></div>
            
            <div className="grid lg:grid-cols-3 gap-12">
              
              {/* Step 1 */}
              <div className="text-center group animate-scale-in">
                <div className="relative mb-8">
                  <div className="w-48 h-48 mx-auto bg-gradient-to-br from-primary/10 to-primary/30 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-sky-accent rounded-full flex items-center justify-center shadow-glow">
                      <Upload className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-background rounded-full border-4 border-primary flex items-center justify-center font-bold text-2xl text-primary shadow-elegant">
                    1
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Carica Foto/Video</h3>
                <p className="text-muted-foreground">
                  Scatta o carica una foto del tuo pet, oppure registra un breve video del suo comportamento
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="text-center group animate-scale-in" style={{animationDelay: '0.2s'}}>
                <div className="relative mb-8">
                  <div className="w-48 h-48 mx-auto bg-gradient-to-br from-sky-accent/10 to-sky-accent/30 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <div className="w-24 h-24 bg-gradient-to-br from-sky-accent to-sky-dark rounded-full flex items-center justify-center shadow-glow">
                      <Zap className="w-12 h-12 text-white animate-pulse" />
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-background rounded-full border-4 border-sky-accent flex items-center justify-center font-bold text-2xl text-sky-accent shadow-elegant">
                    2
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">AI Analysis</h3>
                <p className="text-muted-foreground">
                  La nostra AI analizza espressioni, postura e comportamento per identificare lo stato emotivo
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="text-center group animate-scale-in" style={{animationDelay: '0.4s'}}>
                <div className="relative mb-8">
                  <div className="w-48 h-48 mx-auto bg-gradient-to-br from-sky-soft/10 to-sky-soft/30 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <div className="w-24 h-24 bg-gradient-to-br from-sky-soft to-sky-light rounded-full flex items-center justify-center shadow-glow">
                      <Heart className="w-12 h-12 text-white animate-bounce" />
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-background rounded-full border-4 border-sky-soft flex items-center justify-center font-bold text-2xl text-sky-soft shadow-elegant">
                    3
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Ricevi Insights</h3>
                <p className="text-muted-foreground">
                  Ottieni analisi dettagliate, consigli personalizzati e suggerimenti per migliorare il benessere
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Scegli il piano <span className="text-primary">perfetto</span> per te
            </h2>
            <p className="text-xl text-muted-foreground">
              Inizia gratis e scopri tutto quello che PetVoice può fare per il tuo pet
            </p>
          </div>
          
          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* Free Plan */}
            <div className="p-8 bg-card rounded-2xl shadow-elegant border border-border hover:shadow-glow transition-all duration-300 animate-slide-up">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground mb-2">Gratuito</h3>
                <div className="text-4xl font-bold text-primary mb-4">€0<span className="text-lg text-muted-foreground">/mese</span></div>
                <p className="text-muted-foreground mb-6">Perfetto per iniziare</p>
                
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span className="text-foreground">5 analisi al mese</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span className="text-foreground">1 pet</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span className="text-foreground">Analisi foto</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span className="text-foreground">Report base</span>
                  </li>
                </ul>
                
                <Link 
                  to="/auth"
                  className="w-full px-6 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-lg font-semibold transition-all duration-300 flex items-center justify-center"
                >
                  Inizia Gratis
                </Link>
              </div>
            </div>
            
            {/* Pro Plan - Highlighted */}
            <div className="p-8 bg-gradient-to-br from-primary/5 to-sky-accent/5 rounded-2xl shadow-glow border-2 border-primary hover:scale-105 transition-all duration-300 relative animate-slide-up" style={{animationDelay: '0.1s'}}>
              
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-primary to-sky-accent text-white px-4 py-2 rounded-full text-sm font-semibold shadow-glow">
                  ⭐ Più Popolare
                </div>
              </div>
              
              <div className="text-center pt-4">
                <h3 className="text-2xl font-bold text-foreground mb-2">Pro</h3>
                <div className="text-4xl font-bold text-primary mb-4">€19<span className="text-lg text-muted-foreground">/mese</span></div>
                <p className="text-muted-foreground mb-6">Per pet parents appassionati</p>
                
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span className="text-foreground font-medium">Analisi illimitate</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span className="text-foreground font-medium">Fino a 3 pets</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span className="text-foreground font-medium">Analisi foto + video</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span className="text-foreground font-medium">Report avanzati</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span className="text-foreground font-medium">Tracking temporale</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span className="text-foreground font-medium">Supporto prioritario</span>
                  </li>
                </ul>
                
                <Link 
                  to="/auth"
                  className="w-full px-6 py-3 bg-gradient-to-r from-primary to-sky-accent text-white hover:shadow-glow hover:scale-105 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center"
                >
                  Inizia Ora
                </Link>
              </div>
            </div>
            
            {/* Premium Plan */}
            <div className="p-8 bg-card rounded-2xl shadow-elegant border border-border hover:shadow-glow transition-all duration-300 animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground mb-2">Premium</h3>
                <div className="text-4xl font-bold text-primary mb-4">€39<span className="text-lg text-muted-foreground">/mese</span></div>
                <p className="text-muted-foreground mb-6">Per professionisti</p>
                
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span className="text-foreground">Tutto del piano Pro</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span className="text-foreground">Pets illimitati</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span className="text-foreground">AI Training personalizzato</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span className="text-foreground">Accesso community VIP</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span className="text-foreground">Consulenze veterinari</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span className="text-foreground">API Access</span>
                  </li>
                </ul>
                
                <Link 
                  to="/auth"
                  className="w-full px-6 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-lg font-semibold transition-all duration-300 flex items-center justify-center"
                >
                  Contattaci
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-muted/20 to-background">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Amato da pet parents <span className="text-primary">in tutta Italia</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Scopri cosa dicono i nostri utenti
            </p>
          </div>
          
          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Testimonial 1 */}
            <div className="bg-card p-8 rounded-2xl shadow-elegant border border-border hover:shadow-glow transition-shadow animate-slide-up">
              <div className="flex items-center space-x-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 italic">
                "Finalmente capisco quando Luna è stressata! PetVoice mi ha aiutato a creare una routine che la rende più felice."
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-sky-accent rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div>
                  <div className="font-semibold text-foreground">Maria R.</div>
                  <div className="text-sm text-muted-foreground">Proprietaria di Golden Retriever</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-card p-8 rounded-2xl shadow-elegant border border-border hover:shadow-glow transition-shadow animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center space-x-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 italic">
                "Incredibile! Ora so esattamente quando Milo ha bisogno di più attenzioni. L'AI è sorprendentemente precisa."
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-accent to-sky-dark rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div>
                  <div className="font-semibold text-foreground">Alessandro T.</div>
                  <div className="text-sm text-muted-foreground">Proprietario di Border Collie</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-card p-8 rounded-2xl shadow-elegant border border-border hover:shadow-glow transition-shadow animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center space-x-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 italic">
                "Come veterinaria, consiglio PetVoice a tutti i miei clienti. È uno strumento prezioso per il benessere animale."
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-soft to-sky-light rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div>
                  <div className="font-semibold text-foreground">Dr.ssa Sara M.</div>
                  <div className="text-sm text-muted-foreground">Veterinaria</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Finale */}
      <section className="py-20 bg-gradient-to-r from-primary via-sky-accent to-sky-dark relative overflow-hidden">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full animate-float"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 border border-white rounded-full animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/20 rounded-full animate-pulse"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-6 relative animate-fade-in">
          <h2 className="text-5xl font-bold text-white mb-6">
            Pronto a scoprire cosa <br />
            <span className="text-yellow-300">prova veramente</span> il tuo pet?
          </h2>
          
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Unisciti a migliaia di pet parents che hanno già migliorato la relazione con i loro amici a quattro zampe
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              to="/auth"
              className="px-8 py-4 bg-white text-primary font-bold text-lg rounded-xl hover:shadow-glow hover:scale-105 transition-all duration-300"
            >
              Inizia Gratis Ora
            </Link>
            <button className="px-8 py-4 border-2 border-white text-white font-bold text-lg rounded-xl hover:bg-white hover:text-primary transition-all duration-300">
              Prenota Demo
            </button>
          </div>
          
          <div className="text-white/80 text-sm">
            ✅ Prova gratuita 14 giorni • ✅ Nessuna carta richiesta • ✅ Cancella quando vuoi
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-sky-accent rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-foreground">PetVoice</span>
              </div>
              <p className="text-muted-foreground">
                L'AI che comprende le emozioni dei tuoi pet per creare legami più profondi e duraturi.
              </p>
            </div>

            {/* Prodotto */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Prodotto</h4>
              <div className="space-y-2">
                <a href="#features" className="block text-muted-foreground hover:text-primary transition-colors">Funzionalità</a>
                <a href="#pricing" className="block text-muted-foreground hover:text-primary transition-colors">Prezzi</a>
                <Link to="/auth" className="block text-muted-foreground hover:text-primary transition-colors">Prova Gratuita</Link>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">API</a>
              </div>
            </div>

            {/* Supporto */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Supporto</h4>
              <div className="space-y-2">
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Centro Aiuto</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Contattaci</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Community</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Blog</a>
              </div>
            </div>

            {/* Legale */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legale</h4>
              <div className="space-y-2">
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Termini di Servizio</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Cookie Policy</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">GDPR</a>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 PetVoice. Tutti i diritti riservati. Made with ❤️ per i tuoi pet.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;