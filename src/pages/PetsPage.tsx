import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar as CalendarIcon, 
  Upload,
  Heart,
  Star,
  PawPrint
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  weight?: number;
  description?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

const dogBreeds = [
  'Labrador Retriever', 'Golden Retriever', 'Pastore Tedesco', 'Bulldog Francese',
  'Bulldog', 'Beagle', 'Poodle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund',
  'Siberian Husky', 'Boxer', 'Great Dane', 'Chihuahua', 'Border Collie'
];

const catBreeds = [
  'Persiano', 'Maine Coon', 'Siamese', 'Ragdoll', 'British Shorthair',
  'Abissino', 'Bengala', 'Russian Blue', 'Sphynx', 'Scottish Fold',
  'Norwegian Forest', 'Birmano', 'American Shorthair', 'Europeo', 'Certosino'
];

const PetsPage: React.FC = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [birthDate, setBirthDate] = useState<Date>();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    breed: '',
    weight: '',
    description: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (user) {
      fetchPets();
    }
  }, [user]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i pet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const age = birthDate ? 
        new Date().getFullYear() - birthDate.getFullYear() : 
        undefined;

      const petData = {
        ...formData,
        age,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        user_id: user.id,
        is_active: true
      };

      let result;
      if (editingPet) {
        result = await supabase
          .from('pets')
          .update(petData)
          .eq('id', editingPet.id);
      } else {
        result = await supabase
          .from('pets')
          .insert([petData]);
      }

      if (result.error) throw result.error;

      toast({
        title: editingPet ? "Pet aggiornato" : "Pet creato",
        description: `${formData.name} è stato ${editingPet ? 'aggiornato' : 'aggiunto'} con successo!`,
      });

      setFormOpen(false);
      resetForm();
      fetchPets();
    } catch (error) {
      console.error('Error saving pet:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare il pet",
        variant: "destructive",
      });
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
      avatar_url: pet.avatar_url || ''
    });
    if (pet.age) {
      setBirthDate(new Date(new Date().getFullYear() - pet.age, 0, 1));
    }
    setFormOpen(true);
  };

  const handleDelete = async (petId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo pet?')) return;

    try {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId);

      if (error) throw error;

      toast({
        title: "Pet eliminato",
        description: "Il pet è stato eliminato con successo",
      });

      fetchPets();
    } catch (error) {
      console.error('Error deleting pet:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il pet",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      breed: '',
      weight: '',
      description: '',
      avatar_url: ''
    });
    setBirthDate(undefined);
    setEditingPet(null);
  };

  const getAvailableBreeds = () => {
    return formData.type === 'Cane' ? dogBreeds : 
           formData.type === 'Gatto' ? catBreeds : [];
  };

  const getPetEmoji = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cane': return '🐕';
      case 'gatto': return '🐱';
      default: return '🐾';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Caricamento pet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <PawPrint className="h-8 w-8 text-coral" />
            I Miei Pet
          </h1>
          <p className="text-muted-foreground">
            Gestisci i tuoi amici a quattro zampe
          </p>
        </div>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="petvoice-button">
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Pet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPet ? 'Modifica Pet' : 'Aggiungi Nuovo Pet'}
              </DialogTitle>
              <DialogDescription>
                Inserisci le informazioni del tuo pet
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Es. Luna, Max, Micia..."
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value, breed: '' })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cane">🐕 Cane</SelectItem>
                      <SelectItem value="Gatto">🐱 Gatto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.type && (
                <div className="space-y-2">
                  <Label htmlFor="breed">Razza</Label>
                  <Select value={formData.breed} onValueChange={(value) => setFormData({ ...formData, breed: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona razza" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableBreeds().map((breed) => (
                        <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data di Nascita</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !birthDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {birthDate ? format(birthDate, "PPP", { locale: it }) : "Seleziona data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={birthDate}
                        onSelect={setBirthDate}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="Es. 25.5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Aggiungi note sul carattere, preferenze, etc..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" className="petvoice-button">
                  {editingPet ? 'Aggiorna' : 'Crea'} Pet
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pets Grid */}
      {pets.length === 0 ? (
        <Card className="petvoice-card text-center py-12">
          <CardContent>
            <div className="w-16 h-16 rounded-full gradient-coral flex items-center justify-center mx-auto mb-4">
              <PawPrint className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nessun Pet Ancora</h3>
            <p className="text-muted-foreground mb-4">
              Aggiungi il tuo primo pet per iniziare a monitorare le sue emozioni
            </p>
            <Button onClick={() => setFormOpen(true)} className="petvoice-button">
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi il Primo Pet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <Card key={pet.id} className="petvoice-card hover:shadow-glow transition-smooth">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={pet.avatar_url} />
                    <AvatarFallback className="text-lg">
                      {getPetEmoji(pet.type)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {pet.name}
                      {pet.is_active && (
                        <Badge variant="outline" className="bg-success/10 text-success border-success">
                          <Heart className="h-3 w-3 mr-1" />
                          Attivo
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {pet.type} {pet.breed && `• ${pet.breed}`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {pet.age && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Età:</span>
                      <span>{pet.age} {pet.age === 1 ? 'anno' : 'anni'}</span>
                    </div>
                  )}
                  
                  {pet.weight && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Peso:</span>
                      <span>{pet.weight} kg</span>
                    </div>
                  )}
                  
                  {pet.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {pet.description}
                    </p>
                  )}
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(pet)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifica
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(pet.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PetsPage;