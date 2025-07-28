import React from 'react';
import { CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ReactivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subscriptionTier: string;
  subscriptionEnd?: string;
  isLoading: boolean;
}

export const ReactivationModal: React.FC<ReactivationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  subscriptionTier,
  subscriptionEnd,
  isLoading
}) => {
  const nextBillingDate = subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString('it-IT') : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-primary" />
            <DialogTitle className="text-lg">RIATTIVAZIONE ABBONAMENTO</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            <div className="space-y-4">
              <p className="font-medium">
                Vuoi riattivare il tuo abbonamento {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)}?
              </p>
              
              <div className="space-y-2 text-sm">
                <div>• Il rinnovo automatico verrà ripristinato</div>
                <div>• L'abbonamento continuerà normalmente</div>
                {nextBillingDate && (
                  <div>• Prossimo addebito: {nextBillingDate}</div>
                )}
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
            variant="success"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Elaborazione...' : 'Conferma Riattivazione'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};