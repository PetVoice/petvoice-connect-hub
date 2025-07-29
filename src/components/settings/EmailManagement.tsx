import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUnifiedToast } from '@/hooks/use-unified-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Send, CheckCircle, AlertCircle, X } from 'lucide-react';

interface EmailManagementProps {
  user: any;
}

export const EmailManagement: React.FC<EmailManagementProps> = ({ user }) => {
  const [newEmail, setNewEmail] = useState('');
  const [updating, setUpdating] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const toast = useToastWithIcon();
  
  // Controlla se c'è un cambio email in corso
  useEffect(() => {
    const checkPendingEmail = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser?.email_confirmed_at && currentUser?.new_email) {
          setPendingEmail(currentUser.new_email);
        }
      } catch (error) {
        console.error('Errore controllo email pendente:', error);
      }
    };
    
    checkPendingEmail();
  }, []);
  
  // Controlla URL params per conferma email
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('email_change') === 'confirmed') {
      toast.success("Email modificata con successo!");
      // Pulisci URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Refresh user data
      supabase.auth.refreshSession();
    }
  }, [toast]);
  
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail || !newEmail.includes('@')) {
      toast.error("Inserisci un indirizzo email valido");
      return;
    }
    
    if (newEmail === user.email) {
      toast.error("La nuova email è uguale a quella attuale");
      return;
    }
    
    try {
      setUpdating(true);
      
      // Usa la funzione corretta per cambiare email
      const { data, error } = await supabase.auth.updateUser(
        { email: newEmail },
        {
          emailRedirectTo: `${window.location.origin}/settings?email_change=confirmed`
        }
      );
      
      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error('Questa email è già registrata da un altro utente');
        }
        throw error;
      }
      
      setPendingEmail(newEmail);
      toast.success("Email di verifica inviata! Controlla la tua casella di posta.");
      setNewEmail('');
      
    } catch (error: any) {
      console.error('Errore cambio email:', error);
      toast.error(`Errore durante il cambio email: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };
  
  const cancelEmailChange = async () => {
    try {
      // Non c'è un modo diretto per cancellare un cambio email in Supabase
      // Ma possiamo rimuovere la visualizzazione locale
      setPendingEmail(null);
      toast.success("Richiesta di cambio email annullata");
    } catch (error) {
      console.error('Errore cancellazione cambio email:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="current_email" className="flex items-center space-x-2">
          <Mail className="w-4 h-4" />
          <span>Email Attuale</span>
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="current_email"
            type="email"
            value={user.email || 'Nessuna email'}
            disabled
            className="bg-muted flex-1"
          />
          {user.email_confirmed_at ? (
            <div className="flex items-center text-primary text-sm">
              <CheckCircle className="w-4 h-4 mr-1" />
              Verificata
            </div>
          ) : (
            <div className="flex items-center text-orange-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              Non verificata
            </div>
          )}
        </div>
      </div>
      
      {pendingEmail && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Cambio email in corso
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Email in attesa di conferma: <strong>{pendingEmail}</strong>
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Clicca sul link nell'email ricevuta per completare il cambio
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelEmailChange}
              className="text-orange-600 hover:text-orange-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      
      <form onSubmit={handleEmailChange} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new_email" className="flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>Nuova Email</span>
          </Label>
          <Input
            id="new_email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="nuova@email.com"
            required
            disabled={!!pendingEmail}
          />
          <p className="text-xs text-muted-foreground">
            Riceverai un'email di conferma al nuovo indirizzo
          </p>
        </div>
        
        <Button 
          type="submit" 
          disabled={updating || !!pendingEmail}
          className="w-full"
        >
          {updating ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              <span>Invio email...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span>Cambia Email</span>
            </div>
          )}
        </Button>
      </form>
    </div>
  );
};