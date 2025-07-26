import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload,
  Heart,
  Star,
  PawPrint
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { toast } from '@/hooks/use-toast';
import { useTranslatedToast } from '@/hooks/use-translated-toast';
import { useNavigate } from 'react-router-dom';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useNotifications } from '@/hooks/useNotifications';
// Translation system removed - Italian only

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string | null;
  birth_date: string | null;
  age: number | null;
  weight: number | null;
  description: string | null;
  allergies: string | null;
  fears: string | null;
  favorite_activities: string | null;
  health_conditions: string | null;
  personality_traits: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  gender: 'male' | 'female' | 'unknown';
  microchip_number?: string;
}

const dogBreeds = {
  it: [
    'Affenpinscher', 'Levriero Afgano', 'Airedale Terrier', 'Alaskan Malamute', 'Bulldog Americano',
    'Cocker Spaniel Americano', 'American Pit Bull Terrier', 'American Staffordshire Terrier',
    'Basenji', 'Basset Hound', 'Beagle', 'Bearded Collie', 'Bovaro del Bernese',
    'Bichon Frise', 'Segugio', 'Border Collie', 'Border Terrier', 'Boston Terrier',
    'Boxer', 'Brittany', 'Bulldog', 'Bulldog Francese', 'Bull Terrier', 'Cairn Terrier',
    'Cane Corso', 'Cavalier King Charles Spaniel', 'Chihuahua', 'Cane Nudo Cinese',
    'Chow Chow', 'Cocker Spaniel', 'Collie', 'Bassotto', 'Dalmata', 'Dobermann',
    'Setter Inglese', 'Springer Spaniel Inglese', 'Fox Terrier', 'Bulldog Francese',
    'Pastore Tedesco', 'Pointer Tedesco', 'Golden Retriever', 'Alano',
    'Levriero', 'Havanese', 'Setter Irlandese', 'Levriero Irlandese', 'Jack Russell Terrier',
    'Spitz Giapponese', 'Labrador Retriever', 'Lagotto Romagnolo', 'Maltese', 'Mastiff',
    'Terranova', 'Pastore Tedesco', 'Volpino di Pomerania', 'Barboncino', 'Carlino', 'Rottweiler',
    'San Bernardo', 'Samoiedo', 'Schnauzer', 'Terrier Scozzese', 'Shar Pei',
    'Shih Tzu', 'Husky Siberiano', 'Staffordshire Bull Terrier', 'Weimaraner',
    'West Highland White Terrier', 'Whippet', 'Yorkshire Terrier'
  ],
  en: [
    'Affenpinscher', 'Afghan Hound', 'Airedale Terrier', 'Alaskan Malamute', 'American Bulldog',
    'American Cocker Spaniel', 'American Pit Bull Terrier', 'American Staffordshire Terrier',
    'Basenji', 'Basset Hound', 'Beagle', 'Bearded Collie', 'Bernese Mountain Dog',
    'Bichon Frise', 'Bloodhound', 'Border Collie', 'Border Terrier', 'Boston Terrier',
    'Boxer', 'Brittany', 'Bulldog', 'French Bulldog', 'Bull Terrier', 'Cairn Terrier',
    'Cane Corso', 'Cavalier King Charles Spaniel', 'Chihuahua', 'Chinese Crested',
    'Chow Chow', 'Cocker Spaniel', 'Collie', 'Dachshund', 'Dalmatian', 'Doberman',
    'English Setter', 'English Springer Spaniel', 'Fox Terrier', 'French Bulldog',
    'German Shepherd', 'German Shorthaired Pointer', 'Golden Retriever', 'Great Dane',
    'Greyhound', 'Havanese', 'Irish Setter', 'Irish Wolfhound', 'Jack Russell Terrier',
    'Japanese Spitz', 'Labrador Retriever', 'Lagotto Romagnolo', 'Maltese', 'Mastiff',
    'Newfoundland', 'German Shepherd', 'Pomeranian', 'Poodle', 'Pug', 'Rottweiler',
    'Saint Bernard', 'Samoyed', 'Schnauzer', 'Scottish Terrier', 'Shar Pei',
    'Shih Tzu', 'Siberian Husky', 'Staffordshire Bull Terrier', 'Weimaraner',
    'West Highland White Terrier', 'Whippet', 'Yorkshire Terrier'
  ],
  es: [
    'Affenpinscher', 'Galgo Afgano', 'Airedale Terrier', 'Malamute de Alaska', 'Bulldog Americano',
    'Cocker Spaniel Americano', 'American Pit Bull Terrier', 'American Staffordshire Terrier',
    'Basenji', 'Basset Hound', 'Beagle', 'Bearded Collie', 'Boyero de Berna',
    'Bichón Frisé', 'Sabueso', 'Border Collie', 'Border Terrier', 'Boston Terrier',
    'Boxer', 'Brittany', 'Bulldog', 'Bulldog Francés', 'Bull Terrier', 'Cairn Terrier',
    'Cane Corso', 'Cavalier King Charles Spaniel', 'Chihuahua', 'Perro Crestado Chino',
    'Chow Chow', 'Cocker Spaniel', 'Collie', 'Teckel', 'Dálmata', 'Dobermann',
    'Setter Inglés', 'Springer Spaniel Inglés', 'Fox Terrier', 'Bulldog Francés',
    'Pastor Alemán', 'Pointer Alemán', 'Golden Retriever', 'Gran Danés',
    'Galgo', 'Habanero', 'Setter Irlandés', 'Lebrel Irlandés', 'Jack Russell Terrier',
    'Spitz Japonés', 'Labrador Retriever', 'Lagotto Romagnolo', 'Maltés', 'Mastín',
    'Terranova', 'Pastor Alemán', 'Pomerania', 'Caniche', 'Pug', 'Rottweiler',
    'San Bernardo', 'Samoyedo', 'Schnauzer', 'Terrier Escocés', 'Shar Pei',
    'Shih Tzu', 'Husky Siberiano', 'Staffordshire Bull Terrier', 'Weimaraner',
    'West Highland White Terrier', 'Whippet', 'Yorkshire Terrier'
  ]
};

const catBreeds = {
  it: [
    'Abissino', 'American Curl', 'Pelo Corto Americano', 'Angora Turco', 'Balinese',
    'Bengala', 'Birmano', 'Bombay', 'Pelo Lungo Britannico', 'Pelo Corto Britannico',
    'Burmese', 'California Spangled', 'Certosino', 'Cornish Rex', 'Devon Rex',
    'Mau Egiziano', 'Europeo', 'Esotico Pelo Corto', 'Himalayano', 'Bobtail Giapponese',
    'Korat', 'LaPerm', 'Maine Coon', 'Manx', 'Munchkin', 'Nebelung',
    'Gatto delle Foreste Norvegesi', 'Ocicat', 'Orientale', 'Persiano', 'Peterbald',
    'Pixie-bob', 'Ragdoll', 'Blu di Russia', 'Savannah', 'Scottish Fold',
    'Selkirk Rex', 'Siamese', 'Siberiano', 'Singapura', 'Somalo', 'Sphynx',
    'Tonkinese', 'Van Turco'
  ],
  en: [
    'Abyssinian', 'American Curl', 'American Shorthair', 'Turkish Angora', 'Balinese',
    'Bengal', 'Birman', 'Bombay', 'British Longhair', 'British Shorthair',
    'Burmese', 'California Spangled', 'Chartreux', 'Cornish Rex', 'Devon Rex',
    'Egyptian Mau', 'European', 'Exotic Shorthair', 'Himalayan', 'Japanese Bobtail',
    'Korat', 'LaPerm', 'Maine Coon', 'Manx', 'Munchkin', 'Nebelung',
    'Norwegian Forest Cat', 'Ocicat', 'Oriental', 'Persian', 'Peterbald',
    'Pixie-bob', 'Ragdoll', 'Russian Blue', 'Savannah', 'Scottish Fold',
    'Selkirk Rex', 'Siamese', 'Siberian', 'Singapura', 'Somali', 'Sphynx',
    'Tonkinese', 'Turkish Van'
  ],
  es: [
    'Abisinio', 'American Curl', 'Pelo Corto Americano', 'Angora Turco', 'Balinés',
    'Bengalí', 'Birmano', 'Bombay', 'Pelo Largo Británico', 'Pelo Corto Británico',
    'Burmés', 'California Spangled', 'Cartujo', 'Cornish Rex', 'Devon Rex',
    'Mau Egipcio', 'Europeo', 'Exótico Pelo Corto', 'Himalayo', 'Bobtail Japonés',
    'Korat', 'LaPerm', 'Maine Coon', 'Manx', 'Munchkin', 'Nebelung',
    'Gato del Bosque de Noruega', 'Ocicat', 'Oriental', 'Persa', 'Peterbald',
    'Pixie-bob', 'Ragdoll', 'Azul Ruso', 'Savannah', 'Scottish Fold',
    'Selkirk Rex', 'Siamés', 'Siberiano', 'Singapura', 'Somalí', 'Sphynx',
    'Tonkinés', 'Van Turco'
  ]
};

// Funzione per ottenere l'emoji del tipo di pet
const getPetEmoji = (type: string) => {
  const lowerType = type?.toLowerCase() || '';
  if (lowerType.includes('cane') || lowerType.includes('dog')) return '🐕';
  if (lowerType.includes('gatto') || lowerType.includes('cat')) return '🐱';
  if (lowerType.includes('coniglio') || lowerType.includes('rabbit')) return '🐰';
  if (lowerType.includes('uccello') || lowerType.includes('bird')) return '🐦';
  if (lowerType.includes('pesce') || lowerType.includes('fish')) return '🐠';
  if (lowerType.includes('criceto') || lowerType.includes('hamster')) return '🐹';
  return '🐾'; // Default
};

// Funzione per ottenere le classi di colore in base al gender
const getGenderClasses = (gender: string) => {
  switch (gender) {
    case 'female':
      return 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200/50 shadow-pink-100/20';
    case 'male':
      return 'bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200/50 shadow-sky-100/20';
    default:
      return '';
  }
};

const PetsPage: React.FC = () => {
  const { user } = useAuth();
  const { pets, loading, updatePet, deletePet, addPet } = usePets();
  const navigate = useNavigate();
  const { showUpgradeModal, setShowUpgradeModal } = usePlanLimits();
  const { addNotification } = useNotifications();
  const language = 'it';
  const { showToast } = useTranslatedToast();
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [deletingPet, setDeletingPet] = useState<Pet | null>(null);
  
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
  const [birthDate, setBirthDate] = useState({
    day: '',
    month: '',
    year: ''
  });


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('add') === 'true') {
      // Apri automaticamente il popup quando viene navigato con ?add=true
      setShowForm(true);
      // Pulisci l'URL senza ricaricare la pagina
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const calculateAge = (birthDate: { day: string; month: string; year: string }) => {
    if (!birthDate.day || !birthDate.month || !birthDate.year) return null;
    
    const birth = new Date(parseInt(birthDate.year), parseInt(birthDate.month) - 1, parseInt(birthDate.day));
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name || !formData.type) {
      showToast({
        title: 'error.title',
        description: 'pets.error.validationRequired',
        variant: 'destructive'
      });
      return;
    }

    try {
      const age = calculateAge(birthDate);
      const birth_date = (birthDate.year && birthDate.month && birthDate.day) 
        ? `${birthDate.year}-${birthDate.month.padStart(2, '0')}-${birthDate.day.padStart(2, '0')}` 
        : null;

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
      };

      if (editingPet) {
        await updatePet(editingPet.id, petData);
        // Toast per modifica pet
        showToast({
          title: 'pets.petUpdated.title',
          description: 'pets.petUpdated.description',
          variant: 'success',
          variables: { petName: formData.name }
        });
        
        // Notifica per modifica pet
        addNotification({
          title: "Aggiornato",
          message: `${formData.name} è stato aggiornato con successo`,
          type: 'success',
          read: false,
          action_url: '/pets'
        });
      } else {
        // Aggiunta nuovo pet tramite context - il context gestisce automaticamente la selezione
        await addPet(petData);
        
        // Toast per nuovo pet
        showToast({
          title: 'pets.petAdded.title',
          description: 'pets.petAdded.description',
          variant: 'success',
          variables: { petName: formData.name }
        });
      }
      
      resetForm();
      setShowForm(false); // Chiude il form dopo il salvataggio
    } catch (error) {
      console.error('Error saving pet:', error);
    }
  };

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      type: pet.type,
      breed: pet.breed || '',
      weight: pet.weight?.toString() || '',
      description: pet.description || '',
      allergies: pet.allergies || '',
      fears: pet.fears || '',
      favorite_activities: pet.favorite_activities || '',
      health_conditions: pet.health_conditions || '',
      personality_traits: pet.personality_traits || '',
      gender: pet.gender || 'unknown',
      microchip_number: pet.microchip_number || ''
    });

    // Set birth date if available
    if (pet.birth_date) {
      const date = new Date(pet.birth_date);
      setBirthDate({
        day: date.getDate().toString(),
        month: (date.getMonth() + 1).toString(),
        year: date.getFullYear().toString()
      });
    } else {
      setBirthDate({ day: '', month: '', year: '' });
    }
    
    setShowForm(true);
  };

  const handleDelete = async (petId: string) => {
    try {
      const petToDelete = pets.find(p => p.id === petId);
      await deletePet(petId);
      
      // Toast per eliminazione pet
      if (petToDelete) {
        showToast({
          title: 'pets.petDeleted.title',
          description: 'pets.petDeleted.description',
          variant: 'destructive',
          variables: { petName: petToDelete.name }
        });
        
        // Notifica per eliminazione pet
        addNotification({
          title: "Eliminato",
          message: `${petToDelete.name} è stato eliminato`,
          type: 'info',
          read: false,
          action_url: '/pets'
        });
      }
      
      setDeletingPet(null);
    } catch (error) {
      console.error('Error deleting pet:', error);
    }
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
    setBirthDate({
      day: '',
      month: '',
      year: ''
    });
    setEditingPet(null);
    setShowForm(false);
  };

  const getAvailableBreeds = () => {
    const petType = formData.type.toLowerCase();
    if (petType === 'cane' || petType === 'dog' || petType === 'perro') {
      return dogBreeds[language] || dogBreeds.it;
    } else if (petType === 'gatto' || petType === 'cat' || petType === 'gato') {
      return catBreeds[language] || catBreeds.it;
    }
    return [];
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <PawPrint className="h-8 w-8 text-primary" />
            I Miei Pet
          </h1>
          <p className="text-muted-foreground">
            Gestisci i tuoi animali domestici e le loro informazioni
          </p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => setShowForm(true)}
                  data-guide="add-pet-button"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Pet
                </Button>
              </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] shadow-elegant">
            <div className="max-h-[80vh] overflow-y-auto px-1">
              <DialogHeader>
                <DialogTitle>
                  {editingPet ? "Modifica Pet" : "Aggiungi Nuovo Pet"}
                </DialogTitle>
                <DialogDescription>
                  {editingPet 
                    ? "Modifica le informazioni del tuo pet"
                    : "Aggiungi un nuovo pet alla tua famiglia"
                  }
                </DialogDescription>
              </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nome del tuo pet"
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
                      <SelectValue placeholder="Seleziona il tipo di animale" />
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
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder="es. 5.2"
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Data di nascita</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={birthDate.day} onValueChange={(value) => setBirthDate({...birthDate, day: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Giorno" />
                      </SelectTrigger>
                       <SelectContent>
                         {Array.from({length: 31}, (_, i) => i + 1).map((day) => (
                           <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                         ))}
                       </SelectContent>
                    </Select>

                    <Select value={birthDate.month} onValueChange={(value) => setBirthDate({...birthDate, month: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Mese" />
                      </SelectTrigger>
                         <SelectContent>
                           {Array.from({length: 12}, (_, i) => i + 1).map((month) => {
                             const monthNames = {
                               it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
                               en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                               es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
                             };
                             const currentMonthNames = monthNames[language] || monthNames.it;
                             return (
                               <SelectItem key={month} value={month.toString()}>
                                 {currentMonthNames[month - 1]}
                               </SelectItem>
                             );
                           })}
                         </SelectContent>
                    </Select>

                    <Select value={birthDate.year} onValueChange={(value) => setBirthDate({...birthDate, year: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Anno" />
                      </SelectTrigger>
                       <SelectContent>
                         {Array.from({length: 25}, (_, i) => new Date().getFullYear() - i).map((year) => (
                           <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                         ))}
                       </SelectContent>
                    </Select>
                  </div>
                  {birthDate.day && birthDate.month && birthDate.year && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Età calcolata: {calculateAge(birthDate)?.toString() || '0'} anni
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="allergies">Allergie</Label>
                  <Input
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                    placeholder="es. pollini, acari"
                  />
                </div>

                <div>
                  <Label htmlFor="fears">Paure</Label>
                  <Input
                    id="fears"
                    value={formData.fears}
                    onChange={(e) => setFormData({...formData, fears: e.target.value})}
                    placeholder="es. temporali, rumori forti"
                  />
                </div>

                <div>
                  <Label htmlFor="favorite_activities">Attività preferite</Label>
                  <Input
                    id="favorite_activities"
                    value={formData.favorite_activities}
                    onChange={(e) => setFormData({...formData, favorite_activities: e.target.value})}
                    placeholder="es. giocare, correre"
                  />
                </div>

                <div>
                  <Label htmlFor="health_conditions">Condizioni di salute</Label>
                  <Input
                    id="health_conditions"
                    value={formData.health_conditions}
                    onChange={(e) => setFormData({...formData, health_conditions: e.target.value})}
                    placeholder="es. artrite, allergie"
                  />
                </div>

                 <div>
                   <Label htmlFor="personality_traits">Tratti caratteriali</Label>
                   <Input
                     id="personality_traits"
                     value={formData.personality_traits}
                     onChange={(e) => setFormData({...formData, personality_traits: e.target.value})}
                     placeholder="es. giocoso, timido"
                   />
                 </div>

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
                   <Label htmlFor="microchip_number">Numero microchip</Label>
                   <Input
                     id="microchip_number"
                     value={formData.microchip_number}
                     onChange={(e) => setFormData({...formData, microchip_number: e.target.value})}
                     placeholder="es. 380123456789012"
                   />
                 </div>

                 <div className="md:col-span-2">
                  <Label htmlFor="description">Descrizione generale</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descrivi il tuo pet..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Salvataggio..." : (editingPet ? "Aggiorna Pet" : "Aggiungi Pet")}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="flex-1"
                >
                  Annulla
                </Button>
              </div>
            </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {pets.length === 0 ? (
        <Card className="petvoice-card border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 rounded-full gradient-coral flex items-center justify-center mb-4">
              <PawPrint className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-xl mb-2">Nessun pet ancora</CardTitle>
            <CardDescription className="mb-6 max-w-md">
              Aggiungi il tuo primo pet per iniziare
            </CardDescription>
            <Button 
              onClick={() => setShowForm(true)}
              className="petvoice-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi il primo pet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <Card key={pet.id} className={`petvoice-card ${getGenderClasses(pet.gender || 'unknown')}`}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={pet.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl">
                      {getPetEmoji(pet.type)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{pet.name}</CardTitle>
                     <CardDescription>
                       {pet.type.toLowerCase() === 'cane' ? 'Cane' : pet.type.toLowerCase() === 'gatto' ? 'Gatto' : pet.type} {pet.breed && `• ${pet.breed}`}
                     </CardDescription>
                    {pet.age && (
                      <Badge variant="secondary" className="mt-1">
                        {pet.age} anni
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pet.weight && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Peso</span>
                      <span>{pet.weight} kg</span>
                    </div>
                  )}
                  
                  {pet.personality_traits && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Personalità</span>
                      <span className="text-right">{pet.personality_traits}</span>
                    </div>
                  )}

                   {pet.favorite_activities && (
                     <div className="flex justify-between text-sm">
                       <span className="text-muted-foreground">Ama</span>
                       <span className="text-right">{pet.favorite_activities}</span>
                     </div>
                   )}

                   {pet.gender && pet.gender !== 'unknown' && (
                     <div className="flex justify-between text-sm">
                       <span className="text-muted-foreground">Sesso</span>
                       <span className="text-right">{pet.gender === 'male' ? 'Maschio' : 'Femmina'}</span>
                     </div>
                   )}

                   {pet.microchip_number && (
                     <div className="flex justify-between text-sm">
                       <span className="text-muted-foreground">Microchip</span>
                       <span className="text-right font-mono text-xs">{pet.microchip_number}</span>
                     </div>
                   )}

                   {pet.description && (
                     <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
                       {pet.description}
                     </p>
                   )}
                  
                  <div className="flex gap-2 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(pet)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifica
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingPet(pet)}
                      className="flex-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Elimina
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog di conferma eliminazione */}
      <ConfirmDialog
        open={deletingPet !== null}
        onOpenChange={(open) => !open && setDeletingPet(null)}
        title="Conferma eliminazione"
        description={`Sei sicuro di voler eliminare ${deletingPet?.name || ''}?`}
        confirmText="Elimina"
        cancelText="Annulla"
        variant="destructive"
        onConfirm={() => deletingPet && handleDelete(deletingPet.id)}
      />

    </div>
  );
};

export default PetsPage;