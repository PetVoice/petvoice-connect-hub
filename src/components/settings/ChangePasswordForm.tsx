import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslatedToast } from '@/hooks/use-translated-toast';
import { supabase } from '@/integrations/supabase/client';
import { Key, Eye, EyeOff } from 'lucide-react';

export const ChangePasswordForm: React.FC = () => {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [updating, setUpdating] = useState(false);
  const { showToast } = useTranslatedToast();
  
  // Traduzioni errori Supabase
  const translateError = (error: any) => {
    const translations: { [key: string]: string } = {
      'Password should be at least 6 characters': 'La password deve essere di almeno 6 caratteri',
      'Password is too weak': 'La password è troppo debole. Usa almeno 8 caratteri con lettere, numeri e simboli',
      'New password should be different from the old password': 'La nuova password deve essere diversa da quella attuale',
      'Password should contain at least one uppercase letter': 'La password deve contenere almeno una lettera maiuscola',
      'Password should contain at least one lowercase letter': 'La password deve contenere almeno una lettera minuscola',
      'Password should contain at least one number': 'La password deve contenere almeno un numero',
      'Password should contain at least one special character': 'La password deve contenere almeno un carattere speciale',
      'Same password': 'Non puoi usare la stessa password attuale'
    };
    
    return translations[error.message] || error.message;
  };
  
  // Validazione password lato client
  const validatePassword = (password: string) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Minimo 8 caratteri');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Almeno una lettera maiuscola');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Almeno una lettera minuscola');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Almeno un numero');
    }
    
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Almeno un carattere speciale');
    }
    
    return errors;
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazioni lato client
    if (passwords.new !== passwords.confirm) {
      showToast({
        title: "Errore",
        description: "Le nuove password non corrispondono",
        variant: "destructive"
      });
      return;
    }
    
    const validationErrors = validatePassword(passwords.new);
    if (validationErrors.length > 0) {
      showToast({
        title: "Errore",
        description: "Password troppo debole: {errors}",
        variant: "destructive",
        variables: { errors: validationErrors.join(', ') }
      });
      return;
    }
    
    if (passwords.new === passwords.current) {
      showToast({
        title: "Errore",
        description: "La nuova password deve essere diversa da quella attuale",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setUpdating(true);
      
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });
      
      if (error) {
        // Traduci errore in italiano
        const italianError = translateError(error);
        throw new Error(italianError);
      }
      
      showToast({
        title: "Successo",
        description: "Password aggiornata con successo!"
      });
      
      setPasswords({ current: '', new: '', confirm: '' });
      
    } catch (error: any) {
      console.error('Errore cambio password:', error);
      showToast({
        title: "Errore",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };
  
  // Indicatore forza password
  const getPasswordStrength = (password: string) => {
    const errors = validatePassword(password);
    if (password.length === 0) return { level: 0, text: '', color: 'hsl(var(--muted-foreground))' };
    if (errors.length > 3) return { level: 1, text: 'Molto debole', color: 'hsl(var(--destructive))' };
    if (errors.length > 2) return { level: 2, text: 'Debole', color: '#f97316' };
    if (errors.length > 0) return { level: 3, text: 'Media', color: '#eab308' };
    return { level: 4, text: 'Forte', color: 'hsl(var(--primary))' };
  };
  
  const passwordStrength = getPasswordStrength(passwords.new);
  
  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  return (
    <form onSubmit={handlePasswordChange} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="current_password" className="flex items-center space-x-2">
          <Key className="w-4 h-4" />
          <span>Password Attuale</span>
        </Label>
        <div className="relative">
          <Input
            id="current_password"
            type={showPasswords.current ? "text" : "password"}
            value={passwords.current}
            onChange={(e) => setPasswords(prev => ({...prev, current: e.target.value}))}
            required
            className="pr-10"
            placeholder="Inserisci la tua password attuale"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => togglePasswordVisibility('current')}
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          >
            {showPasswords.current ? (
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Eye className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="new_password" className="flex items-center space-x-2">
          <Key className="w-4 h-4" />
          <span>Nuova Password</span>
        </Label>
        <div className="relative">
          <Input
            id="new_password"
            type={showPasswords.new ? "text" : "password"}
            value={passwords.new}
            onChange={(e) => setPasswords(prev => ({...prev, new: e.target.value}))}
            required
            minLength={6}
            className="pr-10"
            placeholder="Inserisci la nuova password"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => togglePasswordVisibility('new')}
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          >
            {showPasswords.new ? (
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Eye className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        
        {/* Indicatore forza password */}
        {passwords.new && (
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${(passwordStrength.level / 4) * 100}%`,
                    backgroundColor: passwordStrength.color
                  }}
                />
              </div>
              <span className="text-sm" style={{ color: passwordStrength.color }}>
                {passwordStrength.text}
              </span>
            </div>
            
            {passwordStrength.level < 4 && (
              <div className="mt-1 text-xs text-muted-foreground">
                Mancano: {validatePassword(passwords.new).join(', ')}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirm_password" className="flex items-center space-x-2">
          <Key className="w-4 h-4" />
          <span>Conferma Nuova Password</span>
        </Label>
        <div className="relative">
          <Input
            id="confirm_password"
            type={showPasswords.confirm ? "text" : "password"}
            value={passwords.confirm}
            onChange={(e) => setPasswords(prev => ({...prev, confirm: e.target.value}))}
            required
            minLength={6}
            className="pr-10"
            placeholder="Conferma la nuova password"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => togglePasswordVisibility('confirm')}
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          >
            {showPasswords.confirm ? (
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Eye className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        
        {passwords.confirm && passwords.new !== passwords.confirm && (
          <p className="text-sm text-destructive mt-1">Le password non corrispondono</p>
        )}
      </div>
      
      <Button 
        type="submit" 
        disabled={updating || passwordStrength.level < 3 || passwords.new !== passwords.confirm}
        className="w-full"
      >
        {updating ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            <span>Aggiornamento...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4" />
            <span>Aggiorna Password</span>
          </div>
        )}
      </Button>
    </form>
  );
};