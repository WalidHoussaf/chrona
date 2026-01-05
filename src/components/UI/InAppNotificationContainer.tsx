"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

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
    // Container: Fixed Top Right
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
            <div className="group relative overflow-hidden bg-card/80 backdrop-blur-2xl border border-white/8 rounded-2xl shadow-2xl shadow-black/50">
              
              {/* Subtle Ambient Glow (Accent Color) */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 blur-[60px] rounded-full pointer-events-none opacity-100 transition-opacity duration-700" />
              
              <div className="relative p-5 pr-12">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-galgo text-4xl text-foreground tracking-wider">
                    {notification.title}
                  </h4>
                </div>

                {/* Body Section */}
                <p className="font-offbit text-muted/80 text-sm leading-relaxed tracking-wide">
                  {notification.body}
                </p>

                {/* Dismiss Button (Absolute positioned top-right) */}
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-muted/40 hover:text-foreground hover:bg-white/10 transition-all duration-300 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Animated Bottom Border/Progress Hint */}
              <div className="absolute bottom-0 left-0 h-[2px] w-full bg-linear-to-r from-transparent via-accent/50 to-transparent opacity-100 transition-opacity duration-500" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}