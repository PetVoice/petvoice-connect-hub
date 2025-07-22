import React from 'react';
import { FirstStepsGuide } from '@/components/onboarding/FirstStepsGuide';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FirstStepsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alla Dashboard
          </Button>
          
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold gradient-text mb-4">
              Benvenuto in PetVille! 🐾
            </h1>
            <p className="text-lg text-muted-foreground">
              Segui questa guida interattiva per iniziare al meglio il tuo viaggio con l'app. 
              Ogni passo ti aiuterà a scoprire una funzionalità importante.
            </p>
          </div>
        </div>

        {/* Guide Component */}
        <FirstStepsGuide />

        {/* Additional Tips */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">💡 Suggerimenti utili</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Puoi sempre tornare a questa guida dal menu principale</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>Le funzionalità AI si attivano automaticamente man mano che usi l'app</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                <span>La community è sempre disponibile per aiuto e consigli</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                <span>Ricorda di aggiornare regolarmente il diario del tuo pet</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstStepsPage;