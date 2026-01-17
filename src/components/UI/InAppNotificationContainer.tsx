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
    <div className="fixed z-50 flex flex-col pointer-events-none w-full top-2 left-0 px-3 gap-2 sm:top-6 sm:left-auto sm:right-6 sm:max-w-sm sm:px-0 sm:gap-3">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)", transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto w-full"
          >
            <div className={`
              group relative overflow-hidden transition-all duration-300 rounded-3xl bg-[#09090b]/95 border border-white/10 shadow-2xl shadow-black/50 backdrop-blur-md sm:rounded-xl sm:border-accent/30 sm:bg-card/50 sm:backdrop-blur-sm sm:shadow-lg `}>
              
              <div className="relative flex items-start gap-3 p-4 pr-10 sm:p-5 sm:pr-12 sm:block">
                
                {/* Icon Wrapper: Left aligned on mobile, Inline on desktop */}
                <div className="shrink-0 mt-1 sm:hidden">
                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                        <Bell size={16} className="text-accent" />
                    </div>
                </div>

                <div className="flex-1 min-w-0"> 
                  {/* Header Section */}
                  <div className="flex items-center gap-3 sm:mb-2">
                    {/* Desktop Icon (Hidden on mobile) */}
                    <Bell size={20} className="text-accent hidden sm:inline-flex" />
                    
                    <h4 className="font-galgo text-foreground tracking-wider truncate text-xl leading-none pt-1 sm:text-4xl sm:leading-normal sm:pt-0"
                    >
                      {notification.title}
                    </h4>
                  </div>

                  {/* Body Section */}
                  <p className="font-offbit text-muted/80 leading-relaxed tracking-wide line-clamp-2 sm:line-clamp-none text-xs mt-1 sm:text-lg sm:mt-0"
                  >
                    {notification.body}
                  </p>
                </div>

                {/* Dismiss Button */}
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="absolute p-1.5 rounded-full text-muted/40 hover:text-foreground hover:bg-white/10 transition-all duration-300 cursor-pointer top-3 right-3 sm:top-4 sm:right-4"
                >
                  <X size={18} className="sm:hidden" />
                  <X size={20} className="hidden sm:inline-flex" />
                </button>

              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}