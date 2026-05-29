"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { NotificationProvider } from "@/context/NotificationContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <DataProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </DataProvider>
    </NotificationProvider>
  );
}
