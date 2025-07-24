import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowRight, ArrowLeft, Shield, Lock, Eye, EyeOff, Sun, Moon, Star, Sparkles, Heart, Settings } from 'lucide-react';
import { toast } from 'sonner';

const HiddenPage: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulazione invio form
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Contenuto salvato con successo!');
    setLoading(false);
    
    // Reset form
    setFormData({ title: '', content: '', password: '' });
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero relative overflow-hidden">
      {/* Controls - Top */}
      <div className="absolute top-4 left-0 right-0 z-20 flex items-center justify-between px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="bg-card/80 backdrop-blur-md border border-azure/20 hover:bg-azure/10 transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna Indietro
        </Button>

        {/* Theme Toggle */}
        <div className="flex items-center gap-1 p-1 bg-card/80 backdrop-blur-md rounded-lg border border-azure/20">
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
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-azure/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-azure/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-azure/8 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-3 h-3 bg-azure rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
      <div className="absolute top-40 right-20 w-2 h-2 bg-azure-light rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-32 left-20 w-4 h-4 bg-azure/60 rounded-full animate-bounce" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-20 right-10 w-2 h-2 bg-azure-glow rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />

      <div className="w-full max-w-2xl relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-bounce-in">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl gradient-azure flex items-center justify-center mx-auto mb-6 shadow-glow animate-glow">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -inset-2 bg-azure/20 rounded-3xl blur-lg -z-10 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-azure-light to-white bg-clip-text text-transparent mb-3 animate-slide-in-left">
            Area Riservata
          </h1>
          <p className="text-white/90 text-lg animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            Accesso speciale a funzionalità avanzate
          </p>
          <div className="flex justify-center mt-4 gap-3">
            <Lock className="w-5 h-5 text-azure-light animate-bounce" style={{ animationDelay: '0s' }} />
            <Settings className="w-5 h-5 text-white animate-bounce" style={{ animationDelay: '0.3s' }} />
            <Shield className="w-5 h-5 text-azure-glow animate-bounce" style={{ animationDelay: '0.6s' }} />
          </div>
        </div>

        <Card className="shadow-popup animate-scale-in bg-card/95 backdrop-blur-md border-azure/20">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-azure to-azure-dark bg-clip-text text-transparent">
              Pannello Speciale
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              Inserisci le informazioni richieste per accedere
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 animate-slide-up">
                <Label htmlFor="title" className="text-sm font-medium">Titolo</Label>
                <div className="relative group">
                  <Input
                    id="title"
                    type="text"
                    placeholder="Inserisci un titolo"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="petvoice-input h-12 transition-all duration-300 focus:scale-[1.02]"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <Label htmlFor="content" className="text-sm font-medium">Contenuto</Label>
                <div className="relative group">
                  <Textarea
                    id="content"
                    placeholder="Inserisci il contenuto del messaggio..."
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="petvoice-input min-h-[120px] resize-none transition-all duration-300 focus:scale-[1.02]"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Label htmlFor="password" className="text-sm font-medium">Password di Accesso</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-azure" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password speciale"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-9 pr-12 petvoice-input h-12 transition-all duration-300 focus:scale-[1.02]"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-10 w-10 hover:bg-azure/10 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <Button 
                  type="submit" 
                  className="w-full petvoice-button h-12 font-medium text-lg group" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Elaborazione...
                    </div>
                  ) : (
                    <>
                      Procedi
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Additional Info */}
            <div className="mt-6 p-4 bg-azure/10 rounded-lg border border-azure/20 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-azure" />
                <span className="text-sm font-medium text-azure">Informazioni di Sicurezza</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Questa è un'area riservata. Tutti i dati inseriti sono crittografati e protetti secondo 
                gli standard di sicurezza più elevati.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bottom decorative elements */}
        <div className="flex justify-center mt-8 gap-3 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <Heart className="w-4 h-4 text-azure-light animate-pulse" />
          <Sparkles className="w-4 h-4 text-white animate-pulse" style={{ animationDelay: '0.3s' }} />
          <Star className="w-4 h-4 text-azure-glow animate-pulse" style={{ animationDelay: '0.6s' }} />
        </div>
      </div>
    </div>
  );
};

export default HiddenPage;