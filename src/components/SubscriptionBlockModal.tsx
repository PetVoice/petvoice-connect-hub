import React from 'react';
import { Crown, Lock } from 'lucide-react';
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
  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal={true}>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-destructive" />
            </div>
            <DialogTitle className="text-xl">🔒 ACCESSO BLOCCATO</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            <div className="space-y-4">
              <Card className="petvoice-card">
                <CardContent className="p-4 text-center">
                  <p className="font-medium text-foreground mb-2">
                    {isCancelledUser 
                      ? "Il tuo abbonamento è stato cancellato" 
                      : "Abbonamento Premium richiesto"
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isCancelledUser 
                      ? "Per continuare ad usare PetVoice devi riattivare l'abbonamento Premium"
                      : "Per utilizzare PetVoice devi attivare l'abbonamento Premium"
                    }
                  </p>
                </CardContent>
              </Card>
              
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-primary">€0,97</div>
                <div className="text-sm text-muted-foreground">/mese</div>
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