import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { startOfMonth } from 'date-fns';

interface ReferralData {
  id: string;
  referred_email: string;
  referred_user_id?: string;
  status: string;
  created_at: string;
  converted_at?: string;
  is_active?: boolean;
}

interface CreditTransaction {
  id: string;
  commission_type: string;
  amount: number;
  tier: string;
  status: string;
  created_at: string;
  billing_period_start?: string;
  billing_period_end?: string;
  is_cancelled?: boolean;
}

interface PerformanceSectionProps {
  referrals: ReferralData[];
  credits: CreditTransaction[];
}

export default function PerformanceSection({ referrals, credits }: PerformanceSectionProps) {
  const [performanceFilter, setPerformanceFilter] = useState('month');
  
  // Funzione per filtrare i dati in base al periodo selezionato
  const getFilteredData = (filter: string) => {
    const now = new Date();
    let startDate: Date;
    
    switch (filter) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'total':
      default:
        startDate = new Date(0); // Tutti i dati
        break;
    }
    
    const filteredReferrals = filter === 'total' ? referrals : referrals.filter(r => 
      new Date(r.created_at) >= startDate
    );
    
    const filteredCredits = filter === 'total' ? credits : credits.filter(c => 
      new Date(c.created_at) >= startDate
    );
    
    return {
      registrations: filteredReferrals.length, // tutti gli utenti registrati
      pending: filteredReferrals.filter(r => r.status === 'registered').length, // utenti senza abbonamento
      subscriptions: filteredReferrals.filter(r => r.status === 'converted').length, // tutti gli utenti che hanno sottoscritto
      cancelled: filteredReferrals.filter(r => r.status === 'cancelled').length, // abbonamenti annullati
      credits: filteredCredits.reduce((sum, c) => sum + c.amount, 0) // tutti i crediti guadagnati
    };
  };
  
  const data = getFilteredData(performanceFilter);
  
  return (
    <div className="space-y-4">
      {/* Filtro periodo */}
      <div>
        <Label htmlFor="performance-filter">Periodo</Label>
        <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Seleziona periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Oggi</SelectItem>
            <SelectItem value="week">Questa settimana</SelectItem>
            <SelectItem value="month">Questo mese</SelectItem>
            <SelectItem value="year">Quest'anno</SelectItem>
            <SelectItem value="total">Totali</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Metriche */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Registrazioni</span>
          <span className="font-bold text-blue-600">{data.registrations}</span>
        </div>
        <div className="flex justify-between">
          <span>In attesa di pagamento</span>
          <span className="font-bold text-orange-500">{data.pending}</span>
        </div>
        <div className="flex justify-between">
          <span>Abbonamenti sottoscritti</span>
          <span className="font-bold text-green-600">{data.subscriptions}</span>
        </div>
        <div className="flex justify-between">
          <span>Abbonamenti Annullati</span>
          <span className="font-bold text-red-600">{data.cancelled}</span>
        </div>
        <div className="flex justify-between">
          <span>Crediti guadagnati</span>
          <span className="font-bold text-purple-600">€{data.credits.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}