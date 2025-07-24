import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Heart, 
  Sun, 
  Moon, 
  Sparkles, 
  ArrowRight, 
  Play, 
  Brain, 
  Camera, 
  TrendingUp, 
  Upload, 
  Zap, 
  Star 
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sage/5">
      {/* HEADER FISSO */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo + Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-coral to-teal rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-coral to-teal bg-clip-text text-transparent">
              PetVoice
            </span>
          </div>

          {/* Right controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <Sun className="w-5 h-5 dark:hidden" />
              <Moon className="w-5 h-5 hidden dark:block" />
            </button>
            
            {/* Auth Buttons */}
            <button 
              onClick={() => navigate('/auth')}
              className="px-4 py-2 text-gray-600 hover:text-coral font-medium transition-colors"
            >
              Accedi
            </button>
            <button 
              onClick={() => navigate('/auth')}
              className="px-6 py-2 bg-gradient-to-r from-coral to-teal text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
            >
              Registrati
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-sage/10 via-white to-teal/5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-coral/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal/10 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-coral/10 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-coral" />
                <span className="text-sm font-medium text-coral">AI-Powered Pet Emotions</span>
              </div>
              
              {/* Main Headline */}
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="text-gray-900 dark:text-gray-100">Comprendi le</span>
                <br />
                <span className="bg-gradient-to-r from-coral via-teal to-sage bg-clip-text text-transparent">
                  emozioni
                </span>
                <br />
                <span className="text-gray-900 dark:text-gray-100">del tuo pet</span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                L'intelligenza artificiale che analizza il comportamento e le emozioni 
                dei tuoi animali domestici. Crea un legame più profondo con chi ami.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/auth')}
                  className="group px-8 py-4 bg-gradient-to-r from-coral to-teal text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Inizia Gratis</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button className="px-8 py-4 border-2 border-gray-200 hover:border-coral text-gray-700 hover:text-coral dark:text-gray-300 dark:border-gray-700 dark:hover:border-coral rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Guarda Demo</span>
                </button>
              </div>
              
              {/* Social Proof */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-br from-coral to-teal border-3 border-white"></div>
                  ))}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">10.000+ Pet Parents</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">si fidano di noi ogni giorno</div>
                </div>
              </div>
            </div>
            
            {/* Right Visual */}
            <div className="relative animate-scale-in">
              
              {/* Main Device Mockup */}
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
                
                {/* Animated Pet Cards */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-coral/10 to-teal/10 rounded-2xl animate-fade-in">
                    <div className="w-16 h-16 bg-gradient-to-br from-coral to-teal rounded-full flex items-center justify-center">
                      <Heart className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">Luna è felice! 😊</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Livello gioia: 92%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 bg-sage/20 rounded-2xl animate-fade-in" style={{animationDelay: '0.2s'}}>
                    <div className="w-16 h-16 bg-gradient-to-br from-sage to-teal rounded-full flex items-center justify-center">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">Max è rilassato</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Stress: Basso</div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-coral rounded-full animate-bounce"></div>
                <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-teal/30 rounded-full animate-pulse"></div>
              </div>
              
              {/* Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-coral/5 to-teal/5 rounded-3xl transform rotate-3 -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Perché <span className="text-coral">10.000+ pet parents</span> scelgono PetVoice
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Tecnologia AI avanzata che trasforma il modo in cui comprendi e ti prendi cura del tuo amico a quattro zampe
            </p>
          </div>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature Card 1 */}
            <div className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 hover:border-coral/30 transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-coral to-orange-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">AI Emotion Detection</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Analisi comportamentale avanzata che riconosce oltre 12 stati emotivi diversi del tuo pet</p>
              <div className="flex items-center text-coral font-medium">
                <span>Scopri di più</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
            
            {/* Feature Card 2 */}
            <div className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 hover:border-teal/30 transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-teal to-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Analisi Foto & Video</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Carica una foto o registra un video per ricevere insight istantanei sullo stato emotivo</p>
              <div className="flex items-center text-teal font-medium">
                <span>Prova ora</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
            
            {/* Feature Card 3 */}
            <div className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 hover:border-sage/30 transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-sage to-green-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Tracking Benessere</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Monitora l'evoluzione emotiva nel tempo con grafici dettagliati e consigli personalizzati</p>
              <div className="flex items-center text-sage font-medium">
                <span>Vedi esempio</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Semplice come <span className="text-teal">1, 2, 3</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Inizia a comprendere il tuo pet in meno di 2 minuti
            </p>
          </div>
          
          {/* Steps */}
          <div className="relative">
            
            {/* Connection Line */}
            <div className="absolute top-24 left-1/2 w-full h-0.5 bg-gradient-to-r from-coral via-teal to-sage transform -translate-x-1/2 hidden lg:block"></div>
            
            <div className="grid lg:grid-cols-3 gap-12">
              
              {/* Step 1 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-48 h-48 mx-auto bg-gradient-to-br from-coral/10 to-coral/30 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <div className="w-24 h-24 bg-gradient-to-br from-coral to-orange-400 rounded-full flex items-center justify-center">
                      <Upload className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-white dark:bg-gray-800 rounded-full border-4 border-coral flex items-center justify-center font-bold text-2xl text-coral">
                    1
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Carica Foto/Video</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Scatta o carica una foto del tuo pet, oppure registra un breve video del suo comportamento
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-48 h-48 mx-auto bg-gradient-to-br from-teal/10 to-teal/30 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <div className="w-24 h-24 bg-gradient-to-br from-teal to-blue-400 rounded-full flex items-center justify-center">
                      <Zap className="w-12 h-12 text-white animate-pulse" />
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-white dark:bg-gray-800 rounded-full border-4 border-teal flex items-center justify-center font-bold text-2xl text-teal">
                    2
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">AI Analysis</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  La nostra AI analizza espressioni, postura e comportamento per identificare lo stato emotivo
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-48 h-48 mx-auto bg-gradient-to-br from-sage/10 to-sage/30 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <div className="w-24 h-24 bg-gradient-to-br from-sage to-green-400 rounded-full flex items-center justify-center">
                      <Heart className="w-12 h-12 text-white animate-bounce" />
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-white dark:bg-gray-800 rounded-full border-4 border-sage flex items-center justify-center font-bold text-2xl text-sage">
                    3
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Ricevi Insights</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Ottieni analisi dettagliate, consigli personalizzati e suggerimenti per migliorare il benessere
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Amato da pet parents <span className="text-coral">in tutta Italia</span>
            </h2>
          </div>
          
          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Testimonial 1 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                "Finalmente capisco quando Luna è stressata! PetVoice mi ha aiutato a creare una routine che la rende più felice."
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-coral to-pink-400 rounded-full"></div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">Maria R.</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Proprietaria di Golden Retriever</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                "Incredibile! Ora so esattamente quando il mio gatto ha bisogno di attenzioni. L'app è molto precisa."
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal to-blue-400 rounded-full"></div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">Giuseppe M.</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Proprietario di Maine Coon</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                "La tecnologia AI è sorprendente. Mi ha aiutato a capire i segnali di ansia del mio cane e a intervenire in tempo."
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-sage to-green-400 rounded-full"></div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">Francesca L.</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Proprietaria di Border Collie</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="py-20 bg-gradient-to-r from-coral via-teal to-sage relative overflow-hidden">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 border border-white rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/20 rounded-full animate-bounce"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-6 relative">
          <h2 className="text-5xl font-bold text-white mb-6">
            Pronto a scoprire cosa <br />
            <span className="text-yellow-300">prova veramente</span> il tuo pet?
          </h2>
          
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Unisciti a migliaia di pet parents che hanno già migliorato la relazione con i loro amici a quattro zampe
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button 
              onClick={() => navigate('/auth')}
              className="px-8 py-4 bg-white text-coral font-bold text-lg rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Inizia Gratis Ora
            </button>
            <button className="px-8 py-4 border-2 border-white text-white font-bold text-lg rounded-xl hover:bg-white hover:text-coral transition-all duration-300">
              Prenota Demo
            </button>
          </div>
          
          <div className="text-white/80 text-sm">
            ✅ Prova gratuita 14 giorni • ✅ Nessuna carta richiesta • ✅ Cancella quando vuoi
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;