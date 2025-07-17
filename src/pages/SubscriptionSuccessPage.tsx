import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from '@/hooks/use-toast';

const SubscriptionSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkSubscription } = useSubscription();
  const sessionId = searchParams.get('session_id');
  const toastShown = useRef(false);

  useEffect(() => {
    if (sessionId && !toastShown.current) {
      toastShown.current = true;
      
      // Show toast only once
      toast({
        title: "Abbonamento attivato!",
        description: "Benvenuto in PetVoice Premium! Il tuo abbonamento è ora attivo.",
      });
      
      // Refresh subscription status after successful payment
      setTimeout(() => {
        checkSubscription();
      }, 1000);

      // Se siamo in una nuova tab aperta per il pagamento
      if (window.opener) {
        // Invia messaggio al parent window per aggiornare lo stato
        try {
          window.opener.postMessage({ type: 'PAYMENT_SUCCESS' }, '*');
        } catch (error) {
          console.log('Could not communicate with parent window');
        }
        
        // Non chiudere automaticamente la tab - lasciare che l'utente scelga
      }
    }
  }, [sessionId, checkSubscription]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md mx-auto text-center">
        <CardHeader className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Abbonamento Attivato!
          </CardTitle>
          <CardDescription>
            Congratulazioni! Il tuo abbonamento PetVoice Premium è ora attivo.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-primary/5 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary font-medium">
              <Crown className="w-4 h-4" />
              Ora hai accesso a:
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Pet illimitati</li>
              <li>• Analisi illimitate</li>
              <li>• AI insights avanzati</li>
              <li>• Supporto prioritario</li>
            </ul>
          </div>
          
          {/* Mostra messaggio diverso se siamo in una nuova tab */}
          {window.opener ? (
            <div className="space-y-3">
              <Button 
                onClick={() => window.close()} 
                variant="default"
                className="w-full"
              >
                Chiudi Tab
              </Button>
              <Button 
                onClick={() => { 
                  window.opener.postMessage({ type: 'NAVIGATE_TO_DASHBOARD' }, '*'); 
                  window.close(); 
                }} 
                variant="outline"
                className="w-full"
              >
                Vai alla Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/')} 
                variant="outline"
                className="w-full"
              >
                Vai alla Dashboard
              </Button>
              <Button 
                onClick={() => navigate('/subscription')} 
                variant="outline" 
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Gestisci Abbonamento
              </Button>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            Riceverai una email di conferma con tutti i dettagli del tuo abbonamento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccessPage;