import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Chat } from '@/components/community/Chat';

// Lista completa dei paesi (semplificata per la ricerca)
const COUNTRIES = [
  'Algeria', 'Argentina', 'Australia', 'Austria', 'Belgio', 'Brasile', 'Bulgaria', 
  'Canada', 'Cile', 'Cina', 'Cipro', 'Colombia', 'Corea del Sud', 'Croazia', 
  'Danimarca', 'Egitto', 'Etiopia', 'Filippine', 'Finlandia', 'Francia', 
  'Germania', 'Giappone', 'Grecia', 'India', 'Indonesia', 'Irlanda', 'Islanda', 
  'Italia', 'Kenya', 'Lussemburgo', 'Malesia', 'Malta', 'Marocco', 'Messico', 
  'Nigeria', 'Norvegia', 'Nuova Zelanda', 'Paesi Bassi', 'Perù', 'Polonia', 
  'Portogallo', 'Regno Unito', 'Repubblica Ceca', 'Romania', 'Russia', 
  'Singapore', 'Slovacchia', 'Slovenia', 'Spagna', 'Stati Uniti', 'Sudafrica', 
  'Svezia', 'Svizzera', 'Tailandia', 'Tunisia', 'Turchia', 'Ungheria', 
  'Venezuela', 'Vietnam'
].sort();

// Mappa per le bandiere
const COUNTRY_FLAGS = {
  'Algeria': '🇩🇿', 'Argentina': '🇦🇷', 'Australia': '🇦🇺', 'Austria': '🇦🇹',
  'Belgio': '🇧🇪', 'Brasile': '🇧🇷', 'Bulgaria': '🇧🇬', 'Canada': '🇨🇦',
  'Cile': '🇨🇱', 'Cina': '🇨🇳', 'Cipro': '🇨🇾', 'Colombia': '🇨🇴',
  'Corea del Sud': '🇰🇷', 'Croazia': '🇭🇷', 'Danimarca': '🇩🇰', 'Egitto': '🇪🇬',
  'Etiopia': '🇪🇹', 'Filippine': '🇵🇭', 'Finlandia': '🇫🇮', 'Francia': '🇫🇷',
  'Germania': '🇩🇪', 'Giappone': '🇯🇵', 'Grecia': '🇬🇷', 'India': '🇮🇳',
  'Indonesia': '🇮🇩', 'Irlanda': '🇮🇪', 'Islanda': '🇮🇸', 'Italia': '🇮🇹',
  'Kenya': '🇰🇪', 'Lussemburgo': '🇱🇺', 'Malesia': '🇲🇾', 'Malta': '🇲🇹',
  'Marocco': '🇲🇦', 'Messico': '🇲🇽', 'Nigeria': '🇳🇬', 'Norvegia': '🇳🇴',
  'Nuova Zelanda': '🇳🇿', 'Paesi Bassi': '🇳🇱', 'Perù': '🇵🇪', 'Polonia': '🇵🇱',
  'Portogallo': '🇵🇹', 'Regno Unito': '🇬🇧', 'Repubblica Ceca': '🇨🇿', 'Romania': '🇷🇴',
  'Russia': '🇷🇺', 'Singapore': '🇸🇬', 'Slovacchia': '🇸🇰', 'Slovenia': '🇸🇮',
  'Spagna': '🇪🇸', 'Stati Uniti': '🇺🇸', 'Sudafrica': '🇿🇦', 'Svezia': '🇸🇪',
  'Svizzera': '🇨🇭', 'Tailandia': '🇹🇭', 'Tunisia': '🇹🇳', 'Turchia': '🇹🇷',
  'Ungheria': '🇭🇺', 'Venezuela': '🇻🇪', 'Vietnam': '🇻🇳'
};

// Lista completa delle razze cani
const DOG_BREEDS = [
  'Affenpinscher', 'Afghan Hound', 'Airedale Terrier', 'Akbash', 'Akita', 'Alaskan Klee Kai',
  'Alaskan Malamute', 'American Bulldog', 'American Cocker Spaniel', 'American Eskimo Dog',
  'American Foxhound', 'American Pit Bull Terrier', 'American Staffordshire Terrier', 'American Water Spaniel',
  'Anatolian Shepherd', 'Australian Cattle Dog', 'Australian Kelpie', 'Australian Shepherd', 'Australian Terrier',
  'Basenji', 'Basset Hound', 'Beagle', 'Bearded Collie', 'Bedlington Terrier', 'Belgian Malinois',
  'Belgian Sheepdog', 'Belgian Tervuren', 'Bernese Mountain Dog', 'Bichon Frise', 'Black and Tan Coonhound',
  'Black Russian Terrier', 'Bloodhound', 'Blue Heeler', 'Bluetick Coonhound', 'Boerboel', 'Border Collie',
  'Border Terrier', 'Borzoi', 'Boston Terrier', 'Bouvier des Flandres', 'Boxer', 'Boykin Spaniel',
  'Bracco Italiano', 'Brittany', 'Brussels Griffon', 'Bull Terrier', 'Bulldog', 'Bulldog Francese',
  'Bullmastiff', 'Cairn Terrier', 'Canaan Dog', 'Cane Corso', 'Cardigan Welsh Corgi', 'Catahoula Leopard Dog',
  'Cavalier King Charles Spaniel', 'Chesapeake Bay Retriever', 'Chihuahua', 'Chinese Crested', 'Chinese Shar-Pei',
  'Chow Chow', 'Clumber Spaniel', 'Cocker Spaniel', 'Collie', 'Coonhound', 'Coton de Tulear',
  'Curly-Coated Retriever', 'Dachshund', 'Dalmatian', 'Dandie Dinmont Terrier', 'Doberman Pinscher',
  'Dogue de Bordeaux', 'Dutch Shepherd', 'English Bulldog', 'English Cocker Spaniel', 'English Foxhound',
  'English Mastiff', 'English Setter', 'English Springer Spaniel', 'English Toy Spaniel', 'Entlebucher Mountain Dog',
  'Field Spaniel', 'Finnish Lapphund', 'Finnish Spitz', 'Flat-Coated Retriever', 'Fox Terrier', 'French Bulldog',
  'German Pinscher', 'German Shepherd', 'German Shorthaired Pointer', 'German Wirehaired Pointer', 'Giant Schnauzer',
  'Glen of Imaal Terrier', 'Golden Retriever', 'Gordon Setter', 'Great Dane', 'Great Pyrenees',
  'Greater Swiss Mountain Dog', 'Greyhound', 'Harrier', 'Havanese', 'Ibizan Hound', 'Icelandic Sheepdog',
  'Irish Red and White Setter', 'Irish Setter', 'Irish Terrier', 'Irish Water Spaniel', 'Irish Wolfhound',
  'Italian Greyhound', 'Jack Russell Terrier', 'Japanese Chin', 'Japanese Spitz', 'Keeshond', 'Kerry Blue Terrier',
  'Komondor', 'Kuvasz', 'Labrador Retriever', 'Lagotto Romagnolo', 'Lakeland Terrier', 'Lancashire Heeler',
  'Large Munsterlander', 'Leonberger', 'Lhasa Apso', 'Lowchen', 'Maltese', 'Manchester Terrier',
  'Maremma Sheepdog', 'Mastiff', 'Miniature Bull Terrier', 'Miniature Pinscher', 'Miniature Schnauzer',
  'Neapolitan Mastiff', 'Newfoundland', 'Norfolk Terrier', 'Norwegian Buhund', 'Norwegian Elkhound',
  'Norwich Terrier', 'Nova Scotia Duck Tolling Retriever', 'Old English Sheepdog', 'Otterhound', 'Papillon',
  'Parson Russell Terrier', 'Pastore Tedesco', 'Pekingese', 'Pembroke Welsh Corgi', 'Petit Basset Griffon Vendeen',
  'Pharaoh Hound', 'Plott', 'Pointer', 'Polish Lowland Sheepdog', 'Pomeranian', 'Poodle', 'Portuguese Water Dog',
  'Pug', 'Puli', 'Pyrenean Shepherd', 'Redbone Coonhound', 'Rhodesian Ridgeback', 'Rottweiler', 'Rough Collie',
  'Saint Bernard', 'Saluki', 'Samoyed', 'Schipperke', 'Schnauzer', 'Scottish Deerhound', 'Scottish Terrier',
  'Sealyham Terrier', 'Shar Pei', 'Shetland Sheepdog', 'Shiba Inu', 'Shih Tzu', 'Siberian Husky',
  'Silky Terrier', 'Skye Terrier', 'Smooth Collie', 'Smooth Fox Terrier', 'Soft Coated Wheaten Terrier',
  'Spinone Italiano', 'Staffordshire Bull Terrier', 'Standard Schnauzer', 'Sussex Spaniel', 'Swedish Vallhund',
  'Tibetan Mastiff', 'Tibetan Spaniel', 'Tibetan Terrier', 'Toy Fox Terrier', 'Treeing Walker Coonhound',
  'Vizsla', 'Weimaraner', 'Welsh Springer Spaniel', 'Welsh Terrier', 'West Highland White Terrier',
  'Whippet', 'Wire Fox Terrier', 'Wirehaired Pointing Griffon', 'Xoloitzcuintli', 'Yorkshire Terrier'
];

// Lista completa delle razze gatti
const CAT_BREEDS = [
  'Abissino', 'American Bobtail', 'American Curl', 'American Shorthair', 'American Wirehair',
  'Angora Turco', 'Balinese', 'Bambino', 'Bengala', 'Birman', 'Birmano', 'Bombay',
  'British Longhair', 'British Shorthair', 'Burmese', 'Burmilla', 'California Spangled',
  'Certosino', 'Chartreux', 'Chausie', 'Cornish Rex', 'Cymric', 'Devon Rex',
  'Donskoy', 'Dragon Li', 'Egyptian Mau', 'Europeo', 'Exotic Shorthair', 'Havana Brown',
  'Himalayan', 'Japanese Bobtail', 'Javanese', 'Khao Manee', 'Korat', 'Kurilian Bobtail',
  'LaPerm', 'Maine Coon', 'Manx', 'Mau Egiziano', 'Munchkin', 'Nebelung',
  'Norwegian Forest Cat', 'Ocicat', 'Oriental', 'Oriental Longhair', 'Oriental Shorthair',
  'Persiano', 'Peterbald', 'Pixie-bob', 'Ragamuffin', 'Ragdoll', 'Russian Blue',
  'Savannah', 'Scottish Fold', 'Selkirk Rex', 'Siamese', 'Siberian', 'Singapura',
  'Snowshoe', 'Sokoke', 'Somali', 'Sphynx', 'Tonkinese', 'Toyger', 'Turkish Angora',
  'Turkish Van', 'Ukrainian Levkoy'
];

// Tutte le razze (cani + gatti)
const ALL_BREEDS = [...DOG_BREEDS, ...CAT_BREEDS].sort();

const CommunityPage = () => {
  const { user } = useAuth();
  
  const [myGroups, setMyGroups] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedBreed, setSelectedBreed] = useState('all');
  const [privateChats, setPrivateChats] = useState([]);
  const [activeChatType, setActiveChatType] = useState('group'); // 'group' or 'private'
  
  useEffect(() => {
    if (user?.id) {
      loadMyGroups();
      loadPrivateChats();
    }
  }, [user?.id]);
  
  useEffect(() => {
    generateAvailableGroups();
  }, [selectedCountry, selectedBreed]);
  
  const loadPrivateChats = async () => {
    try {
      const { data, error } = await supabase
        .from('private_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('deleted_by_sender', false)
        .eq('deleted_by_recipient', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Raggruppa per conversazione (con l'altro utente)
      const conversations = {};
      const userIds = new Set();
      
      data?.forEach(msg => {
        const otherUserId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        userIds.add(otherUserId);
        
        if (!conversations[otherUserId]) {
          conversations[otherUserId] = {
            userId: otherUserId,
            userName: 'Caricamento...', // Verrà aggiornato dopo
            lastMessageTime: msg.created_at,
            unreadCount: 0
          };
        }
      });

      // Carica i nomi degli utenti
      if (userIds.size > 0) {
        const { data: userData, error: userError } = await supabase
          .from('user_display_names')
          .select('user_id, display_name')
          .in('user_id', Array.from(userIds) as string[]);

        if (!userError && userData) {
          userData.forEach(user => {
            if (conversations[user.user_id]) {
              conversations[user.user_id].userName = user.display_name || 'Utente sconosciuto';
            }
          });
        }
      }

      setPrivateChats(Object.values(conversations));
    } catch (error) {
      console.error('Errore caricamento chat private:', error);
    }
  };

  const deletePrivateChat = async (otherUserId) => {
    try {
      console.log('Eliminando chat con utente:', otherUserId);
      
      // Elimina fisicamente tutti i messaggi della conversazione
      const { data: deletedData, error } = await supabase
        .from('private_messages')
        .delete()
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
        .select();

      if (error) {
        console.error('Errore DELETE:', error);
        throw error;
      }

      console.log('Messaggi eliminati:', deletedData?.length || 0);

      // Ricarica la lista delle chat private
      await loadPrivateChats();
      
      // Chiudi la chat se è quella attiva
      if (activeChat === `private_${otherUserId}`) {
        setActiveChat(null);
      }
      
      toast({
        title: "Chat eliminata",
        description: "La conversazione è stata eliminata completamente"
      });
      
    } catch (error) {
      console.error('Errore eliminazione chat:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare la conversazione",
        variant: "destructive"
      });
    }
  };

  const openPrivateChat = (userId) => {
    setActiveChat(`private_${userId}`);
    setActiveChatType('private');
  };

  const loadMyGroups = async () => {
    try {
      const { data } = await supabase
        .from('user_channel_subscriptions')
        .select('channel_name')
        .eq('user_id', user.id);
      
      const groupIds = data?.map(item => item.channel_name) || [];
      
      const groupsMap = new Map();
      
      groupIds.forEach(id => {
        const group = createGroupFromId(id);
        if (group && group.name !== 'Unknown - Group') {
          groupsMap.set(group.id, group);
        }
      });
      
      const groups = Array.from(groupsMap.values());
      setMyGroups(groups);
      console.log('I MIEI GRUPPI:', groups);
      
    } catch (error) {
      console.error('Errore caricamento gruppi:', error);
    }
  };
  
  const generateAvailableGroups = () => {
    const groups = [];
    
    if (selectedCountry && selectedCountry !== 'all') {
      groups.push({
        id: `${selectedCountry.toLowerCase()}-general`,
        name: selectedCountry,
        type: 'general',
        country: selectedCountry
      });
      
      if (selectedBreed && selectedBreed !== 'all') {
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
  
  const joinGroup = async (groupId) => {
    try {
      await supabase
        .from('user_channel_subscriptions')
        .insert({ user_id: user.id, channel_name: groupId });
      
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
  
  const leaveGroup = async (groupId) => {
    try {
      await supabase
        .from('user_channel_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('channel_name', groupId);
      
      await loadMyGroups();
      
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
  
  const leaveAllGroups = async () => {
    try {
      await supabase
        .from('user_channel_subscriptions')
        .delete()
        .eq('user_id', user.id);
      
      await loadMyGroups();
      setActiveChat(null);
      
      toast({
        title: "Uscita completata",
        description: "Hai lasciato tutti i gruppi"
      });
      
    } catch (error) {
      console.error('Errore leave all:', error);
      toast({
        title: "Errore",
        description: "Impossibile uscire da tutti i gruppi",
        variant: "destructive"
      });
    }
  };
  
  const openChat = (groupId) => {
    setActiveChat(groupId);
    setActiveChatType('group');
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
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
                      value={selectedCountry} 
                      onValueChange={(value) => setSelectedCountry(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona paese" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tutti i paesi</SelectItem>
                        {COUNTRIES.map(country => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Razza</label>
                    <Select 
                      value={selectedBreed} 
                      onValueChange={(value) => setSelectedBreed(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona razza" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tutte le razze</SelectItem>
                        {ALL_BREEDS.map(breed => (
                          <SelectItem key={breed} value={breed}>
                            {breed}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1 space-y-4">
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
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>I Tuoi Gruppi ({myGroups.length})</CardTitle>
                  {myGroups.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          Esci da tutti i gruppi
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Conferma uscita da tutti i gruppi</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sei sicuro di voler uscire da tutti i {myGroups.length} gruppi? 
                            Non riceverai più messaggi da nessun gruppo.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={leaveAllGroups}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Esci da tutti i gruppi
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="destructive"
                            >
                              Esci
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Conferma uscita dal gruppo</AlertDialogTitle>
                              <AlertDialogDescription>
                                Sei sicuro di voler uscire dal gruppo "{group.name}"? 
                                Non riceverai più messaggi da questo gruppo.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annulla</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => leaveGroup(group.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Esci dal gruppo
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
            
            <Card>
              <CardHeader>
                <CardTitle>Messaggi Privati ({privateChats.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {privateChats.map(chat => (
                    <div key={chat.userId} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                       <div className="flex-1">
                         <div className="font-medium">{chat.userName}</div>
                       </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openPrivateChat(chat.userId)}
                        >
                          Apri
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              Elimina
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Elimina conversazione</AlertDialogTitle>
                              <AlertDialogDescription>
                                Sei sicuro di voler eliminare la conversazione con {chat.userName}? 
                                La cronologia verrà eliminata definitivamente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annulla</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deletePrivateChat(chat.userId)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Elimina conversazione
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                  {privateChats.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      Nessun messaggio privato
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Chat Community</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[600px]">
                  {activeChat ? (
                    <Chat 
                      channelId={activeChat} 
                      channelName={myGroups.find(g => g.id === activeChat)?.name || activeChat}
                    />
                  ) : (
                    <div className="text-center text-muted-foreground flex items-center justify-center h-full">
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