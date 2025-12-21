"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { format } from "date-fns";

import {
  useChat,
  useSession,
  useJob,
  useHasError,
  useErrorMessage,
  useCanRetry,
  useIsApiKeyNotConfigured,
} from "../lib/hooks";
import { MessageBubble } from "./MessageBubble";
import { LoadingSpinner } from "./LoadingSpinner";
import { MessageRole, CandidateProfile } from "../lib/types";

interface ChatInterfaceProps {
  className?: string;
  onProfileUpdate?: (profile: CandidateProfile) => void;
  onConversationComplete?: (summary: unknown) => void;
}
const ChatInterface = ({
  className = "",
}: ChatInterfaceProps) => {
  // State management
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Custom hooks
  const { messages, isLoading, sendMessage, setLoading, setError } = useChat();

  const { currentSession } = useSession();
  const { jobContext } = useJob();
  const hasError = useHasError();
  const errorMessage = useErrorMessage();
  const canRetry = useCanRetry();
  const isApiKeyNotConfigured = useIsApiKeyNotConfigured();

  // Scroll to bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Show/hide scroll button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          chatContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(!isNearBottom);
      }
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Handle typing indicator
  useEffect(() => {
    if (isTyping) {
      setShowTypingIndicator(true);
      const timer = setTimeout(() => {
        setShowTypingIndicator(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    autoResizeTextarea(e.target);
  };

  const autoResizeTextarea = (element: HTMLTextAreaElement) => {
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 120)}px`;
  };

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isLoading) return;

    const messageContent = inputValue.trim();
    setInputValue("");

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    try {
      // Set typing indicator
      setIsTyping(true);

      // Send message via store (which handles API call and adds messages)
      await sendMessage(messageContent);
    } catch (err) {
      console.error("Error sending message:", err);
      setError({
        code: "MESSAGE_SEND_ERROR",
        message: err instanceof Error ? err.message : "Failed to send message",
        timestamp: new Date(),
        severity: "medium",
      });
    } finally {
      setIsTyping(false);

      // Focus input for next message
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Handle retry
  const handleRetry = async () => {
    if (!canRetry) return;

    try {
      setLoading(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    setInputFocused(true);
  };

  const handleInputBlur = () => {
    setInputFocused(false);
  };

  // Check if we should show welcome message
  const shouldShowWelcome = useMemo(
    () => messages.length === 0 && !isLoading && !hasError,
    [messages.length, isLoading, hasError]
  );

  return (
    <div className={`flex flex-col h-full bg-gray-50 relative ${className}`}>
      {/* Chat Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm sm:text-lg">
                HR
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {jobContext?.title || "Candidate Engagement"}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {jobContext?.company || "Company"} •{" "}
                {currentSession?.status || "Active"}
              </p>
            </div>
          </div>

          {currentSession && (
            <div className="text-right flex-shrink-0 hidden sm:block">
              <p className="text-xs text-gray-500">Session ID</p>
              <p className="text-sm font-mono text-gray-700">
                {currentSession.id.substring(0, 8)}...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* API Key Not Configured Indicator */}
      {isApiKeyNotConfigured && (
        <div className="flex-shrink-0 bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-amber-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800">
                AI Service Not Configured
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                API keys are not loaded in this environment. The chat interface is available for demonstration purposes only.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 scroll-smooth"
      >
        {/* Welcome Message */}
        {shouldShowWelcome && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 text-2xl">👋</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to {jobContext?.company || "our company"}!
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              I&apos;m here to help you learn more about the{" "}
              {jobContext?.title || "position"} and answer any questions you
              might have. Let&apos;s start a conversation!
            </p>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwnMessage={message.role === MessageRole.USER}
            onRetry={message.status === "error" ? handleRetry : undefined}
          />
        ))}

        {/* Typing Indicator */}
        {showTypingIndicator && (
          <div className="flex items-center space-x-2 text-gray-500">
            <LoadingSpinner size="sm" />
            <span className="text-sm">AI is typing...</span>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner size="md" />
            <span className="ml-2 text-gray-600">
              Processing your message...
            </span>
          </div>
        )}

        {/* Error Display */}
        {hasError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800">Error</h4>
                <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                {canRetry && (
                  <button
                    onClick={handleRetry}
                    className="mt-2 text-sm text-red-600 hover:text-red-500 font-medium"
                  >
                    Try again
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scroll to bottom anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom("smooth")}
          className="absolute bottom-28 sm:bottom-24 right-4 sm:right-8 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all z-10"
          aria-label="Scroll to bottom"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      )}

      {/* Message Input */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Input Container */}
          <div
            className={`relative border rounded-lg transition-all duration-200 ${
              inputFocused
                ? "border-blue-500 ring-2 ring-blue-200"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Type your message here..."
              className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 resize-none border-0 focus:ring-0 focus:outline-none text-sm sm:text-base text-gray-900 placeholder-gray-500"
              rows={1}
              disabled={isLoading}
              aria-label="Message input"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className={`absolute right-1.5 sm:right-2 bottom-1.5 sm:bottom-2 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                inputValue.trim() && !isLoading
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              aria-label="Send message"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Input Helpers */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden sm:inline">Press Enter to send</span>
              <span className="hidden md:inline">Shift+Enter for new line</span>
            </div>

            {currentSession && (
              <div className="text-right hidden sm:block">
                <span>{format(currentSession.createdAt, "MMM d, HH:mm")}</span>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Connection Status */}
      {currentSession && (
        <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  currentSession.status === "active"
                    ? "bg-green-400"
                    : "bg-yellow-400"
                }`}
              />
              <span className="hidden sm:inline">
                {currentSession.status === "active"
                  ? "Connected"
                  : "Session Active"}
              </span>
            </div>

            <span className="hidden md:inline">
              {currentSession.lastActivity
                ? `Last activity: ${format(
                    currentSession.lastActivity,
                    "HH:mm"
                  )}`
                : "Session started"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
