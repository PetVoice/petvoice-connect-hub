import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Eye, Volume2, Type, X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface AccessibilityGuidesProps {
  onClose: () => void;
}

export const AccessibilityGuides: React.FC<AccessibilityGuidesProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background max-w-4xl max-h-[90vh] w-full mx-4 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Guide Accessibilità</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="screen-reader" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="screen-reader" className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Screen Reader
              </TabsTrigger>
              <TabsTrigger value="contrast" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Alto Contrasto
              </TabsTrigger>
              <TabsTrigger value="font-size" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Dimensione Font
              </TabsTrigger>
            </TabsList>

            <TabsContent value="screen-reader" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    Guida Screen Reader
                  </CardTitle>
                  <CardDescription>
                    Come utilizzare l'app con i lettori di schermo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Attivazione</h4>
                        <p className="text-sm text-muted-foreground">
                          Vai nelle impostazioni di accessibilità e attiva "Ottimizzazione screen reader"
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Navigazione</h4>
                        <p className="text-sm text-muted-foreground">
                          Utilizza Tab per navigare tra gli elementi, Invio per attivare pulsanti e link
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Regioni Live</h4>
                        <p className="text-sm text-muted-foreground">
                          L'app annuncerà automaticamente i cambiamenti importanti e le notifiche
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Screen Reader Supportati</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">NVDA</Badge>
                      <Badge variant="secondary">JAWS</Badge>
                      <Badge variant="secondary">VoiceOver</Badge>
                      <Badge variant="secondary">TalkBack</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contrast" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Guida Alto Contrasto
                  </CardTitle>
                  <CardDescription>
                    Migliora la visibilità con colori ad alto contrasto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Attivazione</h4>
                        <p className="text-sm text-muted-foreground">
                          Nelle impostazioni di accessibilità, attiva "Alto contrasto" per avere colori più definiti
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Benefici</h4>
                        <p className="text-sm text-muted-foreground">
                          Migliora la leggibilità per persone con problemi di vista o dislessia
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Compatibilità</h4>
                        <p className="text-sm text-muted-foreground">
                          Funziona con tutti i browser moderni e si adatta al tema scuro/chiaro
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Cosa Cambia</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Contrasto aumentato del 150%</li>
                      <li>• Luminosità migliorata del 20%</li>
                      <li>• Bordi più definiti su pulsanti e input</li>
                      <li>• Colori più saturi e distinguibili</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="font-size" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    Guida Dimensione Font
                  </CardTitle>
                  <CardDescription>
                    Regola la dimensione del testo per una migliore leggibilità
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Regolazione</h4>
                        <p className="text-sm text-muted-foreground">
                          Scegli tra 4 dimensioni: Piccolo, Medio, Grande, Extra Large
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Applicazione</h4>
                        <p className="text-sm text-muted-foreground">
                          Le modifiche si applicano immediatamente a tutta l'interfaccia
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Persistenza</h4>
                        <p className="text-sm text-muted-foreground">
                          La dimensione scelta viene salvata e mantenuta tra le sessioni
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Dimensioni Disponibili</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Piccolo</Badge>
                        <span className="text-sm">14px</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Medio</Badge>
                        <span className="text-base">16px (predefinito)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Grande</Badge>
                        <span className="text-lg">18px</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Extra Large</Badge>
                        <span className="text-xl">20px</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};