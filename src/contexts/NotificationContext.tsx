import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Check for updates every 60 seconds
const POLLING_INTERVAL = 60000;

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastKnownUpdates, setLastKnownUpdates] = useState<Record<string, string>>({});

  useEffect(() => {
    // SECURITY CHECK: Don't poll if no user
    if (!user || !user.id) return;

    const checkUpdates = async () => {
      try {
        const listRes = await budgetAPI.list();
        // SAFEGUARD: Ensure budgets is an array
        const budgets = Array.isArray(listRes.data) ? listRes.data : [];

        for (const budget of budgets) {
          // SAFEGUARD: Check if budget exists
          if (!budget || !budget.id) continue;

          const hasUnread = notifications.some(n => n.budgetId === budget.id && !n.isRead);
          if (hasUnread) continue;

          const localLastUpdate = lastKnownUpdates[budget.id];
          
          if (!localLastUpdate) {
            setLastKnownUpdates(prev => ({ ...prev, [budget.id]: budget.created_at }));
            continue;
          }

          try {
            const dataRes = await budgetAPI.getData(budget.id);
            // SAFEGUARD: Ensure data exists
            if (!dataRes || !dataRes.data || !dataRes.data.data) continue;

            const rawData: RawBudgetData = dataRes.data.data;
            
            if (rawData.lastUpdated && rawData.lastUpdated > localLastUpdate) {
                const updatedByName = rawData.updatedBy || "Un membre";
                
                if (updatedByName !== user.name) {
                    const newNotification: Notification = {
                        id: Date.now().toString() + budget.id,
                        budgetId: budget.id,
                        budgetName: budget.name,
                        updatedBy: updatedByName,
                        timestamp: new Date().toISOString(),
                        isRead: false
                    };

                    // SAFEGUARD: Ensure prev is iterable
                    setNotifications(prev => [newNotification, ...(Array.isArray(prev) ? prev : [])]);
                }

                setLastKnownUpdates(prev => ({ ...prev, [budget.id]: rawData.lastUpdated || new Date().toISOString() }));
            }
          } catch (err) {
            // Silent fail for individual budget check
            console.warn("Failed to check specific budget data", budget.id);
          }
        }
      } catch (error) {
        // Silent fail for polling loop
        console.warn("Notification polling failed", error);
      }
    };

    checkUpdates();
    const interval = setInterval(checkUpdates, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [user, notifications, lastKnownUpdates]); // Dependencies

  const markAsRead = (id: string) => {
    setNotifications(prev => (Array.isArray(prev) ? prev.map(n => n.id === id ? { ...n, isRead: true } : n) : []));
  };

  const markAllAsRead = () => {
    setNotifications(prev => (Array.isArray(prev) ? prev.map(n => ({ ...n, isRead: true })) : []));
  };

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};