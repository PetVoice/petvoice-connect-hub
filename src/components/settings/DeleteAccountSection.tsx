import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslatedToast } from '@/hooks/use-translated-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteAccountSectionProps {
  user: any;
}

export const DeleteAccountSection: React.FC<DeleteAccountSectionProps> = ({ user }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useTranslatedToast();
  
  const handleDeleteAccount = async () => {
    if (confirmText !== 'ELIMINA') {
      showToast({
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
      
      showToast({
        title: "Account eliminato con successo",
        description: "Il tuo account è stato eliminato definitivamente."
      });
      
      // Redirect alla home
      window.location.href = '/';
      
    } catch (error: any) {
      console.error('Errore eliminazione account:', error);
      showToast({
        title: "Errore",
        description: "Impossibile eliminare l'account: {error}",
        variant: "destructive",
        variables: { error: error.message }
      });
    } finally {
      setDeleting(false);
    }
  };
  
  return (
    <div className="bg-background border border-orange-200 dark:border-orange-800 rounded-lg p-6 hover:border-orange-300 dark:hover:border-orange-700 transition-colors">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 max-w-md w-full mx-4 border shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Conferma Eliminazione Account
                </h3>
                <p className="text-sm text-muted-foreground">
                  Questa azione non può essere annullata
                </p>
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                📋 Dati che verranno eliminati:
              </p>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <li>• Il tuo account e profilo utente</li>
                <li>• Tutti i tuoi animali domestici registrati</li>
                <li>• Tutte le analisi comportamentali effettuate</li>
                <li>• L'abbonamento Premium attivo (se presente)</li>
                <li>• Tutti i messaggi e conversazioni</li>
                <li>• Backup e cronologia completa</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="confirm_text" className="text-sm font-medium text-foreground">
                  Per confermare, digita <span className="font-mono bg-muted px-2 py-0.5 rounded text-red-600 dark:text-red-400 font-bold">ELIMINA</span>:
                </Label>
                <Input
                  id="confirm_text"
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Digita ELIMINA"
                  className="mt-2 font-mono"
                  autoComplete="off"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => {
                    setShowConfirm(false);
                    setConfirmText('');
                  }}
                  disabled={deleting}
                  variant="outline"
                  className="flex-1"
                >
                  🚫 Annulla
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
                      <span>Elaborazione...</span>
                    </div>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Elimina Definitivamente
                    </>
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