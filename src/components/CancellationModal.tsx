import React from 'react';
import { AlertTriangle, Calendar, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cancellationType: 'immediate' | 'end_of_period';
  subscriptionTier: string;
  subscriptionEnd?: string;
  isLoading: boolean;
}

export const CancellationModal: React.FC<CancellationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  cancellationType,
  subscriptionTier,
  subscriptionEnd,
  isLoading
}) => {
  const endDate = subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString('it-IT') : '';

  const immediateContent = {
    title: "⚠️ CANCELLAZIONE IMMEDIATA",
    icon: <AlertTriangle className="w-6 h-6 text-destructive" />,
    description: "Cosa succederà ORA:",
    consequences: [
      "❌ Abbonamento terminato immediatamente",
      "❌ Accesso all'app bloccato completamente",
      "❌ Tutte le funzionalità disabilitate",
      "❌ Dovrai riattivare l'abbonamento per continuare",
      "❌ Nessun rimborso"
    ],
    question: "Sei sicuro di voler cancellare immediatamente?",
    confirmText: "CANCELLA ORA",
    variant: "destructive" as const
  };

  const endOfPeriodContent = {
    title: "CANCELLAZIONE A FINE PERIODO",
    icon: <Calendar className="w-6 h-6 text-primary" />,
    description: "Cosa succederà:",
    consequences: [
      `✅ Abbonamento attivo fino al ${endDate}`,
      `✅ Tutte le funzioni disponibili fino al ${endDate}`,
      "✅ Nessuna perdita di dati",
      "⚠️ Non ci sarà rinnovo automatico",
      `⚠️ Dal ${endDate} l'accesso all'app verrà bloccato`,
      `⚠️ Dovrai riattivare l'abbonamento per continuare ad usare PetVoice`
    ],
    question: "Confermi la cancellazione a fine periodo?",
    confirmText: "CONFERMA CANCELLAZIONE",
    variant: "destructive" as const
  };

  const content = cancellationType === 'immediate' ? immediateContent : endOfPeriodContent;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {content.icon}
            <DialogTitle className="text-lg">{content.title}</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            <div className="space-y-4">
              <p className="font-medium">{content.description}</p>
              
              <div className="space-y-2">
                {content.consequences.map((consequence, index) => (
                  <div key={index} className="text-sm">
                    {consequence}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <p className="font-medium text-foreground">
                  {content.question}
                </p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Annulla
          </Button>
          <Button
            variant={content.variant}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Elaborazione...' : content.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};