"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineXMark } from "react-icons/hi2";

export type NotificationType = "success" | "error";

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 6 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 6000);
  }, []);

  const showSuccess = useCallback((message: string) => {
    showNotification(message, "success");
  }, [showNotification]);

  const showError = useCallback((message: string) => {
    showNotification(message, "error");
  }, [showNotification]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification, showSuccess, showError }}>
      {children}
      {/* Toast container overlay */}
      <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {notifications.map((n) => {
          const isSuccess = n.type === "success";
          return (
            <div
              key={n.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-slide-in-right ${
                isSuccess
                  ? "bg-emerald-50/95 border-emerald-100 text-emerald-800"
                  : "bg-red-50/95 border-red-100 text-red-800"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess ? (
                  <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
                ) : (
                  <HiOutlineXCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="flex-1 text-sm font-semibold leading-relaxed">
                {n.message}
              </div>
              <button
                type="button"
                onClick={() => removeNotification(n.id)}
                className={`shrink-0 p-1 rounded-lg transition-colors ${
                  isSuccess
                    ? "hover:bg-emerald-100 text-emerald-600 hover:text-emerald-800"
                    : "hover:bg-red-100 text-red-600 hover:text-red-800"
                }`}
                aria-label="Tutup"
              >
                <HiOutlineXMark className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
