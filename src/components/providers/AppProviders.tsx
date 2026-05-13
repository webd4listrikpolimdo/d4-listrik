"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </DataProvider>
  );
}
