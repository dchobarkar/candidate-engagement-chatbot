import { ConversationSession, SessionStatus } from "./types";

// SESSION VALIDATION
export const validateSession = (session: ConversationSession): boolean => {
  if (!session) return false;

  // Check if session has expired
  if (session.expiresAt < new Date()) {
    return false;
  }

  // Check if session has required fields
  if (!session.id || !session.candidateProfile || !session.jobContext) {
    return false;
  }

  return true;
};

export const isSessionExpired = (session: ConversationSession): boolean => {
  return session.expiresAt < new Date();
};

export const getSessionTimeRemaining = (
  session: ConversationSession
): number => {
  const now = new Date();
  const timeRemaining = session.expiresAt.getTime() - now.getTime();
  return Math.max(0, timeRemaining);
};

// SESSION CLEANUP
export const cleanupExpiredSessions = (
  sessions: ConversationSession[]
): ConversationSession[] => {
  const now = new Date();
  return sessions.filter((session) => session.expiresAt > now);
};

export const markSessionAsCompleted = (
  session: ConversationSession
): ConversationSession => {
  return {
    ...session,
    status: SessionStatus.COMPLETED,
    updatedAt: new Date(),
  };
};

export const markSessionAsExpired = (
  session: ConversationSession
): ConversationSession => {
  return {
    ...session,
    status: SessionStatus.EXPIRED,
    updatedAt: new Date(),
  };
};

// SESSION UTILITIES
export const createSessionId = (): string => {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getSessionDuration = (session: ConversationSession): number => {
  const duration = session.updatedAt.getTime() - session.createdAt.getTime();
  return Math.floor(duration / 1000); // Return duration in seconds
};

export const getSessionAge = (session: ConversationSession): string => {
  const now = new Date();
  const ageInMs = now.getTime() - session.createdAt.getTime();
  const ageInMinutes = Math.floor(ageInMs / (1000 * 60));

  if (ageInMinutes < 1) return "Just now";
  if (ageInMinutes < 60) return `${ageInMinutes} minutes ago`;

  const ageInHours = Math.floor(ageInMinutes / 60);
  if (ageInHours < 24) return `${ageInHours} hours ago`;

  const ageInDays = Math.floor(ageInHours / 24);
  return `${ageInDays} days ago`;
};

// SESSION PERSISTENCE
export const saveSessionToStorage = (session: ConversationSession): void => {
  try {
    const sessions = getSessionsFromStorage();
    const existingIndex = sessions.findIndex((s) => s.id === session.id);

    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }

    // Clean up expired sessions before saving
    const validSessions = cleanupExpiredSessions(sessions);
    localStorage.setItem("chat-sessions", JSON.stringify(validSessions));
  } catch (error) {
    console.error("Failed to save session to storage:", error);
  }
};

export const getSessionsFromStorage = (): ConversationSession[] => {
  try {
    const sessionsData = localStorage.getItem("chat-sessions");
    if (!sessionsData) return [];

    const sessions = JSON.parse(sessionsData);
    return cleanupExpiredSessions(sessions);
  } catch (error) {
    console.error("Failed to get sessions from storage:", error);
    return [];
  }
};

export const clearSessionsFromStorage = (): void => {
  try {
    localStorage.removeItem("chat-sessions");
  } catch (error) {
    console.error("Failed to clear sessions from storage:", error);
  }
};

// SESSION ANALYTICS
export const getSessionStats = (sessions: ConversationSession[]) => {
  const now = new Date();
  const activeSessions = sessions.filter(
    (s) => s.status === SessionStatus.ACTIVE
  );
  const completedSessions = sessions.filter(
    (s) => s.status === SessionStatus.COMPLETED
  );
  const expiredSessions = sessions.filter(
    (s) => s.status === SessionStatus.EXPIRED
  );

  const totalDuration = sessions.reduce((total, session) => {
    return total + getSessionDuration(session);
  }, 0);

  const avgDuration = sessions.length > 0 ? totalDuration / sessions.length : 0;

  return {
    total: sessions.length,
    active: activeSessions.length,
    completed: completedSessions.length,
    expired: expiredSessions.length,
    averageDuration: avgDuration,
    oldestSession:
      sessions.length > 0
        ? Math.min(...sessions.map((s) => s.createdAt.getTime()))
        : null,
    newestSession:
      sessions.length > 0
        ? Math.max(...sessions.map((s) => s.createdAt.getTime()))
        : null,
  };
};

// SESSION EXPORT/IMPORT
export const exportSession = (session: ConversationSession): string => {
  const exportData = {
    session,
    exportDate: new Date().toISOString(),
    version: "1.0",
  };
  return JSON.stringify(exportData, null, 2);
};

export const importSession = (data: string): ConversationSession | null => {
  try {
    const importData = JSON.parse(data);
    const session = importData.session as ConversationSession;

    if (validateSession(session)) {
      return session;
    }

    return null;
  } catch (error) {
    console.error("Failed to import session:", error);
    return null;
  }
};
