import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Phone, Mail, Clock, Plus, Loader2, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VeterinaryResult {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  email?: string;
  openingHours?: string;
  location: {
    lat: number;
    lng: number;
  };
  distance?: number;
  source: string;
}

interface VetsFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVetAdded: () => void;
  petId: string;
  userId: string;
}

export function VetsFinderModal({ isOpen, onClose, onVetAdded, petId, userId }: VetsFinderModalProps) {
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);
  const [veterinarians, setVeterinarians] = useState<VeterinaryResult[]>([]);
  const [isAdding, setIsAdding] = useState<string | null>(null);

  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalizzazione non supportata dal browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(new Error('Errore nell\'ottenere la posizione'));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  const searchNearbyVets = async () => {
    setIsSearching(true);
    try {
      const location = await getCurrentLocation();
      
      toast({
        title: "🔍 Ricerca in corso",
        description: "Cerco veterinari nella tua zona...",
        className: "border-blue-200 bg-blue-50 text-blue-800",
      });

      const { data, error } = await supabase.functions.invoke('find-nearby-vets', {
        body: {
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 15000 // 15km radius
        }
      });

      if (error) throw error;

      setVeterinarians(data.veterinarians || []);
      
      if (data.veterinarians?.length === 0) {
        toast({
          title: "Nessun risultato",
          description: "Non ho trovato veterinari nella tua zona. Prova ad ampliare la ricerca.",
          className: "border-orange-200 bg-orange-50 text-orange-800",
        });
      } else {
        toast({
          title: "✅ Ricerca completata",
          description: `Trovati ${data.veterinarians.length} veterinari nelle vicinanze`,
          className: "border-green-200 bg-green-50 text-green-800",
        });
      }

    } catch (error) {
      console.error('Error searching vets:', error);
      toast({
        title: "❌ Errore",
        description: "Errore nella ricerca dei veterinari. Verifica che la geolocalizzazione sia attiva.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addVeterinary = async (vet: VeterinaryResult) => {
    setIsAdding(vet.id);
    try {
      const { error } = await supabase
        .from('veterinary_contacts')
        .insert([{
          user_id: userId,
          pet_id: petId,
          name: vet.name,
          clinic_name: vet.name,
          phone: vet.phone || '',
          email: vet.email || '',
          address: vet.address,
          specialization: 'Veterinario Generico',
          emergency_available: false,
          notes: `Trovato tramite ricerca automatica (${vet.source})`,
          rating: 5
        }]);

      if (error) throw error;

      toast({
        title: "✅ Veterinario aggiunto",
        description: `${vet.name} è stato aggiunto ai tuoi contatti`,
        className: "border-green-200 bg-green-50 text-green-800",
      });

      onVetAdded();
    } catch (error) {
      console.error('Error adding veterinary:', error);
      toast({
        title: "❌ Errore",
        description: "Errore nell'aggiungere il veterinario",
        variant: "destructive"
      });
    } finally {
      setIsAdding(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <Navigation className="h-4 w-4 text-white" />
            </div>
            Trova Veterinari Vicini
          </DialogTitle>
          <DialogDescription>
            Trova veterinari nella tua zona usando la geolocalizzazione
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {veterinarians.length === 0 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/10 flex items-center justify-center">
                <Navigation className="h-10 w-10 text-green-500/60" />
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Clicca il pulsante per cercare veterinari nella tua zona
              </p>
              <Button 
                onClick={searchNearbyVets}
                disabled={isSearching}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Ricerca in corso...
                  </>
                ) : (
                  <>
                    <Navigation className="h-5 w-5 mr-2" />
                    Trova Veterinari Vicini
                  </>
                )}
              </Button>
            </div>
          )}

          {veterinarians.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Veterinari trovati ({veterinarians.length})
                </h3>
                <Button 
                  onClick={searchNearbyVets}
                  disabled={isSearching}
                  size="sm"
                  variant="outline"
                >
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cerca di nuovo"}
                </Button>
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-3 pr-4">
                  {veterinarians.map((vet) => (
                    <Card key={vet.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-lg">{vet.name}</h4>
                              {vet.distance && (
                                <Badge variant="outline" className="text-xs">
                                  📍 {vet.distance} km
                                </Badge>
                              )}
                            </div>

                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{vet.address}</span>
                              </div>
                              
                              {vet.phone && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Phone className="h-4 w-4" />
                                  <span>{vet.phone}</span>
                                </div>
                              )}
                              
                              {vet.email && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Mail className="h-4 w-4" />
                                  <span>{vet.email}</span>
                                </div>
                              )}
                              
                              {vet.openingHours && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>{vet.openingHours}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <Button
                            onClick={() => addVeterinary(vet)}
                            disabled={isAdding === vet.id}
                            size="sm"
                            className="ml-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                          >
                            {isAdding === vet.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-1" />
                                Aggiungi
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Chiudi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}