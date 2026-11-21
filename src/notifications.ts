import { useState, useEffect } from "react";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  refCode?: string;
}

const NOTIFICATIONS_STORAGE_KEY = "sju_notifications_data";

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Item match detected: Casio fx-991EX calculator",
    description: "A surrendered article at Main Library matches your filed lost report.",
    timestamp: "12m ago",
    read: false,
    refCode: "LF-2041",
  },
  {
    id: "notif-2",
    title: "Claim verification underway: Apple MacBook Pro",
    description: "Intake officer is reviewing submitted custody proof in Vault 104.",
    timestamp: "2h ago",
    read: false,
    refCode: "LF-2040",
  },
  {
    id: "notif-3",
    title: "Custody pass issued: Brown leather wallet",
    description: "Ownership confirmed. Present pass at Central Library Desk 104.",
    timestamp: "Yesterday",
    read: false,
    refCode: "LF-2038",
  },
  {
    id: "notif-4",
    title: "Desk holiday operating schedule",
    description: "Central intake desk closes at 17:00 this Friday for reading recess.",
    timestamp: "2 days ago",
    read: true,
  },
];

const listeners = new Set<(items: NotificationItem[]) => void>();

function getStoredNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return initialNotifications;
    return JSON.parse(raw);
  } catch {
    return initialNotifications;
  }
}

function saveNotifications(items: NotificationItem[]) {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore quota issues
  }
  listeners.forEach((listener) => listener(items));
}

export const notificationsStore = {
  getNotifications(): NotificationItem[] {
    return getStoredNotifications();
  },

  getUnreadCount(): number {
    return getStoredNotifications().filter((n) => !n.read).length;
  },

  markAsRead(id: string): void {
    const current = getStoredNotifications();
    const updated = current.map((item) => (item.id === id ? { ...item, read: true } : item));
    saveNotifications(updated);
  },

  markAllAsRead(): void {
    const current = getStoredNotifications();
    const updated = current.map((item) => ({ ...item, read: true }));
    saveNotifications(updated);
  },

  addNotification(item: Omit<NotificationItem, "id" | "read" | "timestamp">): void {
    const current = getStoredNotifications();
    const newItem: NotificationItem = {
      ...item,
      id: "notif-" + Math.random().toString(36).substring(2, 9),
      read: false,
      timestamp: "Just now",
    };
    saveNotifications([newItem, ...current]);
  },

  subscribe(listener: (items: NotificationItem[]) => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useNotifications() {
  const [items, setItems] = useState<NotificationItem[]>(() => notificationsStore.getNotifications());

  useEffect(() => {
    return notificationsStore.subscribe((updated) => {
      setItems(updated);
    });
  }, []);

  const unreadCount = items.filter((n) => !n.read).length;

  return {
    notifications: items,
    unreadCount,
    markAsRead: (id: string) => notificationsStore.markAsRead(id),
    markAllAsRead: () => notificationsStore.markAllAsRead(),
    addNotification: (item: Omit<NotificationItem, "id" | "read" | "timestamp">) =>
      notificationsStore.addNotification(item),
  };
}
