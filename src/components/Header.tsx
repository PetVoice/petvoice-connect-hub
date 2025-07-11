import React, { useState, useEffect } from 'react';
import { Bell, Globe, Moon, Sun, LogOut, Settings, User, Heart } from 'lucide-react';
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
import { SidebarTrigger } from '@/components/ui/sidebar';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState('it');
  const [notifications] = useState(3); // Demo notifications
  const [unreadNotifications, setUnreadNotifications] = useState(() => {
    // Ripristina lo stato dalle notifiche salvate in localStorage
    const saved = localStorage.getItem('petvoice-unread-notifications');
    return saved ? parseInt(saved, 10) : 3; // Default 3 se non ci sono dati salvati
  });

  // State per i pets
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState<string>(() => {
    // Ripristina il pet selezionato da localStorage
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
        
        // Se non c'è un pet selezionato ma ci sono pets, seleziona il primo
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

  // Trova il pet attualmente selezionato
  const currentPet = pets.find(pet => pet.id === selectedPet);

  // Funzione per cambiare pet selezionato
  const handlePetChange = (petId: string) => {
    setSelectedPet(petId);
    localStorage.setItem('petvoice-selected-pet', petId);
  };

  // Funzione per marcare le notifiche come lette
  const markNotificationsAsRead = () => {
    setUnreadNotifications(0);
    localStorage.setItem('petvoice-unread-notifications', '0');
  };

  // Funzione per aggiungere nuove notifiche (da usare quando implementeremo notifiche reali)
  const addNewNotification = () => {
    const newCount = unreadNotifications + 1;
    setUnreadNotifications(newCount);
    localStorage.setItem('petvoice-unread-notifications', newCount.toString());
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
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
          {pets.length > 0 && (
            <Select value={selectedPet} onValueChange={handlePetChange}>
              <SelectTrigger className="w-16 h-9">
                <SelectValue asChild>
                  <div className="flex items-center justify-center">
                    {loadingPets ? (
                      <div className="w-4 h-4 border-2 border-azure/30 border-t-azure rounded-full animate-spin" />
                    ) : currentPet ? (
                      <span className="text-lg">{getPetEmoji(currentPet.type)}</span>
                    ) : (
                      <Heart className="h-4 w-4" />
                    )}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {pets.map((pet) => (
                  <SelectItem key={pet.id} value={pet.id}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getPetEmoji(pet.type)}</span>
                      <span className="text-sm font-medium">{pet.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Language Selector */}
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-12 h-9">
              <SelectValue asChild>
                <div className="flex items-center justify-center">
                  {language === 'it' ? '🇮🇹' : language === 'en' ? '🇬🇧' : '🇪🇸'}
                </div>
              </SelectValue>
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
                onClick={markNotificationsAsRead} // Usa la funzione che salva in localStorage
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