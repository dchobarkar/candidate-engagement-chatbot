"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  useChat,
  useSession,
  useMessageActions,
  useHasError,
  useErrorMessage,
  useCanRetry,
} from "../lib/hooks";
import { MessageBubble } from "./MessageBubble";
import { LoadingSpinner } from "./LoadingSpinner";
import { ChatMessage, MessageRole } from "../lib/types";
import { format } from "date-fns";

interface ChatInterfaceProps {
  className?: string;
  onProfileUpdate?: (profile: any) => void;
  onConversationComplete?: (summary: any) => void;
}

export function ChatInterface({
  className = "",
  onProfileUpdate,
  onConversationComplete,
}: ChatInterfaceProps) {
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
  const {
    messages,
    isLoading,
    error,
    candidateProfile,
    jobContext,
    addMessage,
    setLoading,
    setError,
    clearError,
  } = useChat();

  const { currentSession } = useSession();
  const { sendMessage, retryLastMessage } = useMessageActions();
  const hasError = useHasError();
  const errorMessage = useErrorMessage();
  const canRetry = useCanRetry();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  // Scroll to bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: MessageRole.USER,
      content: inputValue.trim(),
      timestamp: new Date(),
      status: "sending",
    };

    try {
      // Add user message immediately
      addMessage(userMessage);
      setInputValue("");

      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }

      // Clear any previous errors
      clearError();

      // Set loading state
      setLoading(true);
      setIsTyping(true);

      // Send message to API
      const response = await sendMessage(inputValue.trim());

      if (response.success) {
        // Update user message status
        addMessage({
          ...userMessage,
          status: "sent",
        });

        // Add assistant response
        if (response.data?.assistantMessage) {
          addMessage(response.data.assistantMessage);
        }

        // Handle profile updates
        if (response.data?.extractedInfo && onProfileUpdate) {
          onProfileUpdate(response.data.extractedInfo);
        }

        // Check if conversation is complete
        if (response.data?.conversationComplete && onConversationComplete) {
          onConversationComplete(response.data);
        }
      } else {
        // Handle error
        setError(response.error || "Failed to send message");
        addMessage({
          ...userMessage,
          status: "error",
        });
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMsg);
      addMessage({
        ...userMessage,
        status: "error",
      });
    } finally {
      setLoading(false);
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
      clearError();

      const response = await retryLastMessage();

      if (response.success) {
        // Remove the failed message and add the retried one
        // This will be handled by the store
      } else {
        setError(response.error || "Failed to retry message");
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
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
  const shouldShowWelcome = messages.length === 0 && !isLoading && !hasError;

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Chat Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">HR</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {jobContext?.title || "Candidate Engagement"}
              </h2>
              <p className="text-sm text-gray-600">
                {jobContext?.company || "Company"} •{" "}
                {currentSession?.status || "Active"}
              </p>
            </div>
          </div>

          {currentSession && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Session ID</p>
              <p className="text-sm font-mono text-gray-700">
                {currentSession.id.substring(0, 8)}...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scroll-smooth"
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
              I'm here to help you learn more about the{" "}
              {jobContext?.title || "position"} and answer any questions you
              might have. Let's start a conversation!
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
          className="absolute bottom-24 right-8 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
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
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4">
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
              placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
              className="w-full px-4 py-3 pr-12 resize-none border-0 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-500"
              rows={1}
              disabled={isLoading}
              aria-label="Message input"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className={`absolute right-2 bottom-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                inputValue.trim() && !isLoading
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
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
            <div className="flex items-center space-x-4">
              <span>Press Enter to send</span>
              <span>Shift+Enter for new line</span>
            </div>

            {currentSession && (
              <div className="text-right">
                <span>
                  Session: {format(currentSession.createdAt, "MMM d, HH:mm")}
                </span>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Connection Status */}
      {currentSession && (
        <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-6 py-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  currentSession.status === "active"
                    ? "bg-green-400"
                    : "bg-yellow-400"
                }`}
              />
              <span>
                {currentSession.status === "active"
                  ? "Connected"
                  : "Session Active"}
              </span>
            </div>

            <span>
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
}
