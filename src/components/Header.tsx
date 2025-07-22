import React, { useState } from 'react';
import { Bell, Moon, Sun, LogOut, Settings, User, Plus, X, ExternalLink } from 'lucide-react';
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
import { useLanguage } from '@/contexts/LanguageContext';
import { usePets } from '@/contexts/PetContext';
import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useNotifications } from '@/hooks/useNotifications';
import { useTranslation, useTimeTranslation } from '@/hooks/useTranslation';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { pets, selectedPetId, setSelectedPetId, loading: loadingPets } = usePets();
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    clearAllNotifications 
  } = useNotifications();
  const { t } = useTranslation();
  const { formatTimeAgo } = useTimeTranslation();

  const currentPet = pets.find(pet => pet.id === selectedPetId);

  // Funzione per gestire il cambio/aggiunta pet
  const handlePetChange = (value: string) => {
    if (value === 'add-pet') {
      // Naviga automaticamente alla pagina pets con parametro per aprire il popup
      navigate('/pets?add=true');
    } else {
      setSelectedPetId(value);
    }
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };


  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📢';
    }
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
          <Select value={selectedPetId} onValueChange={handlePetChange}>
            <SelectTrigger className="w-32 h-9">
              <div className="flex items-center gap-2">
                {loadingPets ? (
                  <div className="w-4 h-4 border-2 border-azure/30 border-t-azure rounded-full animate-spin" />
                ) : currentPet ? (
                  <>
                    <span className="text-lg">{getPetEmoji(currentPet.type)}</span>
                    <span className="text-sm font-medium truncate">{currentPet.name}</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 text-coral" />
                    <span className="text-sm font-medium text-coral">{t('header.addPet')}</span>
                  </>
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
                  <span className="text-sm font-medium">{t('header.addPetFull')}</span>
                </div>
              </SelectItem>
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
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 shadow-elegant" align="end">
              <div className="p-4 border-b flex items-center justify-between">
                <h4 className="font-semibold">{t('header.notifications')}</h4>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs h-6 px-2"
                    >
                      {t('header.markAllRead')}
                    </Button>
                  )}
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notificationsLoading ? (
                  <div className="p-4 text-center">
                    <div className="w-4 h-4 border-2 border-azure/30 border-t-azure rounded-full animate-spin mx-auto" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nessuna notifica</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        !notification.read ? 'bg-azure/5' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-sm mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium flex items-center gap-1">
                              {notification.title}
                              {!notification.read && (
                                <div className="w-2 h-2 bg-azure rounded-full" />
                              )}
                            </div>
                            {notification.action_url && (
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(notification.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                  <p className="text-sm font-medium">{t('header.myAccount')}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                {t('common.settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                {t('common.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;