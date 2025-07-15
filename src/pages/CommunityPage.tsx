import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// SISTEMA GRUPPI NUOVO - DA ZERO
const CommunityPage = () => {
  const { user } = useAuth();
  
  // STATI SEMPLICI
  const [myGroups, setMyGroups] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedBreed, setSelectedBreed] = useState(null);
  
  // CARICA I MIEI GRUPPI SEMPRE ALL'INIZIO
  useEffect(() => {
    if (user?.id) {
      loadMyGroups();
    }
  }, [user?.id]);
  
  // GENERA GRUPPI DISPONIBILI QUANDO CAMBIANO I MENU
  useEffect(() => {
    generateAvailableGroups();
  }, [selectedCountry, selectedBreed]);
  
  // FUNZIONE 1: CARICA GRUPPI UTENTE DAL DATABASE
  const loadMyGroups = async () => {
    try {
      const { data } = await supabase
        .from('user_channel_subscriptions')
        .select('channel_name')
        .eq('user_id', user.id);
      
      const groupIds = data?.map(item => item.channel_name) || [];
      
      // Converte IDs in oggetti gruppo
      const groups = groupIds.map(id => createGroupFromId(id)).filter(Boolean);
      
      setMyGroups(groups);
      console.log('I MIEI GRUPPI:', groups);
      
    } catch (error) {
      console.error('Errore caricamento gruppi:', error);
    }
  };
  
  // FUNZIONE 2: GENERA GRUPPI DISPONIBILI
  const generateAvailableGroups = () => {
    const groups = [];
    
    if (selectedCountry) {
      // Gruppo generico paese
      groups.push({
        id: `${selectedCountry.toLowerCase()}-general`,
        name: selectedCountry,
        type: 'general',
        country: selectedCountry
      });
      
      // Gruppo specifico razza
      if (selectedBreed) {
        groups.push({
          id: `${selectedCountry.toLowerCase()}-${selectedBreed.toLowerCase().replace(/\s+/g, '-')}`,
          name: `${selectedCountry} - ${selectedBreed}`,
          type: 'breed',
          country: selectedCountry,
          breed: selectedBreed
        });
      }
    }
    
    setAvailableGroups(groups);
  };
  
  // FUNZIONE 3: CREA OGGETTO GRUPPO DA ID
  const createGroupFromId = (groupId) => {
    if (groupId.endsWith('-general')) {
      const country = groupId.replace('-general', '');
      return {
        id: groupId,
        name: country.charAt(0).toUpperCase() + country.slice(1),
        type: 'general',
        country: country.charAt(0).toUpperCase() + country.slice(1)
      };
    } else {
      const parts = groupId.split('-');
      if (parts.length >= 2) {
        const country = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        const breed = parts.slice(1).join(' ').replace(/-/g, ' ')
          .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return {
          id: groupId,
          name: `${country} - ${breed}`,
          type: 'breed',
          country: country,
          breed: breed
        };
      }
    }
    return null;
  };
  
  // FUNZIONE 4: ENTRA IN GRUPPO
  const joinGroup = async (groupId) => {
    try {
      await supabase
        .from('user_channel_subscriptions')
        .insert({ user_id: user.id, channel_name: groupId });
      
      // Ricarica i miei gruppi
      await loadMyGroups();
      
      toast({
        title: "Ingresso completato",
        description: "Ti sei unito al gruppo con successo"
      });
      
    } catch (error) {
      if (!error.message.includes('duplicate')) {
        console.error('Errore join:', error);
        toast({
          title: "Errore",
          description: "Impossibile entrare nel gruppo",
          variant: "destructive"
        });
      }
    }
  };
  
  // FUNZIONE 5: ESCI DA GRUPPO
  const leaveGroup = async (groupId) => {
    try {
      await supabase
        .from('user_channel_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('channel_name', groupId);
      
      // Ricarica i miei gruppi
      await loadMyGroups();
      
      // Chiudi chat se era attiva
      if (activeChat === groupId) {
        setActiveChat(null);
      }
      
      toast({
        title: "Uscita completata",
        description: "Hai lasciato il gruppo"
      });
      
    } catch (error) {
      console.error('Errore leave:', error);
      toast({
        title: "Errore",
        description: "Impossibile uscire dal gruppo",
        variant: "destructive"
      });
    }
  };
  
  // FUNZIONE 6: APRI CHAT
  const openChat = (groupId) => {
    setActiveChat(groupId);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* MENU A TENDINA */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Filtri Community</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Paese</label>
                    <Select 
                      value={selectedCountry || ''} 
                      onValueChange={(value) => setSelectedCountry(value || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona paese" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tutti i paesi</SelectItem>
                        <SelectItem value="Italia">Italia</SelectItem>
                        <SelectItem value="Germania">Germania</SelectItem>
                        <SelectItem value="Francia">Francia</SelectItem>
                        <SelectItem value="Spagna">Spagna</SelectItem>
                        <SelectItem value="Regno Unito">Regno Unito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Razza</label>
                    <Select 
                      value={selectedBreed || ''} 
                      onValueChange={(value) => setSelectedBreed(value || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona razza" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tutte le razze</SelectItem>
                        <SelectItem value="Boxer">Boxer</SelectItem>
                        <SelectItem value="Labrador">Labrador</SelectItem>
                        <SelectItem value="Bulldog">Bulldog</SelectItem>
                        <SelectItem value="Golden Retriever">Golden Retriever</SelectItem>
                        <SelectItem value="Pastore Tedesco">Pastore Tedesco</SelectItem>
                        <SelectItem value="Border Collie">Border Collie</SelectItem>
                        <SelectItem value="Rottweiler">Rottweiler</SelectItem>
                        <SelectItem value="Beagle">Beagle</SelectItem>
                        <SelectItem value="Yorkshire Terrier">Yorkshire Terrier</SelectItem>
                        <SelectItem value="Chihuahua">Chihuahua</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* SIDEBAR */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* GRUPPI DISPONIBILI */}
            <Card>
              <CardHeader>
                <CardTitle>Gruppi Disponibili</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableGroups
                    .filter(group => !myGroups.some(my => my.id === group.id))
                    .map(group => (
                      <div key={group.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                        <div>
                          <div className="font-medium">{group.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {group.type === 'general' ? 'Gruppo generale' : 'Gruppo specifico'}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => joinGroup(group.id)}
                          className="ml-2"
                        >
                          Entra
                        </Button>
                      </div>
                    ))}
                  {availableGroups.filter(group => !myGroups.some(my => my.id === group.id)).length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      Nessun gruppo disponibile
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* I MIEI GRUPPI */}
            <Card>
              <CardHeader>
                <CardTitle>I Tuoi Gruppi ({myGroups.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myGroups.map(group => (
                    <div key={group.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div>
                        <div className="font-medium">{group.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {group.type === 'general' ? 'Gruppo generale' : 'Gruppo specifico'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openChat(group.id)}
                        >
                          Apri
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => leaveGroup(group.id)}
                        >
                          Esci
                        </Button>
                      </div>
                    </div>
                  ))}
                  {myGroups.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      Non sei iscritto a nessun gruppo
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* AREA CHAT */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Chat Community</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center bg-muted/20 rounded-lg">
                  {activeChat ? (
                    <div className="text-center">
                      <div className="text-lg font-semibold mb-2">
                        Chat attiva: {myGroups.find(g => g.id === activeChat)?.name || activeChat}
                      </div>
                      <div className="text-muted-foreground">
                        Funzionalità chat in sviluppo...
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      Seleziona un gruppo per iniziare a chattare
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;