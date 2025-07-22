import React from 'react';
import { AIMusicTherapy } from '@/components/ai-features/AIMusicTherapy';
import { usePets } from '@/contexts/PetContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { FirstTimeGuide } from '@/components/tutorial/FirstTimeGuide';
import { useFirstTimeUser } from '@/hooks/useFirstTimeUser';

const AIMusicTherapyPage: React.FC = () => {
  const { selectedPet } = usePets();
  const { t } = useTranslation();
  const { isFirstTime, isLoading, markAsCompleted } = useFirstTimeUser('music_therapy');

  const guideSteps = [
    {
      id: 'step-1',
      title: '🎵 Analizza le Emozioni',
      description: 'Clicca qui per far analizzare all\'intelligenza artificiale le emozioni del tuo pet attraverso i suoi comportamenti.',
      targetSelector: '[data-tutorial="analyze-button"]',
      position: 'bottom' as const
    },
    {
      id: 'step-2', 
      title: '🎼 Scegli la Terapia',
      description: 'Una volta completata l\'analisi, apparirà una lista di terapie musicali specifiche per le emozioni rilevate. Clicca su una categoria per iniziare.',
      targetSelector: '[data-tutorial="therapy-categories"]',
      position: 'top' as const
    },
    {
      id: 'step-3',
      title: '🎧 Ascolta e Rilassa',
      description: 'Premi play per far ascoltare al tuo pet le frequenze terapeutiche personalizzate. Osserva come si rilassa!',
      targetSelector: '[data-tutorial="play-button"]', 
      position: 'top' as const
    }
  ];

  if (!selectedPet) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <PawPrint className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>{t('pets.noPetSelected')}</CardTitle>
            <CardDescription>
              {t('pets.selectPetDesc')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg gradient-azure flex items-center justify-center shadow-glow">
          <span className="text-white font-bold text-lg">🎵</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-azure to-azure-dark bg-clip-text text-transparent">
            {t('navigation.aiMusicTherapy')}
          </h1>
          <p className="text-muted-foreground">
            Musicoterapia personalizzata per {selectedPet.name}
          </p>
        </div>
      </div>
      
      <AIMusicTherapy selectedPet={selectedPet} />
      
      {/* Guida per il primo accesso */}
      {isFirstTime && !isLoading && (
        <FirstTimeGuide
          steps={guideSteps}
          onComplete={markAsCompleted}
          onSkip={markAsCompleted}
        />
      )}
    </div>
  );
};

export default AIMusicTherapyPage;