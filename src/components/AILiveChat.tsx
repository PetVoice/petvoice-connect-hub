import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  X, 
  Minimize2, 
  Maximize2,
  HelpCircle,
  Sparkles,
  Clock,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

interface AILiveChatProps {
  isOpen: boolean;
  onClose: () => void;
  minimized?: boolean;
  onToggleMinimize?: () => void;
}

const AILiveChat: React.FC<AILiveChatProps> = ({ 
  isOpen, 
  onClose, 
  minimized = false, 
  onToggleMinimize 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        text: "Ciao! Sono l'assistente AI di PetVoice 🐾. Posso aiutarti con qualsiasi domanda sulla piattaforma: dalla gestione dei tuoi pet, alle analisi comportamentali, al diario, ai protocolli di training e molto altro. Come posso assisterti oggi?",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      // Call the AI assistance edge function
      const { data, error } = await supabase.functions.invoke('ai-assistance', {
        body: { message: userMessage }
      });

      if (error) throw error;
      return data.response || "Mi dispiace, non sono riuscito a processare la tua richiesta. Puoi riprovare?";
    } catch (error) {
      console.error('Error getting AI response:', error);
      return "Si è verificato un errore tecnico. Per assistenza immediata, puoi contattare il nostro supporto nella sezione FAQ.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Add typing indicator
      const typingMessage: ChatMessage = {
        id: 'typing',
        text: '',
        sender: 'ai',
        timestamp: new Date(),
        isTyping: true
      };
      setMessages(prev => [...prev, typingMessage]);

      // Get AI response
      const aiResponse = await getAIResponse(userMessage.text);

      // Remove typing indicator and add actual response
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => msg.id !== 'typing');
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        };
        return [...filteredMessages, aiMessage];
      });

    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => msg.id !== 'typing');
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: "Mi dispiace, si è verificato un errore. Riprova tra poco.",
          sender: 'ai',
          timestamp: new Date()
        };
        return [...filteredMessages, errorMessage];
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "Come aggiungo un nuovo pet?",
    "Come funziona l'analisi AI?", 
    "Come uso il diario comportamentale?",
    "Cos'è il wellness score?",
    "Come funzionano i protocolli di training?",
    "Come programmo un appuntamento veterinario?",
    "Come interpreto le statistiche?",
    "Come funziona la musico-terapia AI?"
  ];

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${minimized ? 'w-80' : 'w-96'} max-h-[600px] transition-all duration-300`}>
      <Card className="shadow-2xl border-primary/20">
        <CardHeader className="p-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Bot className="h-5 w-5" />
              <span>Assistente AI PetVoice</span>
              <Badge variant="secondary" className="text-xs bg-white/20 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </CardTitle>
            <div className="flex items-center space-x-2">
              {onToggleMinimize && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleMinimize}
                  className="h-8 w-8 p-0 text-primary-foreground hover:bg-white/20"
                >
                  {minimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-primary-foreground hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!minimized && (
          <CardContent className="p-0">
            {/* Messages Area */}
            <ScrollArea className="h-80 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`p-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground ml-2'
                            : 'bg-muted mr-2'
                        }`}
                      >
                        {message.isTyping ? (
                          <div className="flex items-center space-x-1">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            </div>
                            <span className="text-sm text-muted-foreground ml-2">Sto scrivendo...</span>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        )}
                      </div>
                      <div className={`flex items-center mt-1 text-xs text-muted-foreground ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}>
                        {message.sender === 'ai' ? (
                          <Bot className="h-3 w-3 mr-1" />
                        ) : (
                          <User className="h-3 w-3 mr-1" />
                        )}
                        <span>{formatDistanceToNow(message.timestamp, { addSuffix: true, locale: it })}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Questions */}
            {messages.length <= 1 && (
              <div className="p-4 border-t border-border">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Domande frequenti:
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {quickQuestions.slice(0, 4).map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickQuestion(question)}
                      className="text-left justify-start h-auto p-2 text-xs"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-border">
              <div className="flex space-x-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Scrivi la tua domanda..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || !inputText.trim()}
                  size="sm"
                  className="px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>Premi Enter per inviare</span>
                {isTyping && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse mr-2"></div>
                    <span>AI sta scrivendo...</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

// Chat Button Component
export const AILiveChatButton: React.FC = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

  return (
    <>
      {!chatOpen && (
        <Button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground"
          size="lg"
        >
          <div className="relative">
            <MessageCircle className="h-6 w-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </Button>
      )}
      
      <AILiveChat 
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        minimized={minimized}
        onToggleMinimize={() => setMinimized(!minimized)}
      />
    </>
  );
};

export default AILiveChat;