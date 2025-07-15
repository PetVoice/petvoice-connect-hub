import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageInput } from '@/components/MessageInput';
import { 
  MessageSquare, 
  CheckCircle,
  Users,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

// Types
interface Channel {
  id: string;
  name: string;
  description: string;
  channel_type: 'country' | 'pet_type' | 'breed' | 'general';
  country_code?: string;
  pet_type?: 'dog' | 'cat' | 'other';
  breed?: string;
  emoji?: string;
  is_active: boolean;
}

interface Message {
  id: string;
  content?: string;
  user_id: string;
  channel_id: string;
  message_type: 'text' | 'voice' | 'image';
  is_emergency: boolean;
  file_url?: string;
  voice_duration?: number;
  metadata: any;
  created_at: string;
  updated_at: string;
  user_profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

const CommunityPage = () => {
  const { user } = useAuth();
  
  // State management
  const [channels, setChannels] = useState<Channel[]>([]);
  const [subscribedChannels, setSubscribedChannels] = useState<string[]>([]);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load channels from database
  const loadChannels = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('community_channels')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setChannels((data as Channel[]) || []);
    } catch (error) {
      console.error('Error loading channels:', error);
    }
  }, []);

  // Load user subscriptions
  const loadUserSubscriptions = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_channel_subscriptions')
        .select('channel_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const subscribedChannelIds = data?.map(sub => sub.channel_id) || [];
      setSubscribedChannels(subscribedChannelIds);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  }, [user]);

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!activeChannel) return;
    
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('community_messages')
        .select(`
          id,
          content,
          user_id,
          channel_id,
          message_type,
          is_emergency,
          file_url,
          voice_duration,
          metadata,
          created_at,
          updated_at
        `)
        .eq('channel_id', activeChannel)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });
      
      if (messagesError) {
        console.error('Error loading messages:', messagesError);
        throw messagesError;
      }

      // Load user profiles for messages
      const userIds = [...new Set(messagesData?.map(msg => msg.user_id) || [])];
      let profilesData = [];
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds);
        profilesData = profiles || [];
      }

      // Combine messages with profiles
      const messagesWithProfiles = messagesData?.map(message => ({
        ...message,
        message_type: message.message_type as 'text' | 'voice' | 'image',
        user_profile: profilesData.find(p => p.user_id === message.user_id)
      })) || [];

      setMessages(messagesWithProfiles as Message[]);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [activeChannel]);

  // Subscribe to channel
  const subscribeToChannel = useCallback(async (channelId: string) => {
    if (!user) return;
    
    try {
      // Check if user is already subscribed
      const { data: existingSubscription } = await supabase
        .from('user_channel_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('channel_id', channelId)
        .maybeSingle();
      
      if (existingSubscription) {
        setActiveChannel(channelId);
        await loadUserSubscriptions();
        toast({
          title: "Già iscritto",
          description: "Sei già iscritto a questo canale!"
        });
        return;
      }
      
      const { error } = await supabase
        .from('user_channel_subscriptions')
        .insert({
          user_id: user.id,
          channel_id: channelId,
          notifications_enabled: true
        });
      
      if (error) throw error;
      
      setActiveChannel(channelId);
      await loadUserSubscriptions();
      
      toast({
        title: "Iscrizione completata",
        description: "Ora puoi chattare in questo canale!"
      });
    } catch (error) {
      console.error('Error subscribing to channel:', error);
      toast({
        title: "Errore",
        description: "Impossibile iscriversi al canale",
        variant: "destructive"
      });
    }
  }, [user, loadUserSubscriptions]);

  // Unsubscribe from channel
  const unsubscribeFromChannel = useCallback(async (channelId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_channel_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('channel_id', channelId);
      
      if (error) throw error;
      
      if (activeChannel === channelId) {
        setActiveChannel(null);
      }
      
      await loadUserSubscriptions();
      
      toast({
        title: "Disiscrizione completata",
        description: "Hai lasciato il canale"
      });
    } catch (error) {
      console.error('Error unsubscribing from channel:', error);
      toast({
        title: "Errore",
        description: "Impossibile lasciare il canale",
        variant: "destructive"
      });
    }
  }, [user, activeChannel, loadUserSubscriptions]);

  // Message sent callback
  const handleMessageSent = useCallback(() => {
    loadMessages();
  }, [loadMessages]);

  // Effects
  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  useEffect(() => {
    if (user) {
      loadUserSubscriptions();
    }
  }, [user, loadUserSubscriptions]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Card className="p-8 text-center">
          <CardHeader>
            <CardTitle>Accesso richiesto</CardTitle>
            <CardDescription>
              Devi essere registrato per accedere alla community
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const subscribedChannelsList = channels.filter(channel => subscribedChannels.includes(channel.id));
  const availableChannelsList = channels.filter(channel => !subscribedChannels.includes(channel.id));

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Community PetVoice</h1>
            <p className="text-muted-foreground">
              Connettiti con proprietari e esperti di tutto il mondo
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r bg-muted/50 flex flex-col">
          <ScrollArea className="flex-1">
            {/* I tuoi canali */}
            {subscribedChannelsList.length > 0 && (
              <div className="border-b">
                <div className="p-4 border-b">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    I tuoi canali
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {subscribedChannelsList.map((channel) => {
                    const isActive = activeChannel === channel.id;
                    
                    return (
                      <div
                        key={channel.id}
                        className={`bg-card border rounded-lg p-3 ${
                          isActive ? 'border-primary bg-primary/5' : 'border-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{channel.emoji || '🌐'}</span>
                            <div>
                              <div className="text-sm font-medium">{channel.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {channel.channel_type}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant={isActive ? "default" : "outline"}
                              onClick={() => setActiveChannel(channel.id)}
                            >
                              {isActive ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Attivo
                                </>
                              ) : (
                                <>
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  Apri
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => unsubscribeFromChannel(channel.id)}
                              title="Esci dal canale"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          {channel.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Canali disponibili */}
            <div>
              <div className="p-4 border-b">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Canali disponibili
                </div>
              </div>
              <div className="p-4 space-y-3">
                {availableChannelsList.length > 0 ? (
                  availableChannelsList.map((channel) => {
                    return (
                      <div
                        key={channel.id}
                        className="bg-card border rounded-lg p-3 border-muted"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{channel.emoji || '🌐'}</span>
                            <div>
                              <div className="text-sm font-medium">{channel.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {channel.channel_type}
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => subscribeToChannel(channel.id)}
                          >
                            <Users className="h-3 w-3 mr-1" />
                            Entra
                          </Button>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          {channel.description}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {channels.length === 0 ? 'Caricamento canali...' : 'Nessun nuovo canale'}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {channels.length === 0 
                        ? 'Sto caricando i canali disponibili...'
                        : 'Sei già iscritto a tutti i canali disponibili'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          {activeChannel ? (
            <>
              {/* Chat Header */}
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-lg">
                      {channels.find(c => c.id === activeChannel)?.emoji || '🌐'}
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {channels.find(c => c.id === activeChannel)?.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {channels.find(c => c.id === activeChannel)?.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {messages.length} messaggi
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveChannel(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <Avatar>
                      <AvatarImage src={message.user_profile?.avatar_url} />
                      <AvatarFallback>
                        {message.user_profile?.display_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {message.user_profile?.display_name || 'Utente'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(message.created_at), { 
                            addSuffix: true, 
                            locale: it 
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <MessageInput
                channelId={activeChannel}
                channelName={channels.find(c => c.id === activeChannel)?.name || 'Canale'}
                onMessageSent={handleMessageSent}
                disabled={loading}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Seleziona un canale
                </h3>
                <p className="text-muted-foreground">
                  Scegli un canale dalla barra laterale per iniziare a chattare
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;