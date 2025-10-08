"use client";

import React, { useEffect } from "react";

import { useChatStore } from "../lib/store";

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const { initializeSession, currentSession } = useChatStore();

  // Initialize session on app load if no session exists
  useEffect(() => {
    if (!currentSession) {
      initializeSession();
    }
  }, [currentSession, initializeSession]);

  return <>{children}</>;
}
