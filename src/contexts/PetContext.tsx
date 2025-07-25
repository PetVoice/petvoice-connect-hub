import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useTranslatedToast } from '@/hooks/use-translated-toast';

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
  updated_at: string;
  user_id: string;
}

interface PetContextType {
  pets: Pet[];
  selectedPet: Pet | null;
  selectedPetId: string;
  loading: boolean;
  setSelectedPetId: (petId: string) => void;
  refreshPets: () => Promise<void>;
  addPet: (petData: Partial<Pet>) => Promise<Pet | null>;
  updatePet: (petId: string, petData: Partial<Pet>) => Promise<void>;
  deletePet: (petId: string) => Promise<void>;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export const usePets = () => {
  const context = useContext(PetContext);
  if (context === undefined) {
    // Return a safe fallback instead of throwing an error
    return {
      pets: [],
      selectedPet: null,
      selectedPetId: '',
      loading: false,
      setSelectedPetId: () => {},
      refreshPets: async () => {},
      addPet: async () => null,
      updatePet: async () => {},
      deletePet: async () => {},
    };
  }
  return context;
};

interface PetProviderProps {
  children: ReactNode;
}

export const PetProvider: React.FC<PetProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useTranslatedToast();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetIdState] = useState<string>(() => {
    return localStorage.getItem('petvoice-selected-pet') || '';
  });
  const [loading, setLoading] = useState(false);
  const [addingPet, setAddingPet] = useState(false);

  const selectedPet = pets.find(pet => pet.id === selectedPetId) || null;

  const setSelectedPetId = (petId: string) => {
    setSelectedPetIdState(petId);
    if (petId) {
      localStorage.setItem('petvoice-selected-pet', petId);
    } else {
      localStorage.removeItem('petvoice-selected-pet');
    }
  };

  const refreshPets = async () => {
    if (!user) {
      setPets([]);
      return;
    }
    
    setLoading(true);
    try {
      const { data: petsData, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading pets:', error);
        showToast({
          title: 'error.title',
          description: 'pets.error.cannotLoad',
          variant: 'destructive'
        });
        return;
      }

      setPets(petsData || []);
      
      // Auto-seleziona il primo pet se non c'è uno selezionato
      if (!selectedPetId && petsData && petsData.length > 0) {
        setSelectedPetId(petsData[0].id);
      }
      
      // Verifica che il pet selezionato esista ancora
      if (selectedPetId && petsData) {
        const stillExists = petsData.find(pet => pet.id === selectedPetId);
        if (!stillExists) {
          if (petsData.length > 0) {
            setSelectedPetId(petsData[0].id);
          } else {
            setSelectedPetId('');
          }
        }
      }
    } catch (error) {
      console.error('Error loading pets:', error);
      showToast({
        title: 'error.title',
        description: 'pets.error.cannotLoad',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addPet = async (petData: Partial<Pet>): Promise<Pet | null> => {
    if (!user) return null;
    
    // Prevent multiple concurrent additions
    if (addingPet) return null;
    setAddingPet(true);

    try {
      // Assicuriamoci che i campi richiesti siano presenti
      const insertData = { 
        ...petData, 
        user_id: user.id,
        name: petData.name!,
        type: petData.type!
      };
      
      const { data, error } = await supabase
        .from('pets')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Aggiorna lo stato locale immediatamente
      setPets(prevPets => [data, ...prevPets]);
      
      // Auto-seleziona il nuovo pet se è il primo o se non c'è uno selezionato
      if (pets.length === 0 || !selectedPetId) {
        setSelectedPetId(data.id);
      }

      showToast({
        title: 'pets.petAdded.title',
        description: 'pets.petAdded.description',
        variant: 'default',
        variables: { petName: petData.name || 'Pet' }
      });

      return data;
    } catch (error) {
      console.error('Error adding pet:', error);
      showToast({
        title: 'error.title',
        description: 'pets.error.cannotAdd',
        variant: 'destructive'
      });
      return null;
    } finally {
      setAddingPet(false);
    }
  };

  const updatePet = async (petId: string, petData: Partial<Pet>) => {
    try {
      // Salva il nome del pet prima di aggiornarlo
      const petToUpdate = pets.find(pet => pet.id === petId);
      const petName = petData.name || petToUpdate?.name || 'Pet';
      
      const { error } = await supabase
        .from('pets')
        .update(petData)
        .eq('id', petId);

      if (error) throw error;

      // Aggiorna lo stato locale immediatamente
      setPets(prevPets => 
        prevPets.map(pet => 
          pet.id === petId ? { ...pet, ...petData } : pet
        )
      );

      showToast({
        title: 'pets.petUpdated.title',
        description: 'pets.petUpdated.description',
        variant: 'success',
        variables: { petName }
      });

      // Forza un refresh per assicurarsi che i dati siano sincronizzati
      await refreshPets();
    } catch (error) {
      console.error('Error updating pet:', error);
      showToast({
        title: 'error.title',
        description: 'pets.error.cannotUpdate',
        variant: 'destructive'
      });
    }
  };

  const deletePet = async (petId: string) => {
    try {
      // Salva il nome del pet prima di eliminarlo
      const petToDelete = pets.find(pet => pet.id === petId);
      const petName = petToDelete?.name || 'Pet';
      
      const { error } = await supabase
        .from('pets')
        .update({ is_active: false })
        .eq('id', petId);

      if (error) throw error;

      // Aggiorna lo stato locale immediatamente
      const updatedPets = pets.filter(pet => pet.id !== petId);
      setPets(updatedPets);
      
      // Se il pet eliminato era quello selezionato, seleziona un altro
      if (selectedPetId === petId) {
        if (updatedPets.length > 0) {
          setSelectedPetId(updatedPets[0].id);
        } else {
          setSelectedPetId('');
        }
      }

      showToast({
        title: 'pets.petDeleted.title',
        description: 'pets.petDeleted.description',
        variant: 'default',
        variables: { petName }
      });
    } catch (error) {
      console.error('Error deleting pet:', error);
      showToast({
        title: 'error.title',
        description: 'pets.error.cannotDelete',
        variant: 'destructive'
      });
    }
  };

  // Carica i pets iniziali
  useEffect(() => {
    refreshPets();
  }, [user]);

  // Sottoscrizione realtime per sincronizzazione tra tab/dispositivi
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`pets-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pets',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('Pet change detected:', payload);
          
          if (payload.eventType === 'INSERT' && payload.new) {
            const newPet = payload.new as Pet;
            setPets(prevPets => {
              // Verifica se il pet non è già presente
              if (prevPets.find(p => p.id === newPet.id)) {
                return prevPets;
              }
              return [newPet, ...prevPets];
            });
            
            // Auto-seleziona se è il primo pet o se non c'è uno selezionato
            if (pets.length === 0 || !selectedPetId) {
              setSelectedPetId(newPet.id);
            }
          }
          
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedPet = payload.new as Pet;
            
            if (updatedPet.is_active === false) {
              // Pet eliminato (soft delete)
              const updatedPets = pets.filter(pet => pet.id !== updatedPet.id);
              setPets(updatedPets);
              
              if (selectedPetId === updatedPet.id) {
                if (updatedPets.length > 0) {
                  setSelectedPetId(updatedPets[0].id);
                } else {
                  setSelectedPetId('');
                }
              }
            } else {
              // Pet aggiornato
              setPets(prevPets => 
                prevPets.map(pet => 
                  pet.id === updatedPet.id ? updatedPet : pet
                )
              );
            }
          }
          
          if (payload.eventType === 'DELETE' && payload.old) {
            const deletedPet = payload.old as Pet;
            const updatedPets = pets.filter(pet => pet.id !== deletedPet.id);
            setPets(updatedPets);
            
            if (selectedPetId === deletedPet.id) {
              if (updatedPets.length > 0) {
                setSelectedPetId(updatedPets[0].id);
              } else {
                setSelectedPetId('');
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]); // RIMUOVO pets.length e selectedPetId per evitare loop infinito

  const value: PetContextType = {
    pets,
    selectedPet,
    selectedPetId,
    loading,
    setSelectedPetId,
    refreshPets,
    addPet,
    updatePet,
    deletePet,
  };

  return (
    <PetContext.Provider value={value}>
      {children}
    </PetContext.Provider>
  );
};