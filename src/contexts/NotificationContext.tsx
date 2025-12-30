// src/contexts/NotificationContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { BulkAnalyzeResponse } from '../services/api';

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
  // NEW: Subscribe to market suggestions results
  onSuggestionsReady: (callback: (data: BulkAnalyzeResponse) => void) => () => void;
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
  
  const wsRef = useRef<WebSocket | null>(null);
  const currentBudgetIdRef = useRef<string | null>(null);
  
  // NEW: Store callbacks for market suggestions
  const suggestionsCallbacksRef = useRef<Set<(data: BulkAnalyzeResponse) => void>>(new Set());

  const connectToBudget = useCallback((budgetId: string, budgetName: string) => {
    // Prevent connecting if already connected to the same budget
    if (wsRef.current?.readyState === WebSocket.OPEN && currentBudgetIdRef.current === budgetId) {
      console.log(`⚡ [Notifications] Already connected to budget ${budgetId}`);
      return;
    }

    // Close existing connection if switching budgets
    if (wsRef.current) {
      wsRef.current.close();
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
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
          
          // Handle different message types
          switch (message.type) {
            case 'budget_updated':
              // Ignore our own updates
              if (message.user !== user?.name) {
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
              break;

            case 'suggestions_ready':
              // NEW: Notify all subscribers that suggestions are ready
              console.log('📊 [Notifications] Market suggestions ready:', message.data);
              suggestionsCallbacksRef.current.forEach(callback => {
                try {
                  callback(message.data);
                } catch (error) {
                  console.error('Error in suggestions callback:', error);
                }
              });
              break;

            default:
              console.log('📨 [Notifications] Unknown message type:', message.type);
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

  // NEW: Subscribe to market suggestions
  const onSuggestionsReady = useCallback((callback: (data: BulkAnalyzeResponse) => void) => {
    suggestionsCallbacksRef.current.add(callback);
    console.log('📊 [Notifications] Subscribed to suggestions updates');
    
    // Return cleanup function
    return () => {
      suggestionsCallbacksRef.current.delete(callback);
      console.log('📊 [Notifications] Unsubscribed from suggestions updates');
    };
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
      isConnected,
      onSuggestionsReady,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};