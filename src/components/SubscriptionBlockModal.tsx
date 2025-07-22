import React from 'react';
import { Crown, Lock, Check, Sparkles, Heart, Brain, Calendar, BarChart3 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SubscriptionBlockModalProps {
  isOpen: boolean;
  onSubscribe: () => void;
  isLoading: boolean;
  isCancelledUser?: boolean;
}

export const SubscriptionBlockModal: React.FC<SubscriptionBlockModalProps> = ({
  isOpen,
  onSubscribe,
  isLoading,
  isCancelledUser = false
}) => {
  const features = [
    {
      icon: Heart,
      title: "Analisi Emozionale AI",
      description: "Comprendi le emozioni del tuo pet con l'intelligenza artificiale"
    },
    {
      icon: Brain,
      title: "Comportamento Avanzato",
      description: "Insights dettagliati sul comportamento e consigli personalizzati"
    },
    {
      icon: Calendar,
      title: "Calendario Smart",
      description: "Promemoria automatici per visite vet, medicinali e attività"
    },
    {
      icon: BarChart3,
      title: "Statistiche Complete",
      description: "Analisi dettagliate della salute e benessere del tuo pet"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal={true}>
      <DialogContent className="max-w-lg" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                PetVoice Premium
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {isCancelledUser 
                  ? "Riattiva per continuare ad usare tutte le funzionalità" 
                  : "Sblocca tutte le funzionalità avanzate"
                }
              </p>
            </div>
          </div>
          
          <DialogDescription asChild>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <feature.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-foreground">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                  </div>
                ))}
              </div>
              
              <div className="text-center p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                <div className="text-3xl font-bold text-primary">€0,97</div>
                <div className="text-sm text-muted-foreground">/mese · Cancella quando vuoi</div>
                <div className="text-xs text-primary mt-1">✨ Accesso immediato a tutte le funzionalità</div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <Button
            onClick={onSubscribe}
            disabled={isLoading}
            className="w-full petvoice-button py-4 text-lg"
          >
            {isLoading ? (
              "Reindirizzamento..."
            ) : (
              <>
                <Crown className="w-5 h-5 mr-2" />
                {isCancelledUser ? "RIATTIVA PREMIUM - €0,97/mese" : "ATTIVA PREMIUM - €0,97/mese"}
              </>
            )}
          </Button>
          
          <p className="text-center text-xs text-muted-foreground mt-3">
            Modal non chiudibile - Devi {isCancelledUser ? "riattivare" : "attivare"} l'abbonamento per continuare
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};