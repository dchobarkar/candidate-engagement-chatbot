"use client";

import React, { useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

interface ErrorDisplayProps {
  error: string | Error;
  title?: string;
  className?: string;
  onRetry?: () => Promise<void> | void;
  onDismiss?: () => void;
  showRetry?: boolean;
  showDismiss?: boolean;
  severity?: "error" | "warning" | "info";
  showDetails?: boolean;
}

export function ErrorDisplay({
  error,
  title,
  className = "",
  onRetry,
  onDismiss,
  showRetry = true,
  showDismiss = true,
  severity = "error",
  showDetails = false,
}: ErrorDisplayProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(showDetails);

  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Severity styling
  const severityStyles = {
    error: {
      container: "bg-red-50 border-red-200",
      icon: "text-red-400",
      title: "text-red-800",
      message: "text-red-700",
      button: "bg-red-600 hover:bg-red-700 text-white",
      border: "border-red-200",
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200",
      icon: "text-yellow-400",
      title: "text-yellow-800",
      message: "text-yellow-700",
      button: "bg-yellow-600 hover:bg-yellow-700 text-white",
      border: "border-yellow-200",
    },
    info: {
      container: "bg-blue-50 border-blue-200",
      icon: "text-blue-400",
      title: "text-blue-800",
      message: "text-blue-700",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
      border: "border-blue-200",
    },
  };

  const styles = severityStyles[severity];

  // Handle retry
  const handleRetry = async () => {
    if (!onRetry) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  // Get error icon
  const getErrorIcon = () => {
    switch (severity) {
      case "error":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "info":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={`rounded-lg border p-4 ${styles.container} ${styles.border} ${className}`}
    >
      <div className="flex items-start space-x-3">
        {/* Error Icon */}
        <div className={`flex-shrink-0 ${styles.icon}`}>{getErrorIcon()}</div>

        {/* Error Content */}
        <div className="flex-1 min-w-0">
          {/* Error Title */}
          {title && (
            <h3 className={`text-sm font-medium ${styles.title} mb-1`}>
              {title}
            </h3>
          )}

          {/* Error Message */}
          <p className={`text-sm ${styles.message} mb-3`}>{errorMessage}</p>

          {/* Error Details */}
          {errorStack && showFullDetails && (
            <div className="mb-3">
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-800 mb-2">
                  Show technical details
                </summary>
                <pre className="bg-gray-100 p-3 rounded text-gray-700 overflow-x-auto">
                  {errorStack}
                </pre>
              </details>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {showRetry && onRetry && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className={`px-3 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${styles.button}`}
              >
                {isRetrying ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="xs" color="white" />
                    <span>Retrying...</span>
                  </div>
                ) : (
                  "Try Again"
                )}
              </button>
            )}

            {showDismiss && onDismiss && (
              <button
                onClick={onDismiss}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Dismiss
              </button>
            )}

            {errorStack && (
              <button
                onClick={() => setShowFullDetails(!showFullDetails)}
                className="text-sm text-gray-600 hover:text-gray-800 underline focus:outline-none"
              >
                {showFullDetails ? "Hide" : "Show"} Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Network Error Component
export function NetworkError({
  error,
  onRetry,
  className = "",
}: {
  error: string | Error;
  onRetry?: () => Promise<void> | void;
  className?: string;
}) {
  return (
    <ErrorDisplay
      error={error}
      title="Network Error"
      severity="error"
      onRetry={onRetry}
      showDismiss={false}
      className={className}
    />
  );
}

// Validation Error Component
export function ValidationError({
  errors,
  onRetry,
  className = "",
}: {
  errors: string[];
  onRetry?: () => Promise<void> | void;
  className?: string;
}) {
  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
    >
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
          <h3 className="text-sm font-medium text-red-800 mb-2">
            Validation Error
          </h3>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1 mb-3">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Permission Error Component
export function PermissionError({
  error,
  onRetry,
  className = "",
}: {
  error: string | Error;
  onRetry?: () => Promise<void> | void;
  className?: string;
}) {
  return (
    <ErrorDisplay
      error={error}
      title="Permission Denied"
      severity="warning"
      onRetry={onRetry}
      showDismiss={true}
      className={className}
    />
  );
}

// Timeout Error Component
export function TimeoutError({
  error,
  onRetry,
  className = "",
}: {
  error: string | Error;
  onRetry?: () => Promise<void> | void;
  className?: string;
}) {
  return (
    <ErrorDisplay
      error={error}
      title="Request Timeout"
      severity="warning"
      onRetry={onRetry}
      showDismiss={false}
      className={className}
    />
  );
}

// Server Error Component
export function ServerError({
  error,
  onRetry,
  className = "",
}: {
  error: string | Error;
  onRetry?: () => Promise<void> | void;
  className?: string;
}) {
  return (
    <ErrorDisplay
      error={error}
      title="Server Error"
      severity="error"
      onRetry={onRetry}
      showDismiss={false}
      className={className}
    />
  );
}

// Empty State Error Component
export function EmptyStateError({
  title = "No Data Available",
  message = "There's nothing to display at the moment.",
  icon,
  action,
  className = "",
}: {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon || (
        <svg
          className="w-16 h-16 mx-auto mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-md mx-auto mb-4">{message}</p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}

// Error Boundary Fallback Component
export function ErrorFallback({
  error,
  resetErrorBoundary,
  className = "",
}: {
  error: Error;
  resetErrorBoundary: () => void;
  className?: string;
}) {
  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`}
    >
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Please try refreshing the page or
          contact support if the problem persists.
        </p>
        <div className="space-y-3">
          <button
            onClick={resetErrorBoundary}
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Refresh Page
          </button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs text-gray-700 bg-gray-100 p-3 rounded overflow-x-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
