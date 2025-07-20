import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Heart, Brain, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProtocolRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  protocolId: string;
  protocolTitle: string;
  onRatingSubmitted: () => void;
}

interface Ratings {
  effectiveness: number;
  ease: number;
  improvement: number;
  satisfaction: number;
}

const ratingCategories = [
  {
    key: 'effectiveness' as keyof Ratings,
    title: 'Efficacia del protocollo',
    description: 'Quanto è stato efficace nel risolvere il problema comportamentale?',
    icon: Brain,
    color: 'text-primary'
  },
  {
    key: 'ease' as keyof Ratings,
    title: 'Facilità di esecuzione',
    description: 'Quanto sono stati facili da seguire gli esercizi?',
    icon: Heart,
    color: 'text-green-500'
  },
  {
    key: 'improvement' as keyof Ratings,
    title: 'Miglioramento comportamentale',
    description: 'Quanto miglioramento hai notato nel tuo animale?',
    icon: TrendingUp,
    color: 'text-blue-500'
  },
  {
    key: 'satisfaction' as keyof Ratings,
    title: 'Soddisfazione complessiva',
    description: 'Quanto sei soddisfatto del protocollo nel complesso?',
    icon: Star,
    color: 'text-yellow-500'
  }
];

export const ProtocolRatingModal: React.FC<ProtocolRatingModalProps> = ({
  isOpen,
  onClose,
  protocolId,
  protocolTitle,
  onRatingSubmitted
}) => {
  const [ratings, setRatings] = useState<Ratings>({
    effectiveness: 0,
    ease: 0,
    improvement: 0,
    satisfaction: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = (category: keyof Ratings, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [category]: rating
    }));
  };

  const handleSubmit = async () => {
    // Verifica che tutte le valutazioni siano state date
    const allRated = Object.values(ratings).every(rating => rating > 0);
    if (!allRated) {
      toast({
        title: "Valutazione incompleta",
        description: "Per favore valuta tutti gli aspetti del protocollo",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('protocol_ratings')
        .insert({
          protocol_id: protocolId,
          effectiveness_rating: ratings.effectiveness,
          ease_rating: ratings.ease,
          improvement_rating: ratings.improvement,
          overall_satisfaction: ratings.satisfaction
        });

      if (error) throw error;

      toast({
        title: "Valutazione salvata!",
        description: "Grazie per il tuo feedback prezioso",
        variant: "default"
      });

      onRatingSubmitted();
      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare la valutazione. Riprova.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (category: keyof Ratings) => {
    const currentRating = ratings[category];
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleStarClick(category, star)}
            className={`transition-colors duration-200 ${
              star <= currentRating 
                ? 'text-yellow-400 hover:text-yellow-500' 
                : 'text-muted-foreground hover:text-yellow-300'
            }`}
          >
            <Star 
              className="h-6 w-6" 
              fill={star <= currentRating ? 'currentColor' : 'none'} 
            />
          </button>
        ))}
      </div>
    );
  };

  const isAllRated = Object.values(ratings).every(rating => rating > 0);
  const averageRating = Object.values(ratings).reduce((sum, rating) => sum + rating, 0) / 4;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            🎉 Protocollo Completato!
          </DialogTitle>
          <p className="text-center text-muted-foreground mt-2">
            Hai completato con successo: <span className="font-semibold">{protocolTitle}</span>
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">
              La tua valutazione aiuterà altri utenti! 
            </p>
            <p className="text-muted-foreground">
              Valuta ogni aspetto del protocollo da 1 a 5 stelle
            </p>
          </div>

          <div className="space-y-4">
            {ratingCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.key} className="p-4">
                  <CardContent className="p-0">
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-1 ${category.color}`} />
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{category.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {category.description}
                        </p>
                        <div className="flex items-center gap-2">
                          {renderStars(category.key)}
                          <span className="text-sm text-muted-foreground ml-2">
                            {ratings[category.key] > 0 ? `${ratings[category.key]}/5` : 'Non valutato'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {isAllRated && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" fill="currentColor" />
                <p className="font-medium">
                  Valutazione media: {averageRating.toFixed(1)}/5 stelle
                </p>
                <p className="text-sm text-muted-foreground">
                  Equivale a un tasso di successo del {Math.round(averageRating * 20)}%
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Annulla
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isAllRated || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Salvando...' : 'Conferma valutazione'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};