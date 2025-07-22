import React from 'react';
import { AIMusicTherapy } from '@/components/ai-features/AIMusicTherapy';
import { usePets } from '@/contexts/PetContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const AIMusicTherapyPage: React.FC = () => {
  const { selectedPet } = usePets();
  const { t } = useTranslation();

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
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">🎵</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('navigation.aiMusicTherapy')}
          </h1>
          <p className="text-muted-foreground">
            Musicoterapia personalizzata per {selectedPet.name}
          </p>
        </div>
      </div>
      
      <AIMusicTherapy selectedPet={selectedPet} />
    </div>
  );
};

export default AIMusicTherapyPage;