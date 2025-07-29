import React from 'react';
import { useCalendarNotifications } from '@/hooks/useCalendarNotifications';
import { useCommunityNotifications } from '@/hooks/useCommunityNotifications';
import { useMedicationNotifications } from '@/hooks/useMedicationNotifications';
import { usePrivateMessageNotifications } from '@/hooks/usePrivateMessageNotifications';
import { useSupportTicketNotifications } from '@/hooks/useSupportTicketNotifications';
import { useSystemNotifications, useTrainingNotifications, useAnalysisNotifications, useSubscriptionNotifications } from '@/hooks/useSystemNotifications';

// Componente che gestisce tutte le notifiche automatiche dell'app
export function NotificationManager() {
  // Notifiche esistenti
  useCalendarNotifications();
  useCommunityNotifications();
  useMedicationNotifications();
  usePrivateMessageNotifications();
  useSupportTicketNotifications();
  
  // Nuove notifiche per coprire tutti gli eventi
  useSystemNotifications();
  useTrainingNotifications();
  useAnalysisNotifications();
  useSubscriptionNotifications();
  
  return null; // Questo componente non renderizza nulla
}