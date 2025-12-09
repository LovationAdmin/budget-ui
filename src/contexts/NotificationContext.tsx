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
  // Store the last known update time for each budget to compare against
  const [lastKnownUpdates, setLastKnownUpdates] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;

    const checkUpdates = async () => {
      try {
        // 1. Get list of all budgets
        const listRes = await budgetAPI.list();
        const budgets = listRes.data;

        for (const budget of budgets) {
          // 2. Skip if we already have an unread notification for this budget
          // (User requirement: "once a change is detected, no need check again until the notif is read")
          const hasUnread = notifications.some(n => n.budgetId === budget.id && !n.isRead);
          if (hasUnread) continue;

          // 3. Check if the budget was updated recently
          // We assume budget.updated_at comes from the DB. 
          // However, to get the specific "Updated By Member X", we need the JSON data.
          // Optimization: Only fetch data if the DB timestamp is newer than what we know.
          
          const localLastUpdate = lastKnownUpdates[budget.id];
          
          // Initial load: just store the timestamp, don't notify
          if (!localLastUpdate) {
            setLastKnownUpdates(prev => ({ ...prev, [budget.id]: budget.created_at })); // Use created_at or fetch actual data if needed
            continue;
          }

          // If simple comparison isn't enough (because DB updated_at might change on metadata updates),
          // we fetch the data head. 
          try {
            const dataRes = await budgetAPI.getData(budget.id);
            const rawData: RawBudgetData = dataRes.data.data;
            
            // Check if the internal JSON timestamp is newer than our local knowledge
            if (rawData.lastUpdated && rawData.lastUpdated > localLastUpdate) {
                
                // Don't notify if I am the one who updated it
                // (We need to store updatedBy in the JSON blob, see BudgetComplete update)
                // @ts-ignore - Assuming updatedBy was added to JSON in BudgetComplete
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

                    setNotifications(prev => [newNotification, ...prev]);
                }

                // Update local tracker
                setLastKnownUpdates(prev => ({ ...prev, [budget.id]: rawData.lastUpdated || new Date().toISOString() }));
            }
          } catch (err) {
            console.error("Failed to check specific budget data", err);
          }
        }
      } catch (error) {
        console.error("Notification polling failed", error);
      }
    };

    // Initial check
    checkUpdates();

    // Poll
    const interval = setInterval(checkUpdates, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [user, notifications, lastKnownUpdates]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};