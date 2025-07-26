import { v4 as uuidv4 } from "uuid";

import { jobDescription } from "../data/job-description";
import {
  ConversationSession,
  SessionStatus,
  CandidateProfile,
  JobDescription,
} from "./types";
import {
  validateSession,
  isSessionExpired,
  saveSessionToStorage,
  getSessionsFromStorage,
  markSessionAsCompleted,
  markSessionAsExpired,
  cleanupExpiredSessions,
  getSessionStats,
  exportSession,
  importSession,
} from "./session-utils";

// SESSION MANAGER CLASS
export class SessionManager {
  private sessions: Map<string, ConversationSession> = new Map();
  private readonly sessionExpiryHours: number = 7 * 24; // 7 days default

  constructor() {
    this.loadSessionsFromStorage();
  }

  // SESSION CREATION LOGIC
  /**
   * Create a new conversation session
   */
  createSession(
    candidateProfile?: Partial<CandidateProfile>,
    jobContext?: JobDescription
  ): ConversationSession {
    const sessionId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + this.sessionExpiryHours * 60 * 60 * 1000
    );

    const session: ConversationSession = {
      id: sessionId,
      messages: [],
      candidateProfile: {
        id: uuidv4(),
        name: undefined,
        email: undefined,
        phone: undefined,
        experience: {
          years: 0,
          months: 0,
          description: "",
        },
        skills: [],
        education: [],
        interests: [],
        availability: {
          startDate: undefined,
          noticePeriod: undefined,
          preferredSchedule: undefined,
        },
        salary: {
          expected: 0,
          currency: "USD",
          negotiable: true,
        },
        location: {
          current: "",
          willingToRelocate: false,
          preferredLocations: [],
        },
        confidence: 0,
        lastUpdated: now,
        ...candidateProfile,
      },
      jobContext: jobContext || jobDescription,
      status: SessionStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
      expiresAt,
    };

    this.sessions.set(sessionId, session);
    saveSessionToStorage(session);

    return session;
  }

  /**
   * Create session from existing data
   */
  createSessionFromData(
    sessionData: Partial<ConversationSession>
  ): ConversationSession {
    const sessionId = sessionData.id || uuidv4();
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + this.sessionExpiryHours * 60 * 60 * 1000
    );

    const session: ConversationSession = {
      id: sessionId,
      messages: sessionData.messages || [],
      candidateProfile: sessionData.candidateProfile || {
        id: uuidv4(),
        name: undefined,
        email: undefined,
        phone: undefined,
        experience: {
          years: 0,
          months: 0,
          description: "",
        },
        skills: [],
        education: [],
        interests: [],
        availability: {
          startDate: undefined,
          noticePeriod: undefined,
          preferredSchedule: undefined,
        },
        salary: {
          expected: 0,
          currency: "USD",
          negotiable: true,
        },
        location: {
          current: "",
          willingToRelocate: false,
          preferredLocations: [],
        },
        confidence: 0,
        lastUpdated: now,
      },
      jobContext: sessionData.jobContext || jobDescription,
      status: SessionStatus.ACTIVE,
      createdAt: sessionData.createdAt || now,
      updatedAt: now,
      expiresAt: sessionData.expiresAt || expiresAt,
    };

    this.sessions.set(sessionId, session);
    saveSessionToStorage(session);

    return session;
  }

  // ========================================================================
  // SESSION VALIDATION
  // ========================================================================

  /**
   * Validate session by ID
   */
  validateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    return validateSession(session);
  }

  /**
   * Validate all sessions and clean up expired ones
   */
  validateAllSessions(): void {
    const expiredSessions: string[] = [];

    this.sessions.forEach((session, sessionId) => {
      if (!validateSession(session)) {
        expiredSessions.push(sessionId);
      }
    });

    // Remove expired sessions
    expiredSessions.forEach((sessionId) => {
      this.sessions.delete(sessionId);
    });

    // Update storage
    this.saveAllSessionsToStorage();
  }

  /**
   * Check if session is expired
   */
  isSessionExpired(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return true;

    return isSessionExpired(session);
  }

  // ========================================================================
  // SESSION CLEANUP UTILITIES
  // ========================================================================

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): number {
    const expiredSessions: string[] = [];

    this.sessions.forEach((session, sessionId) => {
      if (isSessionExpired(session)) {
        expiredSessions.push(sessionId);
      }
    });

    // Remove expired sessions
    expiredSessions.forEach((sessionId) => {
      this.sessions.delete(sessionId);
    });

    // Update storage
    this.saveAllSessionsToStorage();

    return expiredSessions.length;
  }

  /**
   * Complete a session
   */
  completeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const completedSession = markSessionAsCompleted(session);
    this.sessions.set(sessionId, completedSession);
    saveSessionToStorage(completedSession);

    return true;
  }

  /**
   * Mark session as expired
   */
  markSessionAsExpired(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const expiredSession = markSessionAsExpired(session);
    this.sessions.set(sessionId, expiredSession);
    saveSessionToStorage(expiredSession);

    return true;
  }

  /**
   * Delete session completely
   */
  deleteSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      this.saveAllSessionsToStorage();
    }
    return deleted;
  }

  // ========================================================================
  // SESSION EXPIRATION HANDLING
  // ========================================================================

  /**
   * Handle session expiration
   */
  handleSessionExpiration(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    if (isSessionExpired(session)) {
      this.markSessionAsExpired(sessionId);
      return true;
    }

    return false;
  }

  /**
   * Extend session expiry
   */
  extendSession(sessionId: string, hours: number = 24): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const extendedSession = {
      ...session,
      expiresAt: new Date(session.expiresAt.getTime() + hours * 60 * 60 * 1000),
      updatedAt: new Date(),
    };

    this.sessions.set(sessionId, extendedSession);
    saveSessionToStorage(extendedSession);

    return true;
  }

  /**
   * Get session time remaining
   */
  getSessionTimeRemaining(sessionId: string): number {
    const session = this.sessions.get(sessionId);
    if (!session) return 0;

    const now = new Date();
    const timeRemaining = session.expiresAt.getTime() - now.getTime();
    return Math.max(0, timeRemaining);
  }

  // ========================================================================
  // SESSION RETRIEVAL
  // ========================================================================

  /**
   * Get session by ID
   */
  getSession(sessionId: string): ConversationSession | null {
    const session = this.sessions.get(sessionId);
    if (!session || !validateSession(session)) {
      return null;
    }
    return session;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): ConversationSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) =>
        session.status === SessionStatus.ACTIVE && validateSession(session)
    );
  }

  /**
   * Get all sessions
   */
  getAllSessions(): ConversationSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get session statistics
   */
  getSessionStatistics() {
    const sessions = this.getAllSessions();
    return getSessionStats(sessions);
  }

  // ========================================================================
  // SESSION PERSISTENCE
  // ========================================================================

  /**
   * Load sessions from storage
   */
  private loadSessionsFromStorage(): void {
    try {
      const sessions = getSessionsFromStorage();
      this.sessions.clear();

      sessions.forEach((session) => {
        if (validateSession(session)) {
          this.sessions.set(session.id, session);
        }
      });
    } catch (error) {
      console.error("Failed to load sessions from storage:", error);
    }
  }

  /**
   * Save all sessions to storage
   */
  private saveAllSessionsToStorage(): void {
    try {
      const sessions = Array.from(this.sessions.values());
      const validSessions = cleanupExpiredSessions(sessions);
      localStorage.setItem("chat-sessions", JSON.stringify(validSessions));
    } catch (error) {
      console.error("Failed to save sessions to storage:", error);
    }
  }

  /**
   * Clear all sessions
   */
  clearAllSessions(): void {
    this.sessions.clear();
    localStorage.removeItem("chat-sessions");
  }

  // ========================================================================
  // SESSION EXPORT/IMPORT
  // ========================================================================

  /**
   * Export session
   */
  exportSession(sessionId: string): string | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return exportSession(session);
  }

  /**
   * Import session
   */
  importSession(data: string): ConversationSession | null {
    const session = importSession(data);
    if (session) {
      this.sessions.set(session.id, session);
      saveSessionToStorage(session);
    }
    return session;
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Get session count
   */
  getSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Check if session exists
   */
  sessionExists(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  /**
   * Update session
   */
  updateSession(
    sessionId: string,
    updates: Partial<ConversationSession>
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const updatedSession = {
      ...session,
      ...updates,
      updatedAt: new Date(),
    };

    this.sessions.set(sessionId, updatedSession);
    saveSessionToStorage(updatedSession);

    return true;
  }

  /**
   * Get session age
   */
  getSessionAge(sessionId: string): string {
    const session = this.sessions.get(sessionId);
    if (!session) return "Unknown";

    const now = new Date();
    const ageInMs = now.getTime() - session.createdAt.getTime();
    const ageInMinutes = Math.floor(ageInMs / (1000 * 60));

    if (ageInMinutes < 1) return "Just now";
    if (ageInMinutes < 60) return `${ageInMinutes} minutes ago`;

    const ageInHours = Math.floor(ageInMinutes / 60);
    if (ageInHours < 24) return `${ageInHours} hours ago`;

    const ageInDays = Math.floor(ageInHours / 24);
    return `${ageInDays} days ago`;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const sessionManager = new SessionManager();
