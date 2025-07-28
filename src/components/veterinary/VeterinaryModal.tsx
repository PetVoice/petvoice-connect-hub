import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, MapPin, Phone, Mail, Clock } from 'lucide-react';

interface VeterinaryContact {
  id?: string;
  name: string;
  clinic_name: string;
  specialization: string;
  phone: string;
  email: string;
  address: string;
  emergency_available: boolean;
  notes?: string;
  rating?: number;
}

interface VeterinaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  veterinary?: VeterinaryContact | null;
  petId: string;
}

export function VeterinaryModal({ 
  isOpen, 
  onClose, 
  onSave, 
  veterinary, 
  petId 
}: VeterinaryModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<VeterinaryContact>({
    name: '',
    clinic_name: '',
    specialization: '',
    phone: '',
    email: '',
    address: '',
    emergency_available: false,
    notes: '',
    rating: 5
  });

  useEffect(() => {
    if (veterinary) {
      setFormData(veterinary);
    } else {
      setFormData({
        name: '',
        clinic_name: '',
        specialization: '',
        phone: '',
        email: '',
        address: '',
        emergency_available: false,
        notes: '',
        rating: 5
      });
    }
  }, [veterinary, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato per salvare i dati del veterinario",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name.trim() || !formData.clinic_name.trim() || !formData.phone.trim()) {
      toast({
        title: "Errore",
        description: "Nome veterinario, clinica e telefono sono obbligatori",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const dataToSave = {
        ...formData,
        user_id: user.id,
        pet_id: petId,
        updated_at: new Date().toISOString()
      };

      if (veterinary?.id) {
        // Update existing
        const { error } = await supabase
          .from('veterinary_contacts')
          .update(dataToSave)
          .eq('id', veterinary.id)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Successo",
          description: "Veterinario aggiornato con successo"
        });
      } else {
        // Create new
        const { error } = await supabase
          .from('veterinary_contacts')
          .insert([dataToSave]);

        if (error) throw error;

        toast({
          title: "Successo", 
          description: "Veterinario aggiunto con successo"
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving veterinary contact:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const specializations = [
    'Veterinario Generico',
    'Chirurgo Veterinario',
    'Cardiologo Veterinario',
    'Dermatologo Veterinario',
    'Oculista Veterinario',
    'Ortopedico Veterinario',
    'Neurologo Veterinario',
    'Oncologo Veterinario',
    'Dentista Veterinario',
    'Comportamentalista',
    'Veterinario Esotici',
    'Altro'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <Phone className="h-4 w-4 text-white" />
            </div>
            {veterinary ? 'Modifica Veterinario' : 'Aggiungi Veterinario'}
          </DialogTitle>
          <DialogDescription>
            {veterinary ? 'Modifica le informazioni' : 'Inserisci le informazioni'} del veterinario di fiducia
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4 px-1">
            {/* Nome Veterinario */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Veterinario *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Dr. Mario Rossi"
                required
              />
            </div>

            {/* Nome Clinica */}
            <div className="space-y-2">
              <Label htmlFor="clinic_name">Nome Clinica *</Label>
              <Input
                id="clinic_name"
                value={formData.clinic_name}
                onChange={(e) => setFormData({...formData, clinic_name: e.target.value})}
                placeholder="Clinica Veterinaria San Francesco"
                required
              />
            </div>

            {/* Specializzazione */}
            <div className="space-y-2">
              <Label htmlFor="specialization">Specializzazione</Label>
              <Select 
                value={formData.specialization} 
                onValueChange={(value) => setFormData({...formData, specialization: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona specializzazione" />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Telefono */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+39 123 456 7890"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="dott.rossi@clinica.it"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Indirizzo */}
            <div className="space-y-2">
              <Label htmlFor="address">Indirizzo</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Via Roma 123, Milano (MI)"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Emergenze */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="emergency_available"
                checked={formData.emergency_available}
                onChange={(e) => setFormData({...formData, emergency_available: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="emergency_available" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Disponibile per emergenze 24/7
              </Label>
            </div>

            {/* Valutazione */}
            <div className="space-y-2">
              <Label htmlFor="rating">Valutazione (1-5 stelle)</Label>
              <Select 
                value={formData.rating?.toString()} 
                onValueChange={(value) => setFormData({...formData, rating: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona valutazione" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {'⭐'.repeat(rating)} ({rating} {rating === 1 ? 'stella' : 'stelle'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="notes">Note aggiuntive</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Note personali sul veterinario..."
                rows={3}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {veterinary ? 'Aggiorna' : 'Aggiungi'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}