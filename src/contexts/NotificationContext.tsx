// src/contexts/NotificationContext.tsx - VERSION OPTIMISÉE
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { budgetAPI } from '../services/api';
import { useAuth } from './AuthContext';
import type { RawBudgetData } from '../utils/importConverter';

export interface Notification {
  id: string;
  budgetId: string;
  budgetName: string;
  updatedBy: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  connectToBudget: (budgetId: string, budgetName: string) => void;
  disconnectFromBudget: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// ============================================================================
// 🚀 VERSION OPTIMISÉE : WebSocket au lieu de polling
// ============================================================================

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeWebSocket, setActiveWebSocket] = useState<WebSocket | null>(null);
  const [connectedBudgetId, setConnectedBudgetId] = useState<string | null>(null);

  // ============================================================================
  // WebSocket Connection Management
  // ============================================================================

  const connectToBudget = useCallback((budgetId: string, budgetName: string) => {
    // Fermer la connexion existante si présente
    if (activeWebSocket) {
      activeWebSocket.close();
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
    const wsUrl = API_URL.replace(/^http/, 'ws');
    
    try {
      const ws = new WebSocket(`${wsUrl}/ws/budgets/${budgetId}`);
      
      ws.onopen = () => {
        console.log(`✅ [Notifications] WebSocket connecté au budget ${budgetId}`);
        setConnectedBudgetId(budgetId);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Ne créer une notification que si l'update vient d'un autre utilisateur
          if (message.type === 'budget_updated' && message.user !== user?.name) {
            const newNotification: Notification = {
              id: `${Date.now()}-${budgetId}`,
              budgetId,
              budgetName,
              updatedBy: message.user,
              timestamp: new Date().toISOString(),
              isRead: false
            };

            setNotifications(prev => [newNotification, ...prev]);
          }
        } catch (error) {
          console.error('❌ [Notifications] Erreur parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ [Notifications] WebSocket erreur:', error);
      };

      ws.onclose = () => {
        console.log('🔌 [Notifications] WebSocket fermé');
        setConnectedBudgetId(null);
      };

      setActiveWebSocket(ws);
    } catch (error) {
      console.error('❌ [Notifications] Erreur création WebSocket:', error);
    }
  }, [user, activeWebSocket]);

  const disconnectFromBudget = useCallback(() => {
    if (activeWebSocket) {
      activeWebSocket.close();
      setActiveWebSocket(null);
      setConnectedBudgetId(null);
    }
  }, [activeWebSocket]);

  // ============================================================================
  // Cleanup on unmount
  // ============================================================================

  useEffect(() => {
    return () => {
      if (activeWebSocket) {
        activeWebSocket.close();
      }
    };
  }, [activeWebSocket]);

  // ============================================================================
  // Notification Actions
  // ============================================================================

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      markAsRead, 
      markAllAsRead,
      connectToBudget,
      disconnectFromBudget
    }}>
      {children}
    </NotificationContext.Provider>
  );
};