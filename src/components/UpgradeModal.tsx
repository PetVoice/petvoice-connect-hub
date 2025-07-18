import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useState } from "react";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UpgradeModal = ({ open, onOpenChange }: UpgradeModalProps) => {
  const { createCheckoutSession } = useSubscription();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setProcessingPlan('premium');
    try {
      const url = await createCheckoutSession('premium');
      if (url) {
        window.open(url, '_blank');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Sblocca tutte le funzionalità</DialogTitle>
          <DialogDescription className="text-center">
            Scegli il piano perfetto per le esigenze del tuo pet
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-w-md mx-auto mt-6">
          <div className="relative border-2 border-primary rounded-lg p-6 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">Premium</h3>
              <div className="text-3xl font-bold">€0.97<span className="text-sm font-normal">/mese</span></div>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Pet illimitati</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Analisi illimitate</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">AI Insights avanzati</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Music Therapy</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Export completo dati</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Supporto prioritario</span>
              </li>
            </ul>

            <Button 
              variant="outline"
              className="w-full" 
              onClick={handleSubscribe}
              disabled={processingPlan !== null}
            >
              {processingPlan === 'premium' ? 'Elaborazione...' : 'Scegli Premium'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};