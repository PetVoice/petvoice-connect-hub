import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Errore",
        description: "Le nuove password non corrispondono",
        variant: "destructive"
      });
      return;
    }
    
    if (passwords.new.length < 6) {
      toast({
        title: "Errore",
        description: "La password deve essere di almeno 6 caratteri",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setUpdating(true);
      
      // Aggiorna password in Supabase
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });
      
      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Password aggiornata con successo!"
      });
      
      setPasswords({ current: '', new: '', confirm: '' });
      
    } catch (error: any) {
      console.error('Errore cambio password:', error);
      toast({
        title: "Errore",
        description: `Errore aggiornamento password: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };
  
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
      </div>
      
      <Button 
        type="submit" 
        disabled={updating}
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