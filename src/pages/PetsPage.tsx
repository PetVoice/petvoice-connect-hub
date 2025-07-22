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
import { useNavigate } from 'react-router-dom';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useNotifications } from '@/hooks/useNotifications';
import { useTranslation } from '@/hooks/useTranslation';

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

const PetsPage: React.FC = () => {
  const { user } = useAuth();
  const { pets, loading, updatePet, deletePet, addPet } = usePets();
  const navigate = useNavigate();
  const { showUpgradeModal, setShowUpgradeModal } = usePlanLimits();
  const { addNotification } = useNotifications();
  const { t, language } = useTranslation();
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
    personality_traits: ''
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
      toast({
        title: t('errors.validationError'),
        description: t('toast.pets.validationRequired'),
        variant: "destructive",
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
      };

      if (editingPet) {
        await updatePet(editingPet.id, petData);
        // Toast per modifica pet
        toast({
          title: t('toast.pets.petUpdated'),
          description: t('toast.pets.petUpdatedDescription').replace('{name}', formData.name),
        });
        
        // Notifica per modifica pet
        addNotification({
          title: t('success.updated'),
          message: t('toast.pets.petUpdatedDescription').replace('{name}', formData.name),
          type: 'success',
          read: false,
          action_url: '/pets'
        });
      } else {
        // Aggiunta nuovo pet tramite context - il context gestisce automaticamente la selezione
        await addPet(petData);
        
        // Toast per nuovo pet
        toast({
          title: t('toast.pets.petAdded'),
          description: `${formData.name} ${t('toast.pets.petAddedDescription')}`,
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
      personality_traits: pet.personality_traits || ''
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
        toast({
          title: t('toast.pets.petDeleted'),
          description: `${petToDelete.name} ${t('toast.pets.petDeletedDescription')}`,
          variant: "destructive",
        });
        
        // Notifica per eliminazione pet
        addNotification({
          title: t('success.deleted'),
          message: `${petToDelete.name} ${t('toast.pets.petDeletedDescription')}`,
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
      personality_traits: ''
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
    return formData.type === 'Cane' ? dogBreeds : catBreeds;
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
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
            {t('navigation.pets')}
          </h1>
          <p className="text-muted-foreground">
            {t('pets.pageDescription')}
          </p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => setShowForm(true)}
                  data-guide="add-pet-button"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('pets.addNew')}
                </Button>
              </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] shadow-elegant">
            <div className="max-h-[80vh] overflow-y-auto px-1">
              <DialogHeader>
                <DialogTitle>
                  {editingPet ? t('pets.editPet') : t('pets.addNew')}
                </DialogTitle>
                <DialogDescription>
                  {editingPet 
                    ? t('pets.form.editDescription')
                    : t('pets.form.addDescription')
                  }
                </DialogDescription>
              </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{t('pets.form.fields.nameRequired')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder={t('pets.form.placeholders.petName')}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">{t('pets.form.fields.typeRequired')}</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({...formData, type: value, breed: ''})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('pets.form.placeholders.selectType')} />
                    </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="Cane">{t('pets.types.dog')}</SelectItem>
                       <SelectItem value="Gatto">{t('pets.types.cat')}</SelectItem>
                     </SelectContent>
                  </Select>
                </div>

                {formData.type && (
                  <div>
                    <Label htmlFor="breed">{t('pets.form.fields.breed')}</Label>
                    <Select 
                      value={formData.breed} 
                      onValueChange={(value) => setFormData({...formData, breed: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('pets.form.placeholders.selectBreed')} />
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
                  <Label htmlFor="weight">{t('pets.form.fields.weight')}</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder={t('pets.form.placeholders.weightExample')}
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>{t('pets.form.fields.birthDate')}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={birthDate.day} onValueChange={(value) => setBirthDate({...birthDate, day: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('pets.form.placeholders.day')} />
                      </SelectTrigger>
                       <SelectContent>
                         {Array.from({length: 31}, (_, i) => i + 1).map((day) => (
                           <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                         ))}
                       </SelectContent>
                    </Select>

                    <Select value={birthDate.month} onValueChange={(value) => setBirthDate({...birthDate, month: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('pets.form.placeholders.month')} />
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
                        <SelectValue placeholder={t('pets.form.placeholders.year')} />
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
                      {t('pets.ageCalculated').replace('{{age}}', calculateAge(birthDate)?.toString() || '0')}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="allergies">{t('pets.form.fields.allergies')}</Label>
                  <Input
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                    placeholder={t('pets.form.placeholders.allergiesExample')}
                  />
                </div>

                <div>
                  <Label htmlFor="fears">{t('pets.form.fields.fears')}</Label>
                  <Input
                    id="fears"
                    value={formData.fears}
                    onChange={(e) => setFormData({...formData, fears: e.target.value})}
                    placeholder={t('pets.form.placeholders.fearsExample')}
                  />
                </div>

                <div>
                  <Label htmlFor="favorite_activities">{t('pets.form.fields.favoriteActivities')}</Label>
                  <Input
                    id="favorite_activities"
                    value={formData.favorite_activities}
                    onChange={(e) => setFormData({...formData, favorite_activities: e.target.value})}
                    placeholder={t('pets.form.placeholders.activitiesExample')}
                  />
                </div>

                <div>
                  <Label htmlFor="health_conditions">{t('pets.form.fields.healthConditions')}</Label>
                  <Input
                    id="health_conditions"
                    value={formData.health_conditions}
                    onChange={(e) => setFormData({...formData, health_conditions: e.target.value})}
                    placeholder={t('pets.form.placeholders.healthExample')}
                  />
                </div>

                <div>
                  <Label htmlFor="personality_traits">{t('pets.form.fields.personalityTraits')}</Label>
                  <Input
                    id="personality_traits"
                    value={formData.personality_traits}
                    onChange={(e) => setFormData({...formData, personality_traits: e.target.value})}
                    placeholder={t('pets.form.placeholders.personalityExample')}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">{t('pets.form.fields.generalDescription')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder={t('pets.form.placeholders.descriptionExample')}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? t('pets.form.buttons.saving') : (editingPet ? t('pets.form.buttons.updatePet') : t('pets.form.buttons.addPet'))}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="flex-1"
                >
                  {t('pets.form.buttons.cancel')}
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
            <CardTitle className="text-xl mb-2">{t('pets.emptyState.title')}</CardTitle>
            <CardDescription className="mb-6 max-w-md">
              {t('pets.emptyState.description')}
            </CardDescription>
            <Button 
              onClick={() => setShowForm(true)}
              className="petvoice-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('pets.emptyState.addFirstPet')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <Card key={pet.id} className="petvoice-card">
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
                      {pet.type === 'Cane' ? t('pets.types.dog') : pet.type === 'Gatto' ? t('pets.types.cat') : pet.type} {pet.breed && `• ${pet.breed}`}
                    </CardDescription>
                    {pet.age && (
                      <Badge variant="secondary" className="mt-1">
                        {pet.age} {t('pets.petCard.years')}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pet.weight && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('pets.petCard.weight')}</span>
                      <span>{pet.weight} kg</span>
                    </div>
                  )}
                  
                  {pet.personality_traits && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('pets.petCard.personality')}</span>
                      <span className="text-right">{pet.personality_traits}</span>
                    </div>
                  )}

                  {pet.favorite_activities && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('pets.petCard.loves')}</span>
                      <span className="text-right">{pet.favorite_activities}</span>
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
                      {t('pets.petCard.edit')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingPet(pet)}
                      className="flex-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('pets.petCard.delete')}
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
        title={t('pets.deleteDialog.title')}
        description={t('pets.deleteDialog.description').replace('{{name}}', deletingPet?.name || '')}
        confirmText={t('pets.deleteDialog.confirm')}
        cancelText={t('pets.deleteDialog.cancel')}
        variant="destructive"
        onConfirm={() => deletingPet && handleDelete(deletingPet.id)}
      />

    </div>
  );
};

export default PetsPage;