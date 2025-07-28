import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PetMatchingIntelligence } from '@/components/ai-features/PetMatchingIntelligence';
import { usePetMatching } from '@/hooks/usePetMatching';
import { Network, Heart, Users, TrendingUp, Star } from 'lucide-react';

const PetMatchingPage: React.FC = () => {
  const { data: matchingData, isLoading } = usePetMatching();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Network className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold gradient-text">Pet Matching Intelligence</h1>
          <p className="text-muted-foreground mt-1">
            Trova pet simili, mentori esperti e modelli di successo nella community
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-sky-50/80 to-azure-50/60 border-azure-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Heart className="h-4 w-4 text-azure" />
              Pet Gemelli
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-azure">
              {isLoading ? '...' : matchingData?.petTwins || 0}
            </div>
            <p className="text-xs text-muted-foreground">match comportamentali</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50/80 to-green-50/60 border-emerald-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-500" />
              Mentori Attivi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {isLoading ? '...' : matchingData?.mentorsActive || 0}
            </div>
            <p className="text-xs text-muted-foreground">proprietari esperti</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50/80 to-amber-50/60 border-orange-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              Progressi Similari
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {isLoading ? '...' : `${matchingData?.averageImprovement || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">miglioramento medio</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50/80 to-violet-50/60 border-purple-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4 text-purple-500" />
              Successi Condivisi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {isLoading ? '...' : matchingData?.successStories || 0}
            </div>
            <p className="text-xs text-muted-foreground">casi di successo</p>
          </CardContent>
        </Card>
      </div>

      {/* Pet Matching Intelligence Component */}
      <PetMatchingIntelligence />
    </div>
  );
};

export default PetMatchingPage;