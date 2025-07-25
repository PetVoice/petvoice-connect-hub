import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface WellnessTrendChartProps {
  petId: string;
  userId: string;
}

const WellnessTrendChart: React.FC<WellnessTrendChartProps> = ({ petId, userId }) => {
  console.log('WellnessTrendChart: COMPONENT IS RENDERING!', { petId, userId });
  
  return (
    <Card className="bg-gradient-to-br from-card to-muted/20 border-2 hover:shadow-xl transition-all duration-500">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          🚀 GRAFICO DI TEST - FUNZIONA! 🚀
        </CardTitle>
        <CardDescription>
          Grafico temporaneo per verificare che il componente si carichi correttamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-8 bg-primary/10 rounded-lg text-center">
          <h3 className="text-lg font-bold">✅ COMPONENTE CARICATO CORRETTAMENTE!</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Pet ID: {petId}<br/>
            User ID: {userId}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WellnessTrendChart;