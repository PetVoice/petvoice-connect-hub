import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUnifiedToast } from '@/hooks/use-unified-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Phone, Mail, Users, Save, AlertTriangle } from 'lucide-react';
import { GooglePlacesInput } from '@/components/settings/GooglePlacesInput';

interface EmergencyContact {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  relationship?: string;
  contact_type?: string;
  address?: string;
  is_primary?: boolean;
  notes?: string;
}

interface EmergencyContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  contact?: EmergencyContact | null;
}

export function EmergencyContactModal({ 
  isOpen, 
  onClose, 
  onSave, 
  contact 
}: EmergencyContactModalProps) {
  const { showSuccessToast, showErrorToast } = useUnifiedToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<EmergencyContact>({
    name: '',
    phone: '',
    email: '',
    relationship: '',
    contact_type: 'emergency',
    address: '',
    is_primary: false,
    notes: ''
  });

  useEffect(() => {
    if (contact) {
      setFormData(contact);
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        relationship: '',
        contact_type: 'emergency',
        address: '',
        is_primary: false,
        notes: ''
      });
    }
  }, [contact, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showErrorToast({
        title: "Errore di autenticazione",
        description: "Devi essere autenticato per salvare i contatti di emergenza"
      });
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim()) {
      showErrorToast({
        title: "Campi obbligatori mancanti",
        description: "Nome e telefono sono obbligatori"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const dataToSave = {
        ...formData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (contact?.id) {
        // Update existing
        const { error } = await supabase
          .from('emergency_contacts')
          .update(dataToSave)
          .eq('id', contact.id)
          .eq('user_id', user.id);

        if (error) throw error;

        showSuccessToast({
          title: "Contatto aggiornato",
          description: "Il contatto di emergenza è stato aggiornato con successo"
        });
      } else {
        // Create new
        const { error } = await supabase
          .from('emergency_contacts')
          .insert([dataToSave]);

        if (error) throw error;

        showSuccessToast({
          title: "Contatto aggiunto",
          description: "Il contatto di emergenza è stato aggiunto con successo"
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving emergency contact:', error);
      showErrorToast({
        title: "Errore di salvataggio",
        description: "Si è verificato un errore durante il salvataggio del contatto"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const relationships = [
    'Familiare',
    'Veterinario di Fiducia',
    'Clinica Veterinaria',
    'Pronto Soccorso Veterinario',
    'Amico/Conoscente',
    'Pet Sitter',
    'Altro'
  ];

  const contactTypes = [
    { value: 'emergency', label: 'Emergenza' },
    { value: 'veterinary', label: 'Veterinario' },
    { value: 'family', label: 'Familiare' },
    { value: 'professional', label: 'Professionale' },
    { value: 'other', label: 'Altro' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            {contact ? 'Modifica Contatto Emergenza' : 'Aggiungi Contatto Emergenza'}
          </DialogTitle>
          <DialogDescription>
            {contact ? 'Modifica le informazioni' : 'Inserisci le informazioni'} del contatto di emergenza
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4 px-1">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Contatto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Dr. Mario Rossi / Clinica Veterinaria"
                required
              />
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
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="contatto@email.it"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Relazione */}
            <div className="space-y-2">
              <Label htmlFor="relationship">Relazione</Label>
              <Select 
                value={formData.relationship || ''} 
                onValueChange={(value) => setFormData({...formData, relationship: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona relazione" />
                </SelectTrigger>
                <SelectContent>
                  {relationships.map((rel) => (
                    <SelectItem key={rel} value={rel}>
                      {rel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo Contatto */}
            <div className="space-y-2">
              <Label htmlFor="contact_type">Tipo Contatto</Label>
              <Select 
                value={formData.contact_type || 'emergency'} 
                onValueChange={(value) => setFormData({...formData, contact_type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  {contactTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Indirizzo */}
            <div className="space-y-2">
              <Label htmlFor="address">Indirizzo</Label>
              <GooglePlacesInput
                value={formData.address || ''}
                onChange={(value) => setFormData({...formData, address: value})}
                placeholder="Inizia a digitare l'indirizzo..."
                onAddressSelect={(details) => {
                  setFormData({...formData, address: details.full_address});
                }}
              />
            </div>

            {/* Contatto Primario */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_primary"
                checked={formData.is_primary || false}
                onChange={(e) => setFormData({...formData, is_primary: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="is_primary" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Contatto di emergenza primario
              </Label>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="notes">Note aggiuntive</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Note personali sul contatto..."
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
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {contact ? 'Aggiorna Contatto' : 'Aggiungi Contatto'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}