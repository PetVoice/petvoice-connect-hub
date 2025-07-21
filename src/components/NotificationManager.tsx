import React from 'react';
import { useCalendarNotifications } from '@/hooks/useCalendarNotifications';
import { useCommunityNotifications } from '@/hooks/useCommunityNotifications';
import { useMedicationNotifications } from '@/hooks/useMedicationNotifications';
import { useReferralNotifications } from '@/hooks/useReferralNotifications';
import { usePrivateMessageNotifications } from '@/hooks/usePrivateMessageNotifications';

// Componente che gestisce tutte le notifiche automatiche dell'app
export function NotificationManager() {
  useCalendarNotifications();
  useCommunityNotifications();
  useMedicationNotifications();
  useReferralNotifications();
  usePrivateMessageNotifications();
  
  return null; // Questo componente non renderizza nulla
}