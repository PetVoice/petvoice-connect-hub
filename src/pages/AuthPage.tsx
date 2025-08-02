import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, EyeOff, Moon, Sun, Heart, Sparkles, PawPrint } from 'lucide-react';

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

  const { user, signIn, signUp, resetPassword } = useAuth();
  const { theme, setTheme } = useTheme();

  // Redirect authenticated users
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-8 -right-8 w-96 h-96 bg-coral/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Theme Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-background/80 transition-all duration-300"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        {theme === 'light' ? (
          <Moon className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Sun className="h-5 w-5 text-muted-foreground" />
        )}
      </Button>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <PawPrint className="h-8 w-8 text-primary" />
              <Heart className="h-4 w-4 text-coral absolute -top-1 -right-1" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-coral to-primary bg-clip-text text-transparent">
              PetVoice
            </h1>
            <Sparkles className="h-6 w-6 text-primary/60 animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm">
            Il tuo compagno digitale per il benessere del tuo pet
          </p>
        </div>

        {/* Main Auth Card */}
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl p-8 relative overflow-hidden">
          {/* Card decorative elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-coral to-primary"></div>
          <div className="absolute -top-2 -right-2 w-20 h-20 bg-primary/5 rounded-full blur-xl"></div>
          <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-coral/5 rounded-full blur-xl"></div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="relative z-10">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-xl p-1">
              <TabsTrigger 
                value="login" 
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
              >
                Accedi
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
              >
                Registrati
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-8">
              {!resetMode ? (
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="h-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:border-primary/50 transition-all duration-200"
                      placeholder="tua@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showLoginPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="h-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:border-primary/50 transition-all duration-200 pr-12"
                        placeholder="••••••••"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50 rounded-lg"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                      >
                        {showLoginPassword ? 
                          <EyeOff className="h-4 w-4 text-muted-foreground" /> : 
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        }
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-coral hover:from-primary/90 hover:to-coral/90 transition-all duration-300 shadow-lg hover:shadow-xl" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Accesso in corso...
                      </div>
                    ) : (
                      'Accedi'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full p-0 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    onClick={() => setResetMode(true)}
                  >
                    Password dimenticata?
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Recupera Password</h3>
                    <p className="text-sm text-muted-foreground">
                      Inserisci la tua email per ricevere il link di reset
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="resetEmail" className="text-sm font-medium text-foreground">
                      Email
                    </Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="h-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:border-primary/50 transition-all duration-200"
                      placeholder="tua@email.com"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-coral hover:from-primary/90 hover:to-coral/90 transition-all duration-300 shadow-lg hover:shadow-xl" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Invio in corso...
                      </div>
                    ) : (
                      'Invia link di reset'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full p-0 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    onClick={() => setResetMode(false)}
                  >
                    ← Torna al login
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="register" className="mt-8">
              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="displayName" className="text-sm font-medium text-foreground">
                    Nome completo
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:border-primary/50 transition-all duration-200"
                    placeholder="Il tuo nome"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="registerEmail" className="text-sm font-medium text-foreground">
                    Email
                  </Label>
                  <Input
                    id="registerEmail"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="h-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:border-primary/50 transition-all duration-200"
                    placeholder="tua@email.com"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="registerPassword" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="registerPassword"
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="h-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:border-primary/50 transition-all duration-200 pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50 rounded-lg"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    >
                      {showRegisterPassword ? 
                        <EyeOff className="h-4 w-4 text-muted-foreground" /> : 
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      }
                    </Button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-coral hover:from-primary/90 hover:to-coral/90 transition-all duration-300 shadow-lg hover:shadow-xl" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Registrazione in corso...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Registrati
                    </div>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Registrandoti accetti i nostri termini di servizio e la privacy policy
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer text */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Fatto con {' '}
            <Heart className="h-3 w-3 inline text-coral animate-pulse" />
            {' '} per i nostri amici a quattro zampe
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;