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

type MessageCallback = (data: any) => void;

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  connectToBudget: (budgetId: string, budgetName: string) => void;
  disconnectFromBudget: () => void;
  isConnected: boolean;
  // 🔥 NEW: Subscribe to specific message types
  onSuggestionsReady: (callback: MessageCallback) => () => void;
  /** Called when ANOTHER member saved the budget currently connected. */
  onBudgetUpdated: (callback: (info: { budgetId: string; user: string }) => void) => () => void;
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
  
  // 🔥 NEW: Pub/Sub system for message types
  const suggestionsCallbacksRef = useRef<Set<MessageCallback>>(new Set());
  const budgetUpdatedCallbacksRef = useRef<Set<(info: { budgetId: string; user: string }) => void>>(new Set());

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
          
          // 🔥 FIXED: Handle different message types
          if (message.type === 'budget_updated') {
            // 🔥 PROTECTION 1: Ne pas notifier l'utilisateur qui a fait la modification
            if (message.user === user?.name) {
              console.log('🚫 [Notifications] Ignoring own update');
              return;
            }

            // Let the open budget refresh itself (it decides whether it is safe).
            budgetUpdatedCallbacksRef.current.forEach((callback) => {
              try {
                callback({ budgetId, user: message.user || 'Un membre' });
              } catch (err) {
                console.error('❌ [Notifications] Callback error:', err);
              }
            });

            // 🔥 PROTECTION 2: Déduplication - Garder seulement la notification la plus récente
            setNotifications(prev => {
              // Chercher une notification récente (< 5 secondes) pour le même utilisateur sur ce budget
              const recentNotification = prev.find(n => 
                n.budgetId === budgetId && 
                n.updatedBy === message.user &&
                (Date.now() - new Date(n.timestamp).getTime()) < 5000 // 5 secondes
              );

              if (recentNotification) {
                console.log('🔄 [Notifications] Updating existing notification timestamp');
                // Mettre à jour seulement le timestamp
                return prev.map(n => 
                  n.id === recentNotification.id 
                    ? { ...n, timestamp: new Date().toISOString(), isRead: false }
                    : n
                );
              }

              // Créer une nouvelle notification
              const newNotification: Notification = {
                id: `${Date.now()}-${budgetId}`,
                budgetId,
                budgetName,
                updatedBy: message.user || 'Un membre',
                timestamp: new Date().toISOString(),
                isRead: false
              };
              
              console.log('📬 [Notifications] New notification from:', message.user);
              return [newNotification, ...prev];
            });
          } 
          else if (message.type === 'suggestions_ready') {
            console.log('📊 [Notifications] Market suggestions ready:', message.data);
            // Notify all subscribers
            suggestionsCallbacksRef.current.forEach(callback => {
              try {
                callback(message.data);
              } catch (err) {
                console.error('❌ [Notifications] Callback error:', err);
              }
            });
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

  // 🔥 NEW: Subscribe to suggestions_ready messages
  const onSuggestionsReady = useCallback((callback: MessageCallback) => {
    console.log('📊 [Notifications] Subscribed to suggestions updates');
    suggestionsCallbacksRef.current.add(callback);
    
    // Return unsubscribe function
    return () => {
      console.log('📊 [Notifications] Unsubscribed from suggestions updates');
      suggestionsCallbacksRef.current.delete(callback);
    };
  }, []);

  const onBudgetUpdated = useCallback((callback: (info: { budgetId: string; user: string }) => void) => {
    budgetUpdatedCallbacksRef.current.add(callback);
    return () => {
      budgetUpdatedCallbacksRef.current.delete(callback);
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
      onSuggestionsReady, // 🔥 NEW
      onBudgetUpdated,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};