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
      setNotifications((prev) => [notification, ...prev.slice(0, 4)]);
    };

    const handleRemovedNotification = (event: CustomEvent) => {
      const { id } = event.detail;
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    window.addEventListener("in-app-notification", handleNewNotification as EventListener);
    window.addEventListener("in-app-notification-removed", handleRemovedNotification as EventListener);

    return () => {
      window.removeEventListener("in-app-notification", handleNewNotification as EventListener);
      window.removeEventListener("in-app-notification-removed", handleRemovedNotification as EventListener);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)", transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto"
          >
            <div className="group relative overflow-hidden rounded-xl border border-accent/30 bg-card/50 backdrop-blur-sm shadow-lg">
              <div className="relative p-5 pr-12">
                {/* Header Section */}
                <div className="flex items-center gap-3 mb-2">
                  <Bell size={20} className="text-accent" />
                  <h4 className="font-galgo text-4xl text-foreground tracking-wider">
                    {notification.title}
                  </h4>
                </div>

                {/* Body Section */}
                <p className="font-offbit text-muted/80 text-lg leading-relaxed tracking-wide">
                  {notification.body}
                </p>

                {/* Dismiss Button */}
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-muted/40 hover:text-foreground hover:bg-white/10 transition-all duration-300 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}