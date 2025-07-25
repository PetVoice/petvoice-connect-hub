import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  action_url?: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Carica le notifiche dal localStorage (per ora, poi implementeremo database)
      const stored = localStorage.getItem(`notifications-${user.id}`);
      let loadedNotifications: Notification[] = [];
      
      if (stored) {
        loadedNotifications = JSON.parse(stored);
      }
      // Non creiamo più notifiche fake - solo notifiche reali
      
      setNotifications(loadedNotifications);
      setUnreadCount(loadedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Errore nel caricamento delle notifiche:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    if (!user) return;
    
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      localStorage.setItem(`notifications-${user.id}`, JSON.stringify(updated));
      return updated;
    });
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    if (!user) return;
    
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem(`notifications-${user.id}`, JSON.stringify(updated));
      return updated;
    });
    
    setUnreadCount(0);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    if (!user) return;
    
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, 50); // Mantieni solo le ultime 50
      localStorage.setItem(`notifications-${user.id}`, JSON.stringify(updated));
      return updated;
    });
    
    if (!newNotification.read) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const clearAllNotifications = () => {
    if (!user) return;
    
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem(`notifications-${user.id}`);
  };

  useEffect(() => {
    loadNotifications();
    
    // DISABILITO polling aggressivo che causa loop infiniti
    // const interval = setInterval(loadNotifications, 10000);
    // return () => clearInterval(interval);
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    addNotification,
    clearAllNotifications,
    reload: loadNotifications
  };
}