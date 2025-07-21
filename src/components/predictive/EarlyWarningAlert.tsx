import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Info, X, CheckCircle } from 'lucide-react';

interface EarlyWarningAlertProps {
  warning: {
    id: string;
    warning_type: string;
    severity_level: 'low' | 'medium' | 'high' | 'critical';
    alert_message: string;
    pattern_detected: Record<string, any>;
    suggested_actions: string[];
    is_acknowledged: boolean;
    expires_at?: string;
    created_at: string;
  };
  onAcknowledge?: (warningId: string) => void;
  onDismiss?: (warningId: string) => void;
  className?: string;
}

export const EarlyWarningAlert: React.FC<EarlyWarningAlertProps> = ({
  warning,
  onAcknowledge,
  onDismiss,
  className = ""
}) => {
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-red-50 border-red-200 dark:bg-red-950',
          iconColor: 'text-red-600',
          badgeColor: 'bg-red-500 text-white'
        };
      case 'high':
        return {
          icon: AlertCircle,
          bgColor: 'bg-orange-50 border-orange-200 dark:bg-orange-950',
          iconColor: 'text-orange-600',
          badgeColor: 'bg-orange-500 text-white'
        };
      case 'medium':
        return {
          icon: AlertCircle,
          bgColor: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950',
          iconColor: 'text-yellow-600',
          badgeColor: 'bg-yellow-500 text-black'
        };
      case 'low':
        return {
          icon: Info,
          bgColor: 'bg-blue-50 border-blue-200 dark:bg-blue-950',
          iconColor: 'text-blue-600',
          badgeColor: 'bg-blue-500 text-white'
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-gray-50 border-gray-200',
          iconColor: 'text-gray-600',
          badgeColor: 'bg-gray-500 text-white'
        };
    }
  };

  const config = getSeverityConfig(warning.severity_level);
  const IconComponent = config.icon;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = warning.expires_at ? new Date(warning.expires_at) < new Date() : false;

  return (
    <Card className={`${className} ${config.bgColor} ${isExpired ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
            <div>
              <h3 className="font-semibold">{warning.warning_type}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(warning.created_at)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={config.badgeColor}>
              {warning.severity_level}
            </Badge>
            
            {warning.is_acknowledged && (
              <Badge variant="outline" className="text-emerald-600 bg-emerald-50">
                <CheckCircle className="h-3 w-3 mr-1" />
                Riconosciuto
              </Badge>
            )}
            
            {isExpired && (
              <Badge variant="outline" className="text-gray-500">
                Scaduto
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Alert Message */}
        <div className="space-y-2">
          <p className="text-sm font-medium">{warning.alert_message}</p>
        </div>

        {/* Pattern Details */}
        {warning.pattern_detected && Object.keys(warning.pattern_detected).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Pattern Rilevato</h4>
            <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-3 text-xs">
              <pre className="whitespace-pre-wrap text-muted-foreground">
                {JSON.stringify(warning.pattern_detected, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Suggested Actions */}
        {warning.suggested_actions && warning.suggested_actions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Azioni Consigliate</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {warning.suggested_actions.map((action, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Expiry Notice */}
        {warning.expires_at && !isExpired && (
          <div className="text-xs text-muted-foreground">
            Scade il: {formatDate(warning.expires_at)}
          </div>
        )}

        {/* Action Buttons */}
        {!warning.is_acknowledged && !isExpired && (
          <div className="flex gap-2 pt-4 border-t border-border/50">
            {onAcknowledge && (
              <Button 
                size="sm" 
                onClick={() => onAcknowledge(warning.id)}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Riconosci
              </Button>
            )}
            
            {onDismiss && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onDismiss(warning.id)}
              >
                <X className="h-4 w-4 mr-2" />
                Ignora
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};