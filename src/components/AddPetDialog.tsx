import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { useToast } from '@/hooks/use-toast';
import { UnifiedDatePicker } from '@/components/ui/unified-date-picker';
import { format } from 'date-fns';

interface AddPetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const dogBreeds = [
  'Affenpinscher', 'Afghan Hound', 'Airedale Terrier', 'Alaskan Malamute', 'American Bulldog',
  'American Cocker Spaniel', 'American Pit Bull Terrier', 'American Staffordshire Terrier',
  'Basenji', 'Basset Hound', 'Beagle', 'Bearded Collie', 'Bernese Mountain Dog',
  'Bichon Frise', 'Bloodhound', 'Border Collie', 'Border Terrier', 'Boston Terrier',
  'Boxer', 'Brittany', 'Bulldog', 'Bulldog Francese', 'Bull Terrier', 'Cairn Terrier',
  'Cane Corso', 'Cavalier King Charles Spaniel', 'Chihuahua', 'Chinese Crested',
  'Chow Chow', 'Cocker Spaniel', 'Collie', 'Dachshund', 'Dalmatian', 'Doberman',
  'English Setter', 'English Springer Spaniel', 'Fox Terrier', 'French Bulldog',
  'German Shepherd', 'German Shorthaired Pointer', 'Golden Retriever', 'Great Dane',
  'Greyhound', 'Havanese', 'Irish Setter', 'Irish Wolfhound', 'Jack Russell Terrier',
  'Japanese Spitz', 'Labrador Retriever', 'Lagotto Romagnolo', 'Maltese', 'Mastiff',
  'Newfoundland', 'Pastore Tedesco', 'Pomeranian', 'Poodle', 'Pug', 'Rottweiler',
  'Saint Bernard', 'Samoyed', 'Schnauzer', 'Scottish Terrier', 'Shar Pei',
  'Shih Tzu', 'Siberian Husky', 'Staffordshire Bull Terrier', 'Weimaraner',
  'West Highland White Terrier', 'Whippet', 'Yorkshire Terrier'
];

const catBreeds = [
  'Abissino', 'American Curl', 'American Shorthair', 'Angora Turco', 'Balinese',
  'Bengala', 'Birmano', 'Bombay', 'British Longhair', 'British Shorthair',
  'Burmese', 'California Spangled', 'Certosino', 'Cornish Rex', 'Devon Rex',
  'Egyptian Mau', 'Europeo', 'Exotic Shorthair', 'Himalayan', 'Japanese Bobtail',
  'Korat', 'LaPerm', 'Maine Coon', 'Manx', 'Munchkin', 'Nebelung',
  'Norwegian Forest Cat', 'Ocicat', 'Oriental', 'Persiano', 'Peterbald',
  'Pixie-bob', 'Ragdoll', 'Russian Blue', 'Savannah', 'Scottish Fold',
  'Selkirk Rex', 'Siamese', 'Siberian', 'Singapura', 'Somali', 'Sphynx',
  'Tonkinese', 'Turkish Van'
];

export const AddPetDialog: React.FC<AddPetDialogProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { addPet } = usePets();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [birthDate, setBirthDate] = useState<Date>();
  
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    breed: '',
    weight: '',
    description: '',
    allergies: '',
    fears: '',
    favorite_activities: '',
    health_conditions: '',
    personality_traits: '',
    gender: 'unknown' as 'male' | 'female' | 'unknown',
    microchip_number: ''
  });

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const getAvailableBreeds = () => {
    return formData.type === 'Cane' ? dogBreeds : catBreeds;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      breed: '',
      weight: '',
      description: '',
      allergies: '',
      fears: '',
      favorite_activities: '',
      health_conditions: '',
      personality_traits: '',
      gender: 'unknown' as 'male' | 'female' | 'unknown',
      microchip_number: ''
    });
    setBirthDate(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Prevent double submission
    if (loading) return;

    if (!formData.name || !formData.type) {
      toast({
        title: 'Errore',
        description: 'Nome e tipo sono obbligatori',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    
    try {
      const age = birthDate ? calculateAge(birthDate) : null;
      const birth_date = birthDate ? format(birthDate, 'yyyy-MM-dd') : null;

      const petData = {
        name: formData.name,
        type: formData.type,
        breed: formData.breed || null,
        birth_date,
        age,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        description: formData.description || null,
        allergies: formData.allergies || null,
        fears: formData.fears || null,
        favorite_activities: formData.favorite_activities || null,
        health_conditions: formData.health_conditions || null,
        personality_traits: formData.personality_traits || null,
        gender: formData.gender,
        microchip_number: formData.microchip_number || null,
        avatar_url: null
      };

      const result = await addPet(petData);
      
      if (result) {
        resetForm();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] shadow-elegant">
        <div className="max-h-[80vh] overflow-y-auto px-1">
          <DialogHeader>
            <DialogTitle>Aggiungi animale</DialogTitle>
            <DialogDescription>
              Inserisci tutte le informazioni del tuo nuovo pet
            </DialogDescription>
          </DialogHeader>
        
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nome del pet"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Tipo *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({...formData, type: value, breed: ''})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona il tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cane">Cane</SelectItem>
                    <SelectItem value="Gatto">Gatto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type && (
                <div>
                  <Label htmlFor="breed">Razza</Label>
                  <Select 
                    value={formData.breed} 
                    onValueChange={(value) => setFormData({...formData, breed: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona la razza" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableBreeds().map((breed) => (
                        <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="gender">Sesso</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(value) => setFormData({...formData, gender: value as 'male' | 'female' | 'unknown'})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona il sesso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Maschio</SelectItem>
                    <SelectItem value="female">Femmina</SelectItem>
                    <SelectItem value="unknown">Non specificato</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  placeholder="Es. 5.2"
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>

              <div>
                <Label htmlFor="microchip_number">Numero microchip</Label>
                <Input
                  id="microchip_number"
                  value={formData.microchip_number}
                  onChange={(e) => setFormData({...formData, microchip_number: e.target.value})}
                  placeholder="Es. 123456789012345"
                />
              </div>

              <UnifiedDatePicker
                label="Data di nascita (opzionale)"
                value={birthDate}
                onChange={setBirthDate}
                placeholder="Seleziona data di nascita"
                disabled={(date) => date > new Date()}
              />

              <div className="md:col-span-2">
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descrivi il tuo pet..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="allergies">Allergie</Label>
                <Input
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                  placeholder="Es. Polline, acari..."
                />
              </div>

              <div>
                <Label htmlFor="fears">Paure</Label>
                <Input
                  id="fears"
                  value={formData.fears}
                  onChange={(e) => setFormData({...formData, fears: e.target.value})}
                  placeholder="Es. Temporali, rumori forti..."
                />
              </div>

              <div>
                <Label htmlFor="favorite_activities">Attività preferite</Label>
                <Input
                  id="favorite_activities"
                  value={formData.favorite_activities}
                  onChange={(e) => setFormData({...formData, favorite_activities: e.target.value})}
                  placeholder="Es. Giocare, correre..."
                />
              </div>

              <div>
                <Label htmlFor="health_conditions">Condizioni di salute</Label>
                <Input
                  id="health_conditions"
                  value={formData.health_conditions}
                  onChange={(e) => setFormData({...formData, health_conditions: e.target.value})}
                  placeholder="Es. Artrite, diabete..."
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="personality_traits">Tratti della personalità</Label>
                <Textarea
                  id="personality_traits"
                  value={formData.personality_traits}
                  onChange={(e) => setFormData({...formData, personality_traits: e.target.value})}
                  placeholder="Es. Giocoso, timido, energico..."
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annulla
              </Button>
              <Button 
                type="submit" 
                disabled={loading} 
                className="petvoice-button"
                onClick={(e) => {
                  if (loading) {
                    e.preventDefault();
                    return;
                  }
                }}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Caricamento...' : 'Aggiungi animale'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};