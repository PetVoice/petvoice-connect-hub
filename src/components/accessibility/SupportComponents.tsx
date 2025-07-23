import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, HeadphonesIcon, Users, MessageSquare, Mail, Phone, Clock, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { useTranslatedToast } from '@/hooks/use-translated-toast';

interface SupportModalProps {
  onClose: () => void;
}

export const ContactSupport: React.FC<SupportModalProps> = ({ onClose }) => {
  const { showToast } = useTranslatedToast();
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    priority: 'medium',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulazione invio
    showToast({
      title: "Richiesta inviata",
      description: "Il nostro team ti contatterà entro 24 ore"
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background max-w-2xl max-h-[90vh] w-full mx-4 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <HeadphonesIcon className="h-5 w-5" />
            Contatta Supporto
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Il nostro team di supporto è specializzato in accessibilità e ti risponderà il prima possibile.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Mail className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h4 className="font-medium">Email</h4>
                  <p className="text-sm text-muted-foreground">petvoice2025@gmail.com</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Phone className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h4 className="font-medium">Telefono</h4>
                  <p className="text-sm text-muted-foreground">+39 02 1234567</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <h4 className="font-medium">Orari</h4>
                  <p className="text-sm text-muted-foreground">Lun-Ven 9-18</p>
                </CardContent>
              </Card>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Oggetto</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority">Priorità</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Bassa</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Invia Richiesta
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CommunityAccessibility: React.FC<SupportModalProps> = ({ onClose }) => {
  const discussions = [
    {
      title: "Migliori screen reader per sviluppatori",
      author: "Marco",
      replies: 12,
      time: "2 ore fa",
      category: "Screen Reader"
    },
    {
      title: "Combinazioni di colori ad alto contrasto",
      author: "Laura",
      replies: 8,
      time: "1 giorno fa",
      category: "Contrasto"
    },
    {
      title: "Font più leggibili per dislessici",
      author: "Andrea",
      replies: 15,
      time: "2 giorni fa",
      category: "Tipografia"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background max-w-3xl max-h-[90vh] w-full mx-4 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Accessibilità
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h4 className="font-medium">1,234</h4>
                  <p className="text-sm text-muted-foreground">Membri attivi</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h4 className="font-medium">89</h4>
                  <p className="text-sm text-muted-foreground">Discussioni</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <h4 className="font-medium">456</h4>
                  <p className="text-sm text-muted-foreground">Soluzioni</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Discussioni Recenti</h3>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Nuova Discussione
                </Button>
              </div>
              
              <div className="space-y-4">
                {discussions.map((discussion, index) => (
                  <Card key={index} className="hover:bg-muted/50 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{discussion.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            da {discussion.author} • {discussion.time}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{discussion.category}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {discussion.replies} risposte
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                Unisciti alla nostra community per condividere esperienze e ricevere supporto da altri utenti.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FeedbackAccessibility: React.FC<SupportModalProps> = ({ onClose }) => {
  const { showToast } = useTranslatedToast();
  const [feedback, setFeedback] = React.useState({
    category: '',
    rating: 5,
    comment: '',
    suggestions: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast({
      title: "Feedback inviato",
      description: "Grazie per il tuo contributo! Ci aiuterà a migliorare l'accessibilità."
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background max-w-2xl max-h-[90vh] w-full mx-4 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedback Accessibilità
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>
                Il tuo feedback è prezioso per migliorare l'accessibilità della nostra app.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select value={feedback.category} onValueChange={(value) => setFeedback({...feedback, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="screen-reader">Screen Reader</SelectItem>
                    <SelectItem value="contrast">Alto Contrasto</SelectItem>
                    <SelectItem value="font-size">Dimensione Font</SelectItem>
                    <SelectItem value="navigation">Navigazione</SelectItem>
                    <SelectItem value="general">Generale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="rating">Valutazione (1-5)</Label>
                <Select value={feedback.rating.toString()} onValueChange={(value) => setFeedback({...feedback, rating: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Molto scarso</SelectItem>
                    <SelectItem value="2">2 - Scarso</SelectItem>
                    <SelectItem value="3">3 - Sufficiente</SelectItem>
                    <SelectItem value="4">4 - Buono</SelectItem>
                    <SelectItem value="5">5 - Eccellente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="comment">Commento</Label>
                <Textarea
                  id="comment"
                  value={feedback.comment}
                  onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
                  placeholder="Descrivi la tua esperienza..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="suggestions">Suggerimenti</Label>
                <Textarea
                  id="suggestions"
                  value={feedback.suggestions}
                  onChange={(e) => setFeedback({...feedback, suggestions: e.target.value})}
                  placeholder="Come possiamo migliorare?"
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Invia Feedback
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};