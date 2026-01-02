"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell } from "lucide-react";

interface InAppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
}

export function InAppNotificationContainer() {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);

  useEffect(() => {
    const handleNewNotification = (event: CustomEvent) => {
      const notification = event.detail as InAppNotification;
      setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep max 5 visible
    };

    const handleRemovedNotification = (event: CustomEvent) => {
      const { id } = event.detail;
      setNotifications(prev => prev.filter(n => n.id !== id));
    };

    window.addEventListener('in-app-notification', handleNewNotification as EventListener);
    window.addEventListener('in-app-notification-removed', handleRemovedNotification as EventListener);

    return () => {
      window.removeEventListener('in-app-notification', handleNewNotification as EventListener);
      window.removeEventListener('in-app-notification-removed', handleRemovedNotification as EventListener);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="pointer-events-auto"
          >
            <div className="bg-zinc-900 border border-white/10 rounded-lg shadow-lg p-4 min-w-[300px] max-w-[400px] backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-1">
                  <Bell size={20} className="text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-zinc-100 text-2xl truncate">
                    {notification.title}
                  </h4>
                  <p className="text-zinc-200 font-offbit text-sm mt-1 line-clamp-2">
                    {notification.body}
                  </p>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
                >
                  <X size={18} className="text-zinc-500 hover:text-zinc-300" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
