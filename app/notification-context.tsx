import React, { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from 'react';

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  icon: string;
  read: boolean;
  actionLabel: string | null;
  route?: string;
};

interface NotificationsContextValue {
  notifications: NotificationItem[];
  markAsRead: (notificationId: string) => void;
  deleteNotification: (notificationId: string) => void;
  markAllAsRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

const initialNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'New Video Lesson Available',
    message: 'A new International Sign lesson is ready for you in Learn. Keep your progress moving.',
    timestamp: 'Just now',
    icon: 'ondemand-video',
    read: false,
    actionLabel: 'Open lesson',
    route: '/learn',
  },
  {
    id: '2',
    title: 'Welcome! Continue Learning',
    message: 'You\'ve completed 2 lessons. Continue where you left off to stay on track.',
    timestamp: '2 hours ago',
    icon: 'trending-up',
    read: false,
    actionLabel: 'Resume',
    route: '/learn',
  },
  {
    id: '3',
    title: 'Friend Started Learning',
    message: 'Sarah just started the Alphabet lesson. See what your friends are doing.',
    timestamp: '5 hours ago',
    icon: 'people',
    read: true,
    actionLabel: 'View activity',
    route: '/profile-activity',
  },
  {
    id: '4',
    title: 'Certificate Almost Complete',
    message: 'You\'re 80% done! Visit your progress dashboard to claim your certificate.',
    timestamp: '1 day ago',
    icon: 'emoji-events',
    read: true,
    actionLabel: 'View progress',
    route: '/profile-progress',
  },
  {
    id: '5',
    title: 'Module Quiz Available',
    message: 'The new quiz for Module 1 is now available. Test your knowledge now.',
    timestamp: '2 days ago',
    icon: 'quiz',
    read: true,
    actionLabel: 'Take quiz',
    route: '/lesson/quiz',
  },
];

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  }, []);

  const value = useMemo(
    () => ({ notifications, markAsRead, deleteNotification, markAllAsRead }),
    [notifications, markAsRead, deleteNotification, markAllAsRead]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = (): NotificationsContextValue => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
};
