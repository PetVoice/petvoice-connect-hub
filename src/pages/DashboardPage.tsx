import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  PawPrint, 
  Microscope, 
  Calendar, 
  BarChart3,
  Plus,
  TrendingUp,
  Activity,
  Brain
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { pets, selectedPet } = usePets();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const quickActions = [
    {
      title: t('navigation.analysis'),
      description: t('dashboard.analysisDesc'),
      icon: Microscope,
      onClick: () => navigate('/analysis'),
      color: 'from-primary to-primary/80'
    },
    {
      title: t('navigation.diary'),
      description: t('dashboard.diaryDesc'),
      icon: PawPrint,
      onClick: () => navigate('/diary'),
      color: 'from-primary/80 to-primary/60'
    },
    {
      title: t('navigation.calendar'),
      description: t('dashboard.calendarDesc'),
      icon: Calendar,
      onClick: () => navigate('/calendar'),
      color: 'from-primary/60 to-primary/40'
    }
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {t('dashboard.welcome')}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('dashboard.welcomeDesc')}
        </p>
      </div>

      {/* Selected Pet Info */}
      {selectedPet && (
        <Card className="bg-gradient-subtle border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <span className="text-2xl">
                  {selectedPet.type?.toLowerCase().includes('cane') ? '🐕' : 
                   selectedPet.type?.toLowerCase().includes('gatto') ? '🐱' : '🐾'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl">{selectedPet.name}</h2>
                <p className="text-muted-foreground">
                  {(() => {
                    const typeMap: { [key: string]: string } = {
                      'Cane': 'dog',
                      'Gatto': 'cat',
                      'Uccello': 'bird',
                      'Pesce': 'fish',
                      'Rettile': 'reptile',
                      'Criceto': 'hamster',
                      'Coniglio': 'rabbit'
                    };
                    const translationKey = typeMap[selectedPet.type] || selectedPet.type?.toLowerCase();
                    return t(`pets.types.${translationKey}`) || selectedPet.type;
                  })()}
                  {selectedPet.breed && ` - ${selectedPet.breed}`}
                  {selectedPet.birth_date && ` - ${Math.floor((new Date().getTime() - new Date(selectedPet.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} ${t('pets.petCard.years')}`}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-foreground" />
            {t('dashboard.quickActions')}
          </CardTitle>
          <CardDescription>
            {t('dashboard.quickActionsDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 hover:shadow-elegant transition-all"
                onClick={action.onClick}
              >
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                  <action.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">{t('dashboard.registeredPets')}</CardTitle>
            <PawPrint className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pets.length}</div>
            <p className="text-xs text-muted-foreground">
              {pets.length === 1 ? 
                `1 ${t('dashboard.petInFamily')}` : 
                `${pets.length} ${t('dashboard.petsInFamily')}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">{t('dashboard.healthStatus')}</CardTitle>
            <Heart className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{t('dashboard.healthExcellent')}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.allPetsHealthy')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">{t('dashboard.moodTrend')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">+15%</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.improvementThisWeek')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      {pets.length === 0 && (
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <PawPrint className="h-6 w-6 text-foreground" />
            </div>
            <CardTitle>{t('pets.noPets')}</CardTitle>
            <CardDescription>
              {t('pets.noPetsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => {
                console.log('Navigating to pets page with add=true');
                navigate('/pets?add=true');
              }} 
              data-guide="pet-selector"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('pets.addNew')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;