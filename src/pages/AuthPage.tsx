import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Heart, Sparkles, Star, Sun, Moon, Monitor, Users } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMode, setResetMode] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  const { user, signIn, signUp, resetPassword } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
    
    // Check for referral code in URL
    const urlParams = new URLSearchParams(location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      setActiveTab('register'); // Switch to register tab if referral code is present
    }
  }, [user, navigate, location.search]);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(loginEmail, loginPassword);
    
    if (!error) {
      navigate('/');
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailError) {
      return; // Non procedere se c'è un errore email
    }
    
    setLoading(true);
    
    const { error } = await signUp(registerEmail, registerPassword, displayName, referralCode);
    
    setLoading(false);
    
    if (!error) {
      setRegisterEmail('');
      setRegisterPassword('');
      setDisplayName('');
      setReferralCode('');
    }
  };

  const checkEmailExists = async (emailToCheck: string) => {
    if (!emailToCheck || !emailToCheck.includes('@')) {
      setEmailError('');
      return;
    }

    setCheckingEmail(true);
    try {
      // Prova ad accedere con una password dummy per verificare se l'email esiste
      const { error } = await supabase.auth.signInWithPassword({
        email: emailToCheck,
        password: '__dummy_password_check__'
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          // Email esiste ma password sbagliata
          setEmailError('Email già registrata');
        } else if (error.message.includes('Email not confirmed')) {
          // Email esiste ma non confermata
          setEmailError('Email già registrata (non confermata)');
        } else if (error.message.includes('User not found') || 
                   error.message.includes('Invalid credentials')) {
          // Email non esiste
          setEmailError('');
        } else {
          // Altri errori, assumiamo che l'email non esista
          setEmailError('');
        }
      } else {
        // Nessun errore significa che l'email e la password sono corrette
        // Questo caso è improbabile con una password dummy, ma per sicurezza
        setEmailError('Email già registrata');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setEmailError('');
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleEmailChange = (value: string, isRegister: boolean = false) => {
    if (isRegister) {
      setRegisterEmail(value);
      // Solo controlla email se è nella scheda registrazione
      if (activeTab === 'register') {
        const timer = setTimeout(() => {
          checkEmailExists(value);
        }, 1000);
        return () => clearTimeout(timer);
      }
    } else {
      setLoginEmail(value);
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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Reset errori quando cambi tab
    setEmailError('');
    setCheckingEmail(false);
  };

  if (resetMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 gradient-hero relative overflow-hidden">
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-azure/10 rounded-full float" />
        <div className="absolute top-40 right-20 w-12 h-12 bg-azure/20 rounded-full float-delayed" />
        <div className="absolute bottom-32 left-20 w-20 h-20 bg-azure/5 rounded-full float" />
        
        <Card className="w-full max-w-md shadow-popup animate-scale-in relative bg-card/95 backdrop-blur-sm border-azure/20">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full gradient-azure flex items-center justify-center animate-glow">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-azure to-azure-dark bg-clip-text text-transparent">
              Reimposta Password
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Inserisci la tua email per ricevere il link di reset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2 animate-slide-up">
                <Label htmlFor="reset-email" className="text-sm font-medium">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-azure" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="la-tua-email@esempio.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-9 petvoice-input transition-all duration-300 focus:scale-[1.02]"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <Button 
                  type="submit" 
                  className="w-full petvoice-button h-12 font-medium text-lg" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Invio...
                    </div>
                  ) : (
                    <>
                      Invia Link Reset
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full hover:bg-azure/10 transition-colors" 
                  onClick={() => setResetMode(false)}
                >
                  Torna al Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero relative overflow-hidden">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-20">
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
          <Button
            variant={theme === 'system' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTheme('system')}
            className={`h-8 w-8 p-0 ${theme === 'system' ? 'bg-azure text-white' : 'hover:bg-azure/10'}`}
          >
            <Monitor className="h-4 w-4" />
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

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-bounce-in">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl gradient-azure flex items-center justify-center mx-auto mb-6 shadow-glow animate-glow">
              <span className="text-white font-bold text-3xl">🐾</span>
            </div>
            <div className="absolute -inset-2 bg-azure/20 rounded-3xl blur-lg -z-10 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-azure-light to-white bg-clip-text text-transparent mb-3 animate-slide-in-left">
            PetVoice
          </h1>
          <p className="text-white/90 text-lg animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            Analizza le emozioni del tuo pet
          </p>
          <div className="flex justify-center mt-4 gap-3">
            <Heart className="w-5 h-5 text-azure-light animate-bounce" style={{ animationDelay: '0s' }} />
            <Sparkles className="w-5 h-5 text-white animate-bounce" style={{ animationDelay: '0.3s' }} />
            <Star className="w-5 h-5 text-azure-glow animate-bounce" style={{ animationDelay: '0.6s' }} />
          </div>
        </div>

        <Card className="shadow-popup animate-scale-in bg-card/95 backdrop-blur-md border-azure/20">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-azure to-azure-dark bg-clip-text text-transparent">
              Benvenuto
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              Accedi o registrati per iniziare il viaggio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50 backdrop-blur-sm">
                <TabsTrigger 
                  value="login"
                  className="data-[state=active]:bg-azure data-[state=active]:text-white transition-all duration-300"
                >
                  Accedi
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="data-[state=active]:bg-azure data-[state=active]:text-white transition-all duration-300"
                >
                  Registrati
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2 animate-slide-up">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-azure" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="la-tua-email@esempio.com"
                        value={loginEmail}
                        onChange={(e) => handleEmailChange(e.target.value, false)}
                        className="pl-9 petvoice-input h-12 transition-all duration-300 focus:scale-[1.02]"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-azure" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="La tua password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
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
                  
                  <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <Button 
                      type="submit" 
                      className="w-full petvoice-button h-12 font-medium text-lg group" 
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Accesso...
                        </div>
                      ) : (
                        <>
                          Accedi
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <Button 
                      type="button" 
                      variant="link" 
                      className="text-sm text-azure hover:text-azure-dark transition-colors"
                      onClick={() => setResetMode(true)}
                    >
                      Password dimenticata?
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-6">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-2 animate-slide-up">
                    <Label htmlFor="reg-name" className="text-sm font-medium">Nome</Label>
                    <div className="relative group">
                      <Input
                        id="reg-name"
                        type="text"
                        placeholder="Il tuo nome"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="petvoice-input h-12 transition-all duration-300 focus:scale-[1.02]"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <Label htmlFor="reg-email" className="text-sm font-medium">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-azure" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="la-tua-email@esempio.com"
                        value={registerEmail}
                        onChange={(e) => handleEmailChange(e.target.value, true)}
                        className={`pl-9 petvoice-input h-12 transition-all duration-300 focus:scale-[1.02] ${
                          emailError ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                        required
                      />
                      {checkingEmail && (
                        <div className="absolute right-3 top-3">
                          <div className="w-4 h-4 border-2 border-azure/30 border-t-azure rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    {emailError && (
                      <p className="text-xs text-red-500 pl-1">{emailError}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <Label htmlFor="reg-password" className="text-sm font-medium">Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-azure" />
                      <Input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Scegli una password sicura"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="pl-9 pr-12 petvoice-input h-12 transition-all duration-300 focus:scale-[1.02]"
                        required
                        minLength={6}
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
                    <p className="text-xs text-muted-foreground pl-1">
                      Minimo 6 caratteri
                    </p>
                   </div>
                   
                   <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.25s' }}>
                     <Label htmlFor="reg-referral" className="text-sm font-medium">Codice Referral (facoltativo)</Label>
                     <div className="relative group">
                       <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-azure" />
                       <Input
                         id="reg-referral"
                         type="text"
                         placeholder="Inserisci il codice referral se ne hai uno"
                         value={referralCode}
                         onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                         className="pl-9 petvoice-input h-12 transition-all duration-300 focus:scale-[1.02]"
                       />
                     </div>
                     <p className="text-xs text-muted-foreground pl-1">
                       Opzionale: inserisci il codice del tuo referente per guadagnare vantaggi
                     </p>
                   </div>
                   
                   <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <Button 
                      type="submit" 
                      className="w-full petvoice-button h-12 font-medium text-lg group" 
                      disabled={loading || !!emailError || checkingEmail}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Registrazione...
                        </div>
                      ) : (
                        <>
                          Registrati
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;