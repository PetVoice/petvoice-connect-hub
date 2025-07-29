import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Trash2, 
  RotateCcw, 
  Database,
  TrendingUp,
  Shield
} from 'lucide-react';
import { DataIntegrityService } from '@/lib/dataIntegrity';
import { useAuth } from '@/contexts/AuthContext';
import { useUnifiedToast } from '@/hooks/use-unified-toast';
import logger from '@/lib/logger';

interface DataConsistencyReport {
  isConsistent: boolean;
  issues: string[];
  recommendations: string[];
}

const DataIntegrityDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showSuccessToast, showErrorToast } = useUnifiedToast();
  const [report, setReport] = useState<DataConsistencyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const generateReport = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const integrityReport = await DataIntegrityService.generateIntegrityReport(user.id);
      setReport(integrityReport);
      
      if (integrityReport.isConsistent) {
        showSuccessToast({
          title: "Successo",
          description: "Tutti i dati sono coerenti e aggiornati"
        });
      } else {
        showErrorToast({
          title: "Errore",
          description: "Problemi di integrità rilevati: {count}",
          variables: { count: integrityReport.issues.length.toString() }
        });
      }
    } catch (error) {
      logger.error('Errore generazione report integrità', error);
      showErrorToast({
        title: "Errore",
        description: "Impossibile generare il report di integrità"
      });
    } finally {
      setLoading(false);
    }
  };

  const cleanupData = async () => {
    if (!user) return;
    
    setCleaning(true);
    try {
      await DataIntegrityService.cleanupObsoleteData(user.id);
      showSuccessToast({
        title: "Successo",
        description: "Operazione completata"
      });
      // Rigenera report dopo pulizia
      await generateReport();
    } catch (error) {
      logger.error('Errore pulizia dati', error);
      showErrorToast({
        title: "Errore",
        description: "Operazione fallita"
      });
    } finally {
      setCleaning(false);
    }
  };

  const syncData = async () => {
    if (!user) return;
    
    setSyncing(true);
    try {
      await DataIntegrityService.syncInconsistentData(user.id);
      showSuccessToast({
        title: "Successo",
        description: "Operazione completata"
      });
      // Rigenera report dopo sync
      await generateReport();
    } catch (error) {
      logger.error('Errore sincronizzazione dati', error);
      showErrorToast({
        title: "Errore",
        description: "Operazione fallita"
      });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (user) {
      generateReport();
    }
  }, [user]);

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Accesso Richiesto</h3>
          <p className="text-muted-foreground">
            Effettua il login per accedere al dashboard di integrità dati
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Integrità Dati</h2>
          <p className="text-muted-foreground">
            Monitora e mantieni la coerenza dei tuoi dati
          </p>
        </div>
        <Button 
          onClick={generateReport} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Aggiorna Report
        </Button>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Stato Generale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {report ? (
              <>
                {report.isConsistent ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="font-semibold">Dati Integri</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="h-6 w-6" />
                    <span className="font-semibold">{report.issues.length} Problemi Rilevati</span>
                  </div>
                )}
                <Badge variant={report.isConsistent ? "default" : "destructive"}>
                  {report.isConsistent ? 'Ottimale' : 'Attenzione Richiesta'}
                </Badge>
              </>
            ) : (
              <div className="text-muted-foreground">
                Caricamento stato...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Issues and Recommendations */}
      {report && !report.isConsistent && (
        <>
          {/* Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                Problemi Rilevati
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.issues.map((issue, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                  <span className="text-sm">{issue}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <TrendingUp className="h-5 w-5" />
                Raccomandazioni
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Azioni di Manutenzione</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={cleanupData} 
              disabled={cleaning}
              variant="outline"
              className="flex items-center gap-2 justify-start p-6 h-auto"
            >
              <Trash2 className={`h-5 w-5 ${cleaning ? 'animate-pulse' : ''}`} />
              <div className="text-left">
                <div className="font-semibold">Pulizia Dati</div>
                <div className="text-sm text-muted-foreground">
                  Rimuovi dati obsoleti e duplicati
                </div>
              </div>
            </Button>

            <Button 
              onClick={syncData} 
              disabled={syncing}
              variant="outline"
              className="flex items-center gap-2 justify-start p-6 h-auto"
            >
              <RotateCcw className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
              <div className="text-left">
                <div className="font-semibold">Sincronizza Dati</div>
                <div className="text-sm text-muted-foreground">
                  Correggi inconsistenze nei dati
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Success State */}
      {report && report.isConsistent && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-semibold text-green-700 mb-2">
              Tutto Perfetto!
            </h3>
            <p className="text-green-600 mb-4">
              I tuoi dati sono coerenti e aggiornati. Non sono necessarie azioni.
            </p>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              Sistema Ottimizzato
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataIntegrityDashboard;