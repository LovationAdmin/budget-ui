import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

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
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  // ✅ FIX: useRef stocke la connexion sans déclencher de re-render (brise la boucle)
  const wsRef = useRef<WebSocket | null>(null);
  const currentBudgetIdRef = useRef<string | null>(null);

  const connectToBudget = useCallback((budgetId: string, budgetName: string) => {
    // 1. Si déjà connecté au même budget, on ne fait rien
    if (wsRef.current?.readyState === WebSocket.OPEN && currentBudgetIdRef.current === budgetId) {
      return;
    }

    // 2. Fermer l'ancienne connexion
    if (wsRef.current) {
      wsRef.current.close();
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
    // Conversion http->ws et https->wss
    const wsProtocol = API_URL.startsWith('https') ? 'wss' : 'ws';
    const wsBaseUrl = API_URL.replace(/^https?/, wsProtocol);
    
    try {
      console.log(`🔌 Connexion WebSocket vers ${budgetId}...`);
      const ws = new WebSocket(`${wsBaseUrl}/ws/budgets/${budgetId}`);
      
      ws.onopen = () => {
        console.log(`✅ WebSocket Connecté`);
        setIsConnected(true);
        currentBudgetIdRef.current = budgetId;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Ignorer nos propres mises à jour
          if (message.type === 'budget_updated' && message.user !== user?.name) {
            const newNotification: Notification = {
              id: `${Date.now()}-${budgetId}`,
              budgetId,
              budgetName,
              updatedBy: message.user || 'Un membre',
              timestamp: new Date().toISOString(),
              isRead: false
            };
            setNotifications(prev => [newNotification, ...prev]);
          }
        } catch (error) {
          console.error('❌ Erreur parsing socket:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Erreur WebSocket:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket Fermé');
        setIsConnected(false);
        currentBudgetIdRef.current = null;
        wsRef.current = null;
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('❌ Echec connexion:', error);
    }
  }, [user?.name]); // Dépendance stable

  const disconnectFromBudget = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      currentBudgetIdRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Nettoyage final
  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{ 
      notifications, unreadCount, markAsRead, markAllAsRead,
      connectToBudget, disconnectFromBudget, isConnected
    }}>
      {children}
    </NotificationContext.Provider>
  );
};