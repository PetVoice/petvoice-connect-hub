import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Construction, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  icon,
  features
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-coral flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>

      <Card className="petvoice-card text-center py-12">
        <CardHeader>
          <div className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center mx-auto mb-4">
            <Construction className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Sezione in Costruzione</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Questa sezione è in fase di sviluppo. Presto potrai utilizzare tutte le funzionalità!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-4 border rounded-lg">
                <Badge variant="outline" className="bg-coral/10 text-coral border-coral">
                  Presto
                </Badge>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaceholderPage;