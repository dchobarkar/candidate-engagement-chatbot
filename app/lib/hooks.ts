import { useCallback } from "react";
import { useChatStore } from "./store";
import { CandidateProfile, MessageRole } from "./types";

// CORE STORE HOOKS
export const useChat = () => {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    addMessage,
    setLoading,
    setError,
    clearConversation,
  } = useChatStore();

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    addMessage,
    setLoading,
    setError,
    clearConversation,
  };
};

export const useSession = () => {
  const { currentSession, initializeSession, setSession, clearSession } =
    useChatStore();

  return {
    currentSession,
    initializeSession,
    setSession,
    clearSession,
  };
};

export const useCandidate = () => {
  const { candidateProfile, updateProfile } = useChatStore();

  return {
    candidateProfile,
    updateProfile,
  };
};

export const useJob = () => {
  const { jobContext } = useChatStore();

  return {
    jobContext,
  };
};

// SPECIALIZED HOOKS
export const useMessageActions = () => {
  const { sendMessage, retryLastMessage } = useChatStore();

  const sendUserMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      await sendMessage(content);
    },
    [sendMessage]
  );

  const retryMessage = useCallback(async () => {
    await retryLastMessage();
  }, [retryLastMessage]);

  return {
    sendUserMessage,
    retryMessage,
  };
};

export const useProfileActions = () => {
  const { updateProfile } = useChatStore();

  const updateCandidateName = useCallback(
    (name: string) => {
      updateProfile({ name });
    },
    [updateProfile]
  );

  const updateCandidateEmail = useCallback(
    (email: string) => {
      updateProfile({ email });
    },
    [updateProfile]
  );

  const updateCandidateExperience = useCallback(
    (experience: CandidateProfile["experience"]) => {
      updateProfile({ experience });
    },
    [updateProfile]
  );

  const updateCandidateSkills = useCallback(
    (skills: CandidateProfile["skills"]) => {
      updateProfile({ skills });
    },
    [updateProfile]
  );

  const updateCandidateSalary = useCallback(
    (salary: CandidateProfile["salary"]) => {
      updateProfile({ salary });
    },
    [updateProfile]
  );

  const updateCandidateLocation = useCallback(
    (location: CandidateProfile["location"]) => {
      updateProfile({ location });
    },
    [updateProfile]
  );

  return {
    updateCandidateName,
    updateCandidateEmail,
    updateCandidateExperience,
    updateCandidateSkills,
    updateCandidateSalary,
    updateCandidateLocation,
  };
};

export const useConversationStats = () => {
  const { messages, candidateProfile } = useChatStore();

  const stats = {
    totalMessages: messages.length,
    userMessages: messages.filter((msg) => msg.role === MessageRole.USER)
      .length,
    assistantMessages: messages.filter(
      (msg) => msg.role === MessageRole.ASSISTANT
    ).length,
    profileConfidence: candidateProfile.confidence,
    hasExtractedInfo:
      candidateProfile.name ||
      candidateProfile.email ||
      candidateProfile.skills.length > 0,
    lastActivity:
      messages.length > 0 ? messages[messages.length - 1].timestamp : null,
  };

  return stats;
};

export const useConversationExport = () => {
  const { exportConversation, importConversation } = useChatStore();

  const exportData = useCallback(() => {
    return exportConversation();
  }, [exportConversation]);

  const importData = useCallback(
    (data: string) => {
      importConversation(data);
    },
    [importConversation]
  );

  return {
    exportData,
    importData,
  };
};

// UTILITY HOOKS
export const useIsTyping = () => {
  const { isLoading } = useChatStore();
  return isLoading;
};

export const useHasError = () => {
  const { error } = useChatStore();
  return error !== null;
};

export const useErrorMessage = () => {
  const { error } = useChatStore();
  return error?.message || "";
};

export const useCanRetry = () => {
  const { messages } = useChatStore();
  const lastMessage = messages[messages.length - 1];
  return lastMessage?.role === MessageRole.USER;
};

export const useConversationIsEmpty = () => {
  const { messages } = useChatStore();
  return messages.length === 0;
};

export const useHasActiveSession = () => {
  const { currentSession } = useChatStore();
  return currentSession !== null;
};

// DEBUG HOOKS (for development)
export const useDebugStore = () => {
  const store = useChatStore();

  const debugInfo = {
    messageCount: store.messages.length,
    hasSession: store.currentSession !== null,
    isLoading: store.isLoading,
    hasError: store.error !== null,
    profileConfidence: store.candidateProfile.confidence,
    sessionId: store.currentSession?.id,
  };

  return debugInfo;
};
