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
// Translation system removed - Italian only

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { pets, selectedPet } = usePets();
  const navigate = useNavigate();
  // Translation system removed - Italian only

  const quickActions = [
    {
      title: 'Analisi',
      description: 'Analizza il comportamento del tuo pet',
      icon: Microscope,
      onClick: () => navigate('/analysis'),
      color: 'from-primary to-primary/80'
    },
    {
      title: 'Diario',
      description: 'Monitora la salute quotidiana',
      icon: PawPrint,
      onClick: () => navigate('/diary'),
      color: 'from-primary/80 to-primary/60'
    },
    {
      title: 'Calendario',
      description: 'Gestisci appuntamenti ed eventi',
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
          Benvenuto su PetVoice
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Gestisci la salute e il benessere dei tuoi compagni animali con l'intelligenza artificiale
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
                <h2 className="text-2xl">{selectedPet.name} - {selectedPet.type} - {selectedPet.breed} - {selectedPet.birth_date ? new Date().getFullYear() - new Date(selectedPet.birth_date).getFullYear() : '?'} anni</h2>
                <p className="text-muted-foreground">{selectedPet.type}</p>
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
            Azioni Rapide
          </CardTitle>
          <CardDescription>
            Accedi rapidamente alle funzionalità principali
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
            <CardTitle className="text-sm font-medium text-foreground">Pet Registrati</CardTitle>
            <PawPrint className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pets.length}</div>
            <p className="text-xs text-muted-foreground">
              {pets.length === 1 ? 
                '1 pet nella famiglia' : 
                `${pets.length} pet nella famiglia`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Stato Salute</CardTitle>
            <Heart className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Eccellente</div>
            <p className="text-xs text-muted-foreground">
              Tutti i pet sono in salute
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Trend Umore</CardTitle>
            <TrendingUp className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">+15%</div>
            <p className="text-xs text-muted-foreground">
              Miglioramento questa settimana
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
            <CardTitle>Nessun pet aggiunto</CardTitle>
            <CardDescription>
              Aggiungi il tuo primo pet per iniziare
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
              Aggiungi Pet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;