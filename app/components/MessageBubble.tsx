"use client";

import React, { useState, useEffect } from "react";
import { ChatMessage, MessageRole, MessageStatus } from "../lib/types";
import { format } from "date-fns";
import { LoadingSpinner } from "./LoadingSpinner";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  onRetry?: () => void;
  className?: string;
}

export function MessageBubble({
  message,
  isOwnMessage,
  onRetry,
  className = "",
}: MessageBubbleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTimestamp, setShowTimestamp] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Show timestamp on hover
  const handleMouseEnter = () => {
    setShowTimestamp(true);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setShowTimestamp(false);
    setIsHovered(false);
  };

  // Get message status icon and color
  const getStatusIndicator = () => {
    switch (message.status) {
      case "sending":
        return (
          <div className="flex items-center space-x-1">
            <LoadingSpinner size="xs" />
            <span className="text-xs text-gray-500">Sending...</span>
          </div>
        );
      case "sent":
        return (
          <div className="flex items-center space-x-1">
            <svg
              className="w-3 h-3 text-blue-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs text-gray-400">Sent</span>
          </div>
        );
      case "delivered":
        return (
          <div className="flex items-center space-x-1">
            <svg
              className="w-3 h-3 text-blue-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs text-gray-400">Delivered</span>
          </div>
        );
      case "read":
        return (
          <div className="flex items-center space-x-1">
            <svg
              className="w-3 h-3 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs text-blue-600">Read</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center space-x-1">
            <svg
              className="w-3 h-3 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs text-red-500">Failed</span>
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-xs text-red-600 hover:text-red-700 underline ml-1"
              >
                Retry
              </button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Get message type styling
  const getMessageTypeStyling = () => {
    if (message.type === "system") {
      return "bg-gray-100 text-gray-700 border-gray-200";
    }
    if (message.type === "error") {
      return "bg-red-50 text-red-800 border-red-200";
    }
    if (message.type === "success") {
      return "bg-green-50 text-green-800 border-green-200";
    }
    if (message.type === "warning") {
      return "bg-yellow-50 text-yellow-800 border-yellow-200";
    }
    return "";
  };

  // Get avatar for different message types
  const getAvatar = () => {
    if (isOwnMessage) {
      return (
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          You
        </div>
      );
    }

    if (message.role === MessageRole.ASSISTANT) {
      return (
        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          AI
        </div>
      );
    }

    if (message.role === MessageRole.SYSTEM) {
      return (
        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm">
          ⚙️
        </div>
      );
    }

    return (
      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm">
        ?
      </div>
    );
  };

  // Get message bubble styling
  const getBubbleStyling = () => {
    const baseClasses =
      "rounded-2xl px-4 py-3 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl";

    if (isOwnMessage) {
      return `${baseClasses} bg-blue-600 text-white ml-auto`;
    }

    if (message.role === MessageRole.SYSTEM) {
      return `${baseClasses} bg-gray-100 text-gray-700 border border-gray-200`;
    }

    if (message.role === MessageRole.ASSISTANT) {
      return `${baseClasses} bg-white text-gray-900 border border-gray-200 shadow-sm`;
    }

    return `${baseClasses} bg-gray-100 text-gray-900`;
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, "HH:mm");
    } else if (diffInHours < 48) {
      return `Yesterday ${format(date, "HH:mm")}`;
    } else {
      return format(date, "MMM d, HH:mm");
    }
  };

  // Handle long content with expand/collapse
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = message.content.length > 300;
  const displayContent =
    shouldTruncate && !isExpanded
      ? message.content.substring(0, 300) + "..."
      : message.content;

  return (
    <div
      className={`flex ${
        isOwnMessage ? "justify-end" : "justify-start"
      } mb-4 group ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Avatar and Message Container */}
      <div
        className={`flex items-start space-x-3 ${
          isOwnMessage ? "flex-row-reverse space-x-reverse" : ""
        }`}
      >
        {/* Avatar */}
        {!isOwnMessage && <div className="flex-shrink-0">{getAvatar()}</div>}

        {/* Message Bubble */}
        <div
          className={`flex flex-col ${
            isOwnMessage ? "items-end" : "items-start"
          }`}
        >
          {/* Message Content */}
          <div
            className={`
              ${getBubbleStyling()}
              ${getMessageTypeStyling()}
              transition-all duration-300 ease-out
              ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              }
              ${isHovered ? "shadow-lg" : "shadow-sm"}
              hover:shadow-md
              cursor-pointer
            `}
            onClick={() => shouldTruncate && setIsExpanded(!isExpanded)}
          >
            {/* Message Type Badge */}
            {message.type && message.type !== "user" && (
              <div className="mb-2">
                <span
                  className={`
                  inline-block px-2 py-1 text-xs font-medium rounded-full
                  ${
                    message.type === "system" ? "bg-gray-200 text-gray-700" : ""
                  }
                  ${message.type === "error" ? "bg-red-200 text-red-700" : ""}
                  ${
                    message.type === "success"
                      ? "bg-green-200 text-green-700"
                      : ""
                  }
                  ${
                    message.type === "warning"
                      ? "bg-yellow-200 text-yellow-700"
                      : ""
                  }
                `}
                >
                  {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
                </span>
              </div>
            )}

            {/* Message Text */}
            <div className="whitespace-pre-wrap break-words leading-relaxed">
              {displayContent}
            </div>

            {/* Expand/Collapse Button */}
            {shouldTruncate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="mt-2 text-xs font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded"
              >
                {isExpanded ? "Show less" : "Show more"}
              </button>
            )}

            {/* Message Metadata */}
            <div className="mt-2 flex items-center justify-between text-xs opacity-75">
              {/* Timestamp */}
              <span
                className={isOwnMessage ? "text-blue-100" : "text-gray-500"}
              >
                {formatTimestamp(message.timestamp)}
              </span>

              {/* Status Indicators */}
              {isOwnMessage && (
                <div className="flex items-center space-x-1">
                  {getStatusIndicator()}
                </div>
              )}
            </div>
          </div>

          {/* Additional Message Info */}
          {message.metadata && (
            <div
              className={`mt-2 text-xs text-gray-500 ${
                isOwnMessage ? "text-right" : "text-left"
              }`}
            >
              {message.metadata.confidence && (
                <span className="inline-block bg-gray-100 px-2 py-1 rounded-full mr-2">
                  Confidence: {Math.round(message.metadata.confidence * 100)}%
                </span>
              )}
              {message.metadata.extractedInfo && (
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Info extracted
                </span>
              )}
            </div>
          )}

          {/* Quick Actions */}
          {isHovered && (
            <div
              className={`
              mt-2 flex items-center space-x-2 text-xs
              ${isOwnMessage ? "justify-end" : "justify-start"}
              transition-opacity duration-200
            `}
            >
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                Copy
              </button>
              {message.role === MessageRole.ASSISTANT && (
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  Like
                </button>
              )}
              {message.role === MessageRole.ASSISTANT && (
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  Dislike
                </button>
              )}
            </div>
          )}
        </div>

        {/* Avatar for own messages */}
        {isOwnMessage && <div className="flex-shrink-0">{getAvatar()}</div>}
      </div>

      {/* Timestamp Tooltip */}
      {showTimestamp && (
        <div
          className={`
          absolute z-10 px-2 py-1 text-xs text-white bg-gray-900 rounded
          ${isOwnMessage ? "right-0" : "left-0"}
          transform -translate-y-full -translate-x-1/2
          opacity-90
        `}
        >
          {format(message.timestamp, "MMM d, yyyy HH:mm:ss")}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}

// Specialized message bubble components for different types
export function SystemMessage({
  message,
  className = "",
}: {
  message: ChatMessage;
  className?: string;
}) {
  return (
    <div className={`text-center my-4 ${className}`}>
      <div className="inline-block bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm border border-gray-200">
        {message.content}
      </div>
    </div>
  );
}

export function ErrorMessage({
  message,
  onRetry,
  className = "",
}: {
  message: ChatMessage;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={`my-4 ${className}`}>
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
            <p className="text-sm text-red-700 mt-1">{message.content}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 text-sm text-red-600 hover:text-red-500 font-medium"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SuccessMessage({
  message,
  className = "",
}: {
  message: ChatMessage;
  className?: string;
}) {
  return (
    <div className={`my-4 ${className}`}>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-green-800">Success</h4>
            <p className="text-sm text-green-700 mt-1">{message.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WarningMessage({
  message,
  className = "",
}: {
  message: ChatMessage;
  className?: string;
}) {
  return (
    <div className={`my-4 ${className}`}>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-yellow-400"
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
          <div className="flex-1">
            <h4 className="text-sm font-medium text-yellow-800">Warning</h4>
            <p className="text-sm text-yellow-700 mt-1">{message.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
