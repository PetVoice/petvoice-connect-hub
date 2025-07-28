
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useToastWithIcon } from '@/hooks/use-toast-with-icons';
import { Chat } from '@/components/community/Chat';
import { PetMatchingIntelligence } from '@/components/ai-features/PetMatchingIntelligence';
import { PrivateChatWithReply } from '@/components/private-chat/PrivateChatWithReply';

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
  const { showToast } = useToastWithIcon();
  const [searchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState('groups');
  const [myGroups, setMyGroups] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedBreed, setSelectedBreed] = useState('all');
  const [unreadCounts, setUnreadCounts] = useState({}); // Traccia i messaggi non letti per gruppo
  const [totalUsers, setTotalUsers] = useState(0);
  const [groupUserCounts, setGroupUserCounts] = useState({});
  
  // Load community stats
  const loadCommunityStats = async () => {
    try {
      // Get total count of all registered users on the platform
      const { count: totalUsersCount } = await supabase
        .from('profiles')
        .select('user_id', { count: 'exact', head: true });
      
      setTotalUsers(totalUsersCount || 0);
      
      // Load user counts for each group in myGroups
      const counts = {};
      for (const group of myGroups) {
        const { count } = await supabase
          .from('user_channel_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('channel_name', group.id);
        
        counts[group.id] = count || 0;
      }
      setGroupUserCounts(counts);
    } catch (error) {
      console.error('❌ Error loading community stats:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadMyGroups();
      setupRealtimeSubscription(); // Aggiungi subscription per aggiornamenti in tempo reale
      loadCommunityStats();
    }
    // Force reload on component mount
    loadCommunityStats();
  }, [user?.id]);

  // Handle URL parameters for direct navigation to chat
  useEffect(() => {
    const tab = searchParams.get('tab');
    const chatId = searchParams.get('chatId');
    
    if (tab) {
      setActiveTab(tab);
    }
    
    // If there's a chatId parameter and we're on private tab, focus that chat
    // The PrivateChatWithReply component will handle opening the specific chat
  }, [searchParams]);
  
  useEffect(() => {
    generateAvailableGroups();
  }, [selectedCountry, selectedBreed]);

  // Reload stats when groups change
  useEffect(() => {
    if (myGroups.length > 0) {
      loadCommunityStats();
    }
  }, [myGroups]);

  // Subscription per aggiornare i conteggi in tempo reale
  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('community-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages'
        },
        (payload) => {
          const newMessage = payload.new;
          console.log('📨 New community message received:', newMessage);
          
          // Se il messaggio non è dell'utente corrente, aggiorna il conteggio
          if (newMessage.user_id !== user.id) {
            updateUnreadCountForGroup(newMessage.channel_name);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Aggiorna il conteggio per un singolo gruppo
  const updateUnreadCountForGroup = async (channelName) => {
    const count = await calculateUnreadCount(channelName);
    setUnreadCounts(prev => ({
      ...prev,
      [channelName]: count
    }));
  };

  // Calcola i messaggi non letti per un gruppo specifico (stessa logica delle chat private)
  const calculateUnreadCount = async (channelName) => {
    try {
      // Ottieni l'ultima volta che l'utente ha visualizzato questo gruppo (da localStorage)
      const lastReadKey = `group_last_read_${channelName}_${user.id}`;
      const lastReadTimestamp = localStorage.getItem(lastReadKey);
      const lastRead = lastReadTimestamp ? new Date(lastReadTimestamp) : new Date(0);

      // Prima otteniamo tutti i messaggi del gruppo non eliminati globalmente
      const { data: allMessages, error: messagesError } = await supabase
        .from('community_messages')
        .select('id, created_at')
        .eq('channel_name', channelName)
        .neq('user_id', user.id) // ESCLUDE sempre i messaggi dell'utente corrente
        .is('deleted_at', null) // Solo messaggi non eliminati globalmente
        .gt('created_at', lastRead.toISOString()); // Solo messaggi dopo l'ultima lettura

      if (messagesError || !allMessages) {
        console.error('Error fetching messages:', messagesError);
        return 0;
      }

      // Poi otteniamo i messaggi che l'utente ha eliminato individualmente
      const { data: deletedMessages, error: deletedError } = await supabase
        .from('community_message_deletions')
        .select('message_id')
        .eq('user_id', user.id)
        .in('message_id', allMessages.map(m => m.id));

      if (deletedError) {
        console.error('Error fetching deleted messages:', deletedError);
        return 0;
      }

      // Filtriamo i messaggi eliminati dall'utente
      const deletedMessageIds = new Set(deletedMessages?.map(d => d.message_id) || []);
      const unreadMessages = allMessages.filter(msg => !deletedMessageIds.has(msg.id));

      return unreadMessages.length;
    } catch (error) {
      console.error('Error calculating unread count:', error);
      return 0;
    }
  };

  // Carica i conteggi dei messaggi non letti per tutti i gruppi
  const loadUnreadCounts = async (groups) => {
    const newUnreadCounts = {};
    
    for (const group of groups) {
      const count = await calculateUnreadCount(group.id);
      if (count > 0) {
        newUnreadCounts[group.id] = count;
      }
    }
    
    setUnreadCounts(newUnreadCounts);
  };

  // Marca i messaggi come letti quando si apre una chat
  const markGroupAsRead = async (groupId) => {
    // Salva il timestamp corrente nel localStorage per questo gruppo
    const lastReadKey = `group_last_read_${groupId}_${user.id}`;
    localStorage.setItem(lastReadKey, new Date().toISOString());
    
    // Rimuovi il conteggio non letti per questo gruppo
    setUnreadCounts(prev => {
      const newCounts = { ...prev };
      delete newCounts[groupId];
      return newCounts;
    });
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
      
      // Carica i conteggi dei messaggi non letti
      await loadUnreadCounts(groups);
      
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
      
      showToast({
        title: "Ingresso completato",
        description: "Ti sei unito al gruppo con successo",
        type: 'success'
      });
      
    } catch (error) {
      if (!error.message.includes('duplicate')) {
        console.error('Errore join:', error);
        showToast({
          title: "Errore",
          description: "Impossibile entrare nel gruppo",
          type: 'error'
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
      
      showToast({
        title: "Uscita completata",
        description: "Hai lasciato il gruppo",
        type: 'info'
      });
      
    } catch (error) {
      console.error('Errore leave:', error);
      showToast({
        title: "Errore",
        description: "Impossibile uscire dal gruppo",
        type: 'error'
      });
    }
  };
  
  
  const openChat = (groupId) => {
    setActiveChat(groupId);
    // Marca il gruppo come letto quando viene aperto
    markGroupAsRead(groupId);
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Community
            </h1>
            <p className="text-muted-foreground mt-1">
              Connettiti con altri proprietari di animali e trova supporto nella community
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Membri totali</div>
            <div className="text-2xl font-bold text-primary">{totalUsers.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        // Reset active chat when switching tabs
        if (value !== 'groups') {
          setActiveChat(null);
        }
      }} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="groups">Gruppi</TabsTrigger>
            <TabsTrigger value="private">Chat Private</TabsTrigger>
            <TabsTrigger value="matching">Pet Matching</TabsTrigger>
          </TabsList>
          
          <TabsContent value="groups" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-3">
                <Card className="bg-gradient-to-br from-violet-50/80 to-purple-50/60 border-violet-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
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
                <Card className="bg-gradient-to-br from-emerald-50/80 to-green-50/60 border-emerald-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
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
                
                <Card className="bg-gradient-to-br from-amber-50/80 to-yellow-50/60 border-amber-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
                  <CardContent>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold">I Tuoi Gruppi ({myGroups.length})</h3>
                    </div>
                    <div className="space-y-3">
                      {myGroups.map(group => (
                        <div 
                          key={group.id} 
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                            activeChat === group.id 
                              ? 'bg-primary/10 border-primary/50 shadow-md' 
                              : 'bg-card hover:bg-muted/50'
                          }`}
                          onClick={() => openChat(group.id)}
                         >
                           <div>
                             <div className="flex items-center gap-2">
                               <div className={`font-medium ${activeChat === group.id ? 'text-primary' : ''}`}>
                                 {group.name}
                               </div>
                               <Badge variant="outline" className="text-xs">
                                 👥 {groupUserCounts[group.id] || 0}
                               </Badge>
                                {unreadCounts[group.id] && unreadCounts[group.id] > 0 && activeChat !== group.id && (
                                  <Badge variant="secondary" className="text-xs">
                                    {unreadCounts[group.id]}
                                  </Badge>
                                )}
                             </div>
                             <div className="text-sm text-muted-foreground">
                               {group.type === 'general' ? 'Gruppo generale' : 'Gruppo specifico'}
                             </div>
                           </div>
                          <div className="flex gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={(e) => e.stopPropagation()}
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
                                  <Button
                                    variant="destructive"
                                    onClick={() => leaveGroup(group.id)}
                                  >
                                    Conferma
                                  </Button>
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
              </div>
              
              <div className="lg:col-span-2">
                <Card className="bg-gradient-to-br from-sky-50/80 to-blue-50/60 border-sky-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
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
          </TabsContent>

          <TabsContent value="private" className="space-y-6">
            <PrivateChatWithReply chatId={searchParams.get('chatId')} />
          </TabsContent>
          
          <TabsContent value="matching" className="space-y-6">
            <PetMatchingIntelligence />
          </TabsContent>
        </Tabs>
    </div>
  );
};

export default CommunityPage;
