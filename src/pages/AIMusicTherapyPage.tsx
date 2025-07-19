import React from 'react';
import { AIMusicTherapy } from '@/components/ai-features/AIMusicTherapy';
import { usePets } from '@/contexts/PetContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint } from 'lucide-react';

const AIMusicTherapyPage: React.FC = () => {
  const { selectedPet } = usePets();

  if (!selectedPet) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <PawPrint className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Nessun Pet Selezionato</CardTitle>
            <CardDescription>
              Seleziona un pet dalla pagina "I Miei Pet" per accedere alla musicoterapia AI
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
            AI Music Therapy
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