import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Heart, Thermometer, Pill } from 'lucide-react';

interface FirstAidGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FirstAidGuide: React.FC<FirstAidGuideProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-destructive" />
            Guida Primo Soccorso Veterinario
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Emergenze Critiche
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">🚨 Avvelenamento</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>NON indurre il vomito senza consultare il veterinario</li>
                  <li>Rimuovi la sostanza dalla bocca se visibile</li>
                  <li>Chiama immediatamente il centro antiveleni: +39 064 429 0300</li>
                  <li>Porta un campione della sostanza tossica dal veterinario</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">🩸 Emorragia</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Applica pressione diretta sulla ferita con un panno pulito</li>
                  <li>Mantieni l'animale calmo e immobile</li>
                  <li>NON rimuovere oggetti conficcati nella ferita</li>
                  <li>Trasporta immediatamente dal veterinario</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-5 w-5" />
                Controlli Vitali
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Temperatura normale:</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Cane: 38-39°C</li>
                  <li>Gatto: 38-39.5°C</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Frequenza cardiaca:</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Cane piccolo: 100-140 bpm</li>
                  <li>Cane grande: 60-100 bpm</li>
                  <li>Gatto: 140-220 bpm</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Cosa NON fare
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>NON dare farmaci umani senza consulto veterinario</li>
                <li>NON indurre il vomito se non indicato dal veterinario</li>
                <li>NON spostare animali con sospette fratture spinali</li>
                <li>NON applicare lacci emostatici</li>
                <li>NON dare cibo o acqua se deve essere operato</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};