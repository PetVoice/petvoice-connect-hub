import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Send } from 'lucide-react';

interface EmailManagementProps {
  user: any;
}

export const EmailManagement: React.FC<EmailManagementProps> = ({ user }) => {
  const [newEmail, setNewEmail] = useState('');
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();
  
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail || !newEmail.includes('@')) {
      toast({
        title: "Errore",
        description: "Inserisci un email valida",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setUpdating(true);
      
      // Invia email di conferma
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });
      
      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Email di conferma inviata! Controlla la tua nuova email."
      });
      
      setNewEmail('');
      
    } catch (error: any) {
      console.error('Errore cambio email:', error);
      toast({
        title: "Errore",
        description: `Errore cambio email: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="current_email" className="flex items-center space-x-2">
          <Mail className="w-4 h-4" />
          <span>Email Attuale</span>
        </Label>
        <Input
          id="current_email"
          type="email"
          value={user.email || 'Nessuna email'}
          disabled
          className="bg-muted"
        />
      </div>
      
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
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={updating}
          className="w-full"
        >
          {updating ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              <span>Invio...</span>
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