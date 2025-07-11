import React, { useState, useEffect } from 'react';
import { Bell, Globe, Moon, Sun, LogOut, Settings, User, Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [language, setLanguage] = useState('it');
  const [unreadNotifications, setUnreadNotifications] = useState(() => {
    const saved = localStorage.getItem('petvoice-unread-notifications');
    return saved ? parseInt(saved, 10) : 3;
  });

  // State per i pets
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState<string>(() => {
    return localStorage.getItem('petvoice-selected-pet') || '';
  });
  const [loadingPets, setLoadingPets] = useState(false);

  // Carica i pets dell'utente
  useEffect(() => {
    const loadPets = async () => {
      if (!user) return;
      
      setLoadingPets(true);
      try {
        const { data: petsData, error } = await supabase
          .from('pets')
          .select('id, name, type, avatar_url')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.error('Error loading pets:', error);
          return;
        }

        setPets(petsData || []);
        
        if (!selectedPet && petsData && petsData.length > 0) {
          const firstPetId = petsData[0].id;
          setSelectedPet(firstPetId);
          localStorage.setItem('petvoice-selected-pet', firstPetId);
        }
      } catch (error) {
        console.error('Error loading pets:', error);
      } finally {
        setLoadingPets(false);
      }
    };

    loadPets();
  }, [user, selectedPet]);

  // Ascolta eventi personalizzati per aggiornare i pets
  useEffect(() => {
    const handlePetsUpdate = () => {
      // Ricarica i pets quando riceve l'evento
      if (user) {
        const loadPets = async () => {
          try {
            const { data: petsData, error } = await supabase
              .from('pets')
              .select('id, name, type, avatar_url')
              .eq('user_id', user.id)
              .eq('is_active', true)
              .order('name');

            if (!error && petsData) {
              setPets(petsData);
              
              // Se il pet selezionato non esiste più, seleziona il primo disponibile
              const currentSelectedPet = localStorage.getItem('petvoice-selected-pet');
              if (currentSelectedPet) {
                const stillExists = petsData.find(pet => pet.id === currentSelectedPet);
                if (!stillExists && petsData.length > 0) {
                  setSelectedPet(petsData[0].id);
                  localStorage.setItem('petvoice-selected-pet', petsData[0].id);
                } else if (!stillExists) {
                  setSelectedPet('');
                  localStorage.removeItem('petvoice-selected-pet');
                }
              }
            }
          } catch (error) {
            console.error('Error reloading pets:', error);
          }
        };
        loadPets();
      }
    };

    // Ascolta eventi personalizzati
    window.addEventListener('pets-updated', handlePetsUpdate);
    
    return () => {
      window.removeEventListener('pets-updated', handlePetsUpdate);
    };
  }, [user]);

  const currentPet = pets.find(pet => pet.id === selectedPet);

  // Funzione per gestire il cambio/aggiunta pet
  const handlePetChange = (value: string) => {
    if (value === 'add-pet') {
      navigate('/pets?add=true');
    } else {
      setSelectedPet(value);
      localStorage.setItem('petvoice-selected-pet', value);
    }
  };

  const markNotificationsAsRead = () => {
    setUnreadNotifications(0);
    localStorage.setItem('petvoice-unread-notifications', '0');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const getPetEmoji = (type: string) => {
    const lowerType = type?.toLowerCase() || '';
    if (lowerType.includes('cane') || lowerType.includes('dog')) return '🐕';
    if (lowerType.includes('gatto') || lowerType.includes('cat')) return '🐱';
    if (lowerType.includes('coniglio') || lowerType.includes('rabbit')) return '🐰';
    if (lowerType.includes('uccello') || lowerType.includes('bird')) return '🐦';
    if (lowerType.includes('pesce') || lowerType.includes('fish')) return '🐠';
    if (lowerType.includes('criceto') || lowerType.includes('hamster')) return '🐹';
    return '🐾';
  };

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-full items-center justify-between px-4">
        {/* Left side - Sidebar trigger */}
        <div className="flex items-center gap-3">
          <SidebarTrigger />
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-2">
          {/* Pet Selector */}
          <Select value={selectedPet} onValueChange={handlePetChange}>
            <SelectTrigger className="w-16 h-9">
              <div className="flex items-center justify-center">
                {loadingPets ? (
                  <div className="w-4 h-4 border-2 border-azure/30 border-t-azure rounded-full animate-spin" />
                ) : currentPet ? (
                  <span className="text-lg">{getPetEmoji(currentPet.type)}</span>
                ) : (
                  <Heart className="h-4 w-4" />
                )}
              </div>
            </SelectTrigger>
            <SelectContent>
              {pets.length > 0 && (
                pets.map((pet) => (
                  <SelectItem key={pet.id} value={pet.id}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getPetEmoji(pet.type)}</span>
                      <span className="text-sm font-medium">{pet.name}</span>
                    </div>
                  </SelectItem>
                ))
              )}
              
              {/* Opzione Aggiungi Pet */}
              <SelectItem value="add-pet">
                <div className="flex items-center gap-2 text-coral">
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">Aggiungi Pet</span>
                </div>
              </SelectItem>
              
              {pets.length === 0 && (
                <SelectItem value="no-pets" disabled>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">Nessun pet</span>
                  </div>
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          {/* Language Selector */}
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-12 h-9">
              <div className="flex items-center justify-center">
                {language === 'it' ? '🇮🇹' : language === 'en' ? '🇬🇧' : '🇪🇸'}
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="it">🇮🇹 Italiano</SelectItem>
              <SelectItem value="en">🇬🇧 English</SelectItem>
              <SelectItem value="es">🇪🇸 Español</SelectItem>
            </SelectContent>
          </Select>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 relative"
                onClick={markNotificationsAsRead}
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b">
                <h4 className="font-semibold">Notifiche</h4>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="p-4 border-b">
                  <div className="text-sm font-medium">Nuovo diario aggiunto</div>
                  <div className="text-xs text-muted-foreground mt-1">Il tuo pet ha una nuova voce nel diario</div>
                  <div className="text-xs text-muted-foreground mt-1">2 ore fa</div>
                </div>
                <div className="p-4 border-b">
                  <div className="text-sm font-medium">Analisi completata</div>
                  <div className="text-xs text-muted-foreground mt-1">L'analisi comportamentale è pronta</div>
                  <div className="text-xs text-muted-foreground mt-1">1 giorno fa</div>
                </div>
                <div className="p-4">
                  <div className="text-sm font-medium">Promemoria wellness</div>
                  <div className="text-xs text-muted-foreground mt-1">È ora di aggiornare il punteggio benessere</div>
                  <div className="text-xs text-muted-foreground mt-1">3 giorni fa</div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Il mio account</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Impostazioni
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Esci
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;