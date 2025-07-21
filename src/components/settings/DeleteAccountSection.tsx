import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteAccountSectionProps {
  user: any;
}

export const DeleteAccountSection: React.FC<DeleteAccountSectionProps> = ({ user }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  
  const handleDeleteAccount = async () => {
    if (confirmText !== 'ELIMINA') {
      toast({
        title: "Errore",
        description: 'Digita "ELIMINA" per confermare',
        variant: "destructive"
      });
      return;
    }
    
    try {
      setDeleting(true);
      
      // Chiama l'edge function per eliminare l'account
      const { error } = await supabase.functions.invoke('delete-user-account', {
        body: { user_id: user.id }
      });
      
      if (error) throw error;
      
      toast({
        title: "Account eliminato",
        description: "Il tuo account è stato eliminato definitivamente."
      });
      
      // Redirect alla home
      window.location.href = '/';
      
    } catch (error: any) {
      console.error('Errore eliminazione account:', error);
      toast({
        title: "Errore",
        description: `Errore eliminazione account: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };
  
  return (
    <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h3 className="text-lg font-semibold text-destructive">Zona Pericolosa</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        L'eliminazione dell'account è permanente e non può essere annullata.
        Tutti i tuoi dati, pets, analisi e abbonamenti verranno eliminati.
      </p>
      
      <Button
        onClick={() => setShowConfirm(true)}
        variant="destructive"
        className="w-full"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Elimina Account Permanentemente
      </Button>
      
      {/* Modal Conferma */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 border">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-destructive" />
              <h3 className="text-lg font-semibold text-destructive">
                Conferma Eliminazione Account
              </h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Questa azione eliminerà:
            </p>
            <ul className="text-sm text-muted-foreground mb-4 list-disc pl-5 space-y-1">
              <li>Il tuo account e profilo</li>
              <li>Tutti i tuoi animali domestici</li>
              <li>Tutte le analisi effettuate</li>
              
              <li>L'abbonamento attivo (se presente)</li>
              <li>Tutti i messaggi e dati</li>
            </ul>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="confirm_text" className="text-sm font-semibold">
                  Digita "ELIMINA" per confermare:
                </Label>
                <Input
                  id="confirm_text"
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="ELIMINA"
                  className="mt-2"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowConfirm(false)}
                  disabled={deleting}
                  variant="outline"
                  className="flex-1"
                >
                  Annulla
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={deleting || confirmText !== 'ELIMINA'}
                  variant="destructive"
                  className="flex-1"
                >
                  {deleting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      <span>Eliminazione...</span>
                    </div>
                  ) : (
                    'Elimina Definitivamente'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};