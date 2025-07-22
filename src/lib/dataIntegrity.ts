// Sistema di controllo integrità dati
import { supabase } from '@/integrations/supabase/client';
import logger from './logger';

interface DataConsistencyReport {
  isConsistent: boolean;
  issues: string[];
  recommendations: string[];
}

export class DataIntegrityService {
  
  // Verifica coerenza dati pet-analisi
  static async checkPetAnalysisConsistency(userId: string): Promise<DataConsistencyReport> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    try {
      // Verifica pet senza analisi recenti
      const { data: petsWithoutAnalysis } = await supabase
        .from('pets')
        .select(`
          id, name,
          pet_analyses!left(id, created_at)
        `)
        .eq('user_id', userId)
        .or('pet_analyses.created_at.is.null,pet_analyses.created_at.lt.' + 
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      if (petsWithoutAnalysis && petsWithoutAnalysis.length > 0) {
        issues.push(`${petsWithoutAnalysis.length} pet senza analisi recenti (ultimo mese)`);
        recommendations.push('Eseguire nuove analisi per mantenere il profilo emotivo aggiornato');
      }
      
      // Verifica analisi con confidenza molto bassa
      const { data: lowConfidenceAnalyses } = await supabase
        .from('pet_analyses')
        .select('id, primary_confidence, file_name')
        .eq('user_id', userId)
        .lt('primary_confidence', 0.5);
      
      if (lowConfidenceAnalyses && lowConfidenceAnalyses.length > 0) {
        issues.push(`${lowConfidenceAnalyses.length} analisi con confidenza molto bassa (<50%)`);
        recommendations.push('Rivedere le analisi a bassa confidenza e considerare di ripeterle');
      }
      
      // Verifica entry diario senza mood_score
      const { data: incompleteDiaryEntries } = await supabase
        .from('diary_entries')
        .select('id, entry_date')
        .eq('user_id', userId)
        .is('mood_score', null)
        .gte('entry_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      if (incompleteDiaryEntries && incompleteDiaryEntries.length > 0) {
        issues.push(`${incompleteDiaryEntries.length} entry del diario senza valutazione dell'umore`);
        recommendations.push('Completare le entry del diario con valutazioni dell\'umore per migliori insights');
      }
      
      return {
        isConsistent: issues.length === 0,
        issues,
        recommendations
      };
      
    } catch (error) {
      logger.error('Errore controllo integrità dati', error);
      return {
        isConsistent: false,
        issues: ['Errore durante il controllo integrità'],
        recommendations: ['Ripetere il controllo più tardi']
      };
    }
  }
  
  // Pulisce dati duplicati o obsoleti
  static async cleanupObsoleteData(userId: string): Promise<void> {
    try {
      // Rimuovi analisi troppo vecchie con bassa confidenza
      const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000);
      
      const { error: cleanupError } = await supabase
        .from('pet_analyses')
        .delete()
        .eq('user_id', userId)
        .lt('created_at', twoYearsAgo.toISOString())
        .lt('primary_confidence', 0.6);
        
      if (cleanupError) {
        logger.error('Errore pulizia dati obsoleti', cleanupError);
      } else {
        logger.info('Pulizia dati obsoleti completata');
      }
      
      // Rimuovi log attività molto vecchi (oltre 1 anno)
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      
      const { error: logCleanupError } = await supabase
        .from('activity_log')
        .delete()
        .eq('user_id', userId)
        .lt('created_at', oneYearAgo.toISOString());
        
      if (logCleanupError) {
        logger.error('Errore pulizia log attività', logCleanupError);
      }
      
    } catch (error) {
      logger.error('Errore generale pulizia dati', error);
    }
  }
  
  // Sincronizza dati inconsistenti
  static async syncInconsistentData(userId: string): Promise<void> {
    try {
      // Aggiorna wellness scores basati su dati diario più recenti
      const { data: pets } = await supabase
        .from('pets')
        .select('id')
        .eq('user_id', userId);
        
      if (pets) {
        for (const pet of pets) {
          // Triggera ricalcolo risk score
          const riskScore = await supabase.rpc('calculate_pet_risk_score', {
            p_pet_id: pet.id,
            p_user_id: userId
          });
          
          if (riskScore.error) {
            logger.warn(`Errore sync pet ${pet.id}`, riskScore.error);
          }
        }
      }
      
    } catch (error) {
      logger.error('Errore sincronizzazione dati', error);
    }
  }
  
  // Report completo integrità
  static async generateIntegrityReport(userId: string): Promise<DataConsistencyReport> {
    const report = await this.checkPetAnalysisConsistency(userId);
    
    // Aggiunge controlli addizionali
    try {
      // Verifica protocolli training abbandonati
      const { data: abandonedProtocols } = await supabase
        .from('ai_training_protocols')
        .select('id, title, last_activity_at')
        .eq('user_id', userId)
        .eq('status', 'in_progress')
        .lt('last_activity_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());
        
      if (abandonedProtocols && abandonedProtocols.length > 0) {
        report.issues.push(`${abandonedProtocols.length} protocolli di training abbandonati da più di 2 settimane`);
        report.recommendations.push('Riprendere o archiviare i protocolli di training inattivi');
      }
      
      // Verifica eventi calendario passati non completati
      const { data: outdatedEvents } = await supabase
        .from('calendar_events')
        .select('id, title, start_time')
        .eq('user_id', userId)
        .eq('status', 'scheduled')
        .lt('start_time', new Date().toISOString());
        
      if (outdatedEvents && outdatedEvents.length > 0) {
        report.issues.push(`${outdatedEvents.length} eventi calendario passati non marcati come completati`);
        report.recommendations.push('Aggiornare lo stato degli eventi calendario passati');
      }
      
    } catch (error) {
      logger.error('Errore controlli addizionali integrità', error);
    }
    
    report.isConsistent = report.issues.length === 0;
    return report;
  }
}