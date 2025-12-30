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
  
  // CRITICAL FIX: Use useRef instead of useState for the socket instance
  const wsRef = useRef<WebSocket | null>(null);
  const currentBudgetIdRef = useRef<string | null>(null);

  const connectToBudget = useCallback((budgetId: string, budgetName: string) => {
    // 1. Prevent connecting if already connected to the same budget
    if (wsRef.current?.readyState === WebSocket.OPEN && currentBudgetIdRef.current === budgetId) {
      console.log(`⚡ [Notifications] Already connected to budget ${budgetId}`);
      return;
    }

    // 2. Close existing connection if switching budgets
    if (wsRef.current) {
      wsRef.current.close();
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
    // Handle both http/https to ws/wss conversion
    const wsProtocol = API_URL.startsWith('https') ? 'wss' : 'ws';
    const wsBaseUrl = API_URL.replace(/^https?/, wsProtocol);
    
    try {
      console.log(`🔌 [Notifications] Connecting to ${wsBaseUrl}/ws/budgets/${budgetId}...`);
      const ws = new WebSocket(`${wsBaseUrl}/ws/budgets/${budgetId}`);
      
      ws.onopen = () => {
        console.log(`✅ [Notifications] WebSocket Connected`);
        setIsConnected(true);
        currentBudgetIdRef.current = budgetId;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Ignore our own updates
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
          console.error('❌ [Notifications] Parse error:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ [Notifications] WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('🔌 [Notifications] WebSocket Closed');
        setIsConnected(false);
        currentBudgetIdRef.current = null;
        wsRef.current = null;
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('❌ [Notifications] Connection failed:', error);
    }
  }, [user?.name]); 

  const disconnectFromBudget = useCallback(() => {
    if (wsRef.current) {
      console.log('🔌 [Notifications] Manual disconnect');
      wsRef.current.close();
      wsRef.current = null;
      currentBudgetIdRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
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
      notifications, 
      unreadCount, 
      markAsRead, 
      markAllAsRead,
      connectToBudget,
      disconnectFromBudget,
      isConnected
    }}>
      {children}
    </NotificationContext.Provider>
  );
};