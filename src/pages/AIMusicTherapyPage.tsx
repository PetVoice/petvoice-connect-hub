import React from 'react';
import { AIMusicTherapy } from '@/components/ai-features/AIMusicTherapy';
import { usePets } from '@/contexts/PetContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint, Music } from 'lucide-react';
// Translation system removed - Italian only

const AIMusicTherapyPage: React.FC = () => {
  const { selectedPet } = usePets();
  // Translation system removed - Italian only

  if (!selectedPet) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <PawPrint className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Nessun pet selezionato</CardTitle>
            <CardDescription>
              Seleziona un pet per accedere alle funzionalità di musicoterapia AI
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Music className="h-8 w-8 text-primary" />
            Musicoterapia AI
          </h1>
          <p className="text-muted-foreground">
            Terapia musicale personalizzata per {selectedPet.name}
          </p>
        </div>
      </div>
      
      <AIMusicTherapy selectedPet={selectedPet} />
    </div>
  );
};

export default AIMusicTherapyPage;