import React, { useState } from 'react';
import { Bell, Moon, Sun, LogOut, Settings, User } from 'lucide-react';
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
import { SidebarTrigger } from '@/components/ui/sidebar';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState('it');
  const [unreadNotifications, setUnreadNotifications] = useState(() => {
    const saved = localStorage.getItem('petvoice-unread-notifications');
    return saved ? parseInt(saved, 10) : 3;
  });

  const markNotificationsAsRead = () => {
    setUnreadNotifications(0);
    localStorage.setItem('petvoice-unread-notifications', '0');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
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