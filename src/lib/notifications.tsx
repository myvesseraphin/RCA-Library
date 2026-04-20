import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, type NotificationItem } from './api';
import { useAuth } from './auth';

type NotificationsContextValue = {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    setIsLoading(true);

    try {
      const items = await api.getNotifications();
      setNotifications(items);
    } catch {
      setNotifications((current) => current);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthLoading) {
      return undefined;
    }

    if (!user) {
      setNotifications([]);
      return undefined;
    }

    void refresh();

    const interval = window.setInterval(() => {
      void refresh();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [isAuthLoading, refresh, user]);

  const markRead = useCallback(async (id: number) => {
    const updated = await api.markNotificationRead(id);
    setNotifications((current) => current.map((item) => item.id === id ? updated : item));
  }, []);

  const markAllRead = useCallback(async () => {
    await api.markAllNotificationsRead();
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
  }, []);

  const value = useMemo<NotificationsContextValue>(() => ({
    notifications,
    unreadCount: notifications.filter((item) => !item.isRead).length,
    isLoading,
    refresh,
    markRead,
    markAllRead,
  }), [isLoading, markAllRead, markRead, notifications, refresh]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider.');
  }

  return context;
}
