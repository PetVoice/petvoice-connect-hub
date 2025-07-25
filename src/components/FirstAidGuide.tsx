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
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Emergenze Critiche
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">🚨 Avvelenamento</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Sintomi: vomito, diarrea, salivazione eccessiva, convulsioni, difficoltà respiratorie
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>AZIONE:</strong> NON indurre il vomito. Contatta immediatamente il veterinario. Conserva l'etichetta della sostanza ingerita.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🩸 Emorragia Grave</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Perdita di sangue abbondante, pallore delle gengive, debolezza
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>AZIONE:</strong> Applica pressione diretta con garza sterile. Solleva l'arto se possibile. Corsa immediata dal veterinario.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🌡️ Colpo di Calore</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Respiro affannoso, temperatura oltre 40°C, lingua blu/viola
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>AZIONE:</strong> Sposta in zona fresca, applica acqua tiepida su zampe e corpo. NON ghiaccio!
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Parametri Vitali Normali</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">🌡️ Temperatura Corporea</h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>Cani:</strong> 38.0-39.2°C<br/>
                    <strong>Gatti:</strong> 38.1-39.2°C<br/>
                    <em>Misurazione: termometro rettale</em>
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">❤️ Frequenza Cardiaca</h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>Cani grandi:</strong> 60-100 bpm<br/>
                    <strong>Cani piccoli:</strong> 100-140 bpm<br/>
                    <strong>Gatti:</strong> 140-220 bpm<br/>
                    <em>Palpazione: arteria femorale</em>
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🫁 Respirazione</h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>Cani:</strong> 10-30 atti/min<br/>
                    <strong>Gatti:</strong> 20-30 atti/min<br/>
                    <em>Osservazione: movimento del torace</em>
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">👄 Colore Gengive</h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>Normale:</strong> Rosa<br/>
                    <strong>Pallide:</strong> Shock, anemia<br/>
                    <strong>Blu/Viola:</strong> Mancanza ossigeno<br/>
                    <strong>Gialle:</strong> Problemi fegato
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-success">Manovre di Primo Soccorso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">💚 RCP per Animali</h4>
                  <p className="text-sm text-muted-foreground">
                    1. Verifica assenza battito<br/>
                    2. Posiziona su superficie rigida<br/>
                    3. Compressioni: 100-120/min<br/>
                    4. Respirazione: 1 ogni 30 compressioni
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🤲 Manovra di Heimlich</h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>Cani piccoli:</strong> Tieni a testa in giù, colpi tra le scapole<br/>
                    <strong>Cani grandi:</strong> Pressione sotto gabbia toracica verso l'alto
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🚑 Trasporto Emergenza</h4>
                  <p className="text-sm text-muted-foreground">
                    Usa coperta rigida come barella. Immobilizza testa e collo se sospetti trauma spinale.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-accent-foreground">Kit Primo Soccorso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Essenziali:</strong> Garze sterili, bende elastiche, termometro digitale, forbici, pinzette, siringa senza ago, soluzione fisiologica, guanti monouso, coperta termica, museruola di emergenza, numeri veterinario di emergenza.
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-destructive">⚠️ Cosa NON Fare MAI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>NON dare farmaci umani (paracetamolo, ibuprofene = MORTALI)</li>
                    <li>NON indurre vomito per sostanze caustiche/petrolifere</li>
                    <li>NON muovere animali con sospette fratture</li>
                    <li>NON usare ghiaccio diretto sulla pelle</li>
                    <li>NON fasciare troppo stretto</li>
                  </ul>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>NON dare acqua ad animali incoscienti</li>
                    <li>NON rimuovere oggetti conficcati profondamente</li>
                    <li>NON fare pressione su occhi feriti</li>
                    <li>NON toccare animali elettrocutati senza staccare corrente</li>
                    <li>NON perdere tempo: il fattore tempo è CRITICO</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-warning">☠️ Sostanze Tossiche Comuni</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div>
                    <h5 className="font-semibold mb-2">🍫 Alimenti Pericolosi:</h5>
                    <ul className="space-y-1">
                      <li>• Cioccolato (teobromina)</li>
                      <li>• Uva e uvetta</li>
                      <li>• Cipolle e aglio</li>
                      <li>• Xilitol (dolcificante)</li>
                      <li>• Avocado</li>
                      <li>• Caffè e tè</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">🌿 Piante Tossiche:</h5>
                    <ul className="space-y-1">
                      <li>• Oleandro</li>
                      <li>• Azalea</li>
                      <li>• Giglio (mortale per gatti)</li>
                      <li>• Stella di Natale</li>
                      <li>• Tulipani (bulbi)</li>
                      <li>• Edera</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">🧽 Prodotti Domestici:</h5>
                    <ul className="space-y-1">
                      <li>• Antigelo (etilene glicole)</li>
                      <li>• Insetticidi</li>
                      <li>• Candeggina</li>
                      <li>• Detersivi</li>
                      <li>• Ratticidi</li>
                      <li>• Prodotti per auto</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-warning">📞 Numeri di Emergenza</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-semibold mb-2">Italia:</h5>
                    <ul className="space-y-1">
                      <li><strong>Centro Antiveleni Milano:</strong> +39 02 66101029</li>
                      <li><strong>Centro Antiveleni Pavia:</strong> +39 0382 24444</li>
                      <li><strong>Emergenza Generale:</strong> 112</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">Cliniche H24 Roma:</h5>
                    <ul className="space-y-1">
                      <li><strong>Clinica Veterinaria Gregorio VII:</strong> +39 06 6618987</li>
                      <li><strong>AniCura CMV:</strong> +39 06 2058347</li>
                      <li><strong>Ospedale Veterinario I Tre Ponti:</strong> +39 06 5006666</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};