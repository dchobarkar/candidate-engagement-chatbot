import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

import { jobDescription } from "../data/job-description";
import { sessionManager } from "./session-manager";
import {
  ChatMessage,
  CandidateProfile,
  ConversationSession,
  ApiError,
  MessageRole,
  ChatState,
  ChatActions,
} from "./types";
import {
  validateSession,
  isSessionExpired,
  saveSessionToStorage,
  markSessionAsCompleted,
  markSessionAsExpired,
} from "./session-utils";

// STORE INTERFACE
interface ChatStore extends ChatState, ChatActions {
  // Additional store-specific methods
  initializeSession: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  clearConversation: () => void;
  exportConversation: () => string;
  importConversation: (data: string) => void;
  completeSession: () => void;
  validateCurrentSession: () => boolean;
}

// INITIAL STATE
const initialCandidateProfile: CandidateProfile = {
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
  lastUpdated: new Date(),
};

const initialError: ApiError = {
  code: "",
  message: "",
  details: undefined,
  timestamp: new Date(),
};

// STORE IMPLEMENTATION
export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // STATE
      messages: [],
      currentSession: null,
      isLoading: false,
      error: null,
      candidateProfile: initialCandidateProfile,
      jobContext: jobDescription,

      // ACTIONS
      // Message Management
      addMessage: (message: ChatMessage) => {
        set((state) => ({
          messages: [...state.messages, message],
          error: null, // Clear errors when new message is added
        }));

        // Save session to storage when message is added
        const currentSession = get().currentSession;
        if (currentSession) {
          const updatedSession = {
            ...currentSession,
            messages: [...get().messages, message],
            updatedAt: new Date(),
          };
          saveSessionToStorage(updatedSession);
        }
      },

      // Profile Management
      updateProfile: (profile: Partial<CandidateProfile>) => {
        set((state) => ({
          candidateProfile: {
            ...state.candidateProfile,
            ...profile,
            lastUpdated: new Date(),
          },
        }));

        // Update session with new profile
        const currentSession = get().currentSession;
        if (currentSession) {
          const updatedSession = {
            ...currentSession,
            candidateProfile: {
              ...currentSession.candidateProfile,
              ...profile,
              lastUpdated: new Date(),
            },
            updatedAt: new Date(),
          };
          saveSessionToStorage(updatedSession);
        }
      },

      // Session Management
      setSession: (session: ConversationSession) => {
        if (validateSession(session)) {
          set({
            currentSession: session,
            messages: session.messages,
            candidateProfile: session.candidateProfile,
            jobContext: session.jobContext,
            error: null,
          });
          saveSessionToStorage(session);
        } else {
          set({
            error: {
              code: "INVALID_SESSION",
              message: "Session is invalid or expired",
              timestamp: new Date(),
            },
          });
        }
      },

      clearSession: () => {
        const currentSession = get().currentSession;
        if (currentSession) {
          // Mark session as completed before clearing
          const completedSession = markSessionAsCompleted(currentSession);
          saveSessionToStorage(completedSession);
        }

        set({
          currentSession: null,
          messages: [],
          candidateProfile: initialCandidateProfile,
          error: null,
        });
      },

      // Loading States
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Error Handling
      setError: (error: ApiError | null) => {
        set({ error });
      },

      // Reset Chat
      resetChat: () => {
        set({
          messages: [],
          currentSession: null,
          candidateProfile: initialCandidateProfile,
          error: null,
          isLoading: false,
        });
      },

      // ADVANCED ACTIONS
      // Initialize new session
      initializeSession: async () => {
        const { setLoading, setError, setSession } = get();

        try {
          setLoading(true);
          setError(null);

          // Check for existing valid session using SessionManager
          const activeSessions = sessionManager.getActiveSessions();
          const validSession = activeSessions.find(
            (session) => validateSession(session) && !isSessionExpired(session)
          );

          if (validSession) {
            setSession(validSession);
          } else {
            // Create new session using SessionManager
            const newSession = sessionManager.createSession();
            setSession(newSession);
          }
        } catch (error) {
          setError({
            code: "SESSION_INIT_ERROR",
            message: "Failed to initialize session",
            details: error,
            timestamp: new Date(),
          });
        } finally {
          setLoading(false);
        }
      },

      // Send message with API call
      sendMessage: async (content: string) => {
        const { addMessage, setLoading, setError, currentSession } = get();

        if (!currentSession) {
          setError({
            code: "NO_SESSION",
            message: "No active session found",
            timestamp: new Date(),
          });
          return;
        }

        // Validate session before sending message
        if (!validateSession(currentSession)) {
          setError({
            code: "SESSION_EXPIRED",
            message: "Session has expired",
            timestamp: new Date(),
          });
          return;
        }

        try {
          setLoading(true);
          setError(null);

          // Create user message
          const userMessage: ChatMessage = {
            id: uuidv4(),
            content,
            role: MessageRole.USER,
            timestamp: new Date(),
            sessionId: currentSession.id,
          };

          // Add user message to store
          addMessage(userMessage);

          // TODO: Make API call to process message
          // This will be implemented in Phase 4
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: content,
              sessionId: currentSession.id,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          // Create assistant message
          const assistantMessage: ChatMessage = {
            id: uuidv4(),
            content: data.message.content,
            role: MessageRole.ASSISTANT,
            timestamp: new Date(),
            sessionId: currentSession.id,
            metadata: {
              confidence: data.confidence,
              extractedInfo: data.extractedInfo,
            },
          };

          // Add assistant message to store
          addMessage(assistantMessage);

          // Update candidate profile if new information was extracted
          if (data.candidateProfile) {
            get().updateProfile(data.candidateProfile);
          }
        } catch (error) {
          setError({
            code: "MESSAGE_SEND_ERROR",
            message: "Failed to send message",
            details: error,
            timestamp: new Date(),
          });
        } finally {
          setLoading(false);
        }
      },

      // Retry last message
      retryLastMessage: async () => {
        const { messages, sendMessage } = get();
        const lastUserMessage = messages
          .filter((msg) => msg.role === MessageRole.USER)
          .pop();

        if (lastUserMessage) {
          // Remove the last assistant message if it exists
          set((state) => ({
            messages: state.messages.filter(
              (msg, index) =>
                !(
                  msg.role === MessageRole.ASSISTANT &&
                  index === state.messages.length - 1
                )
            ),
          }));

          // Resend the last user message
          await sendMessage(lastUserMessage.content);
        }
      },

      // Clear conversation
      clearConversation: () => {
        set({
          messages: [],
          error: null,
        });
      },

      // Export conversation
      exportConversation: () => {
        const { messages, candidateProfile, jobContext } = get();
        const exportData = {
          messages,
          candidateProfile,
          jobContext,
          exportDate: new Date().toISOString(),
        };
        return JSON.stringify(exportData, null, 2);
      },

      // Import conversation
      importConversation: (data: string) => {
        try {
          const importData = JSON.parse(data);
          set({
            messages: importData.messages || [],
            candidateProfile:
              importData.candidateProfile || initialCandidateProfile,
            jobContext: importData.jobContext || jobDescription,
            error: null,
          });
        } catch (error) {
          set({
            error: {
              code: "IMPORT_ERROR",
              message: "Failed to import conversation data",
              details: error,
              timestamp: new Date(),
            },
          });
        }
      },

      // Complete session
      completeSession: () => {
        const currentSession = get().currentSession;
        if (currentSession) {
          const completedSession = markSessionAsCompleted(currentSession);
          saveSessionToStorage(completedSession);
          set({ currentSession: completedSession });
        }
      },

      // Validate current session
      validateCurrentSession: () => {
        const currentSession = get().currentSession;
        if (!currentSession) return false;

        if (!validateSession(currentSession)) {
          const expiredSession = markSessionAsExpired(currentSession);
          saveSessionToStorage(expiredSession);
          set({
            currentSession: null,
            error: {
              code: "SESSION_EXPIRED",
              message: "Session has expired",
              timestamp: new Date(),
            },
          });
          return false;
        }

        return true;
      },
    }),
    {
      name: "chat-store", // Local storage key
      partialize: (state) => ({
        messages: state.messages,
        candidateProfile: state.candidateProfile,
        jobContext: state.jobContext,
      }),
    }
  )
);

// SELECTORS (for performance optimization)
export const useMessages = () => useChatStore((state) => state.messages);
export const useCandidateProfile = () =>
  useChatStore((state) => state.candidateProfile);
export const useJobContext = () => useChatStore((state) => state.jobContext);
export const useIsLoading = () => useChatStore((state) => state.isLoading);
export const useError = () => useChatStore((state) => state.error);
export const useCurrentSession = () =>
  useChatStore((state) => state.currentSession);

// UTILITY FUNCTIONS
export const getMessageCount = () => useChatStore.getState().messages.length;

export const getLastMessage = () => {
  const messages = useChatStore.getState().messages;
  return messages[messages.length - 1];
};

export const getConversationSummary = () => {
  const { messages, candidateProfile } = useChatStore.getState();
  return {
    messageCount: messages.length,
    userMessages: messages.filter((msg) => msg.role === MessageRole.USER)
      .length,
    assistantMessages: messages.filter(
      (msg) => msg.role === MessageRole.ASSISTANT
    ).length,
    profileConfidence: candidateProfile.confidence,
    lastActivity:
      messages.length > 0 ? messages[messages.length - 1].timestamp : null,
  };
};
