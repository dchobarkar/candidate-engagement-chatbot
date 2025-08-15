"use client";

import React from "react";

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "white"
    | "gray";
  className?: string;
  text?: string;
  showText?: boolean;
}

export function LoadingSpinner({
  size = "md",
  color = "primary",
  className = "",
  text,
  showText = false,
}: LoadingSpinnerProps) {
  // Size classes
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  // Color classes
  const colorClasses = {
    primary: "text-blue-600",
    secondary: "text-gray-600",
    success: "text-green-600",
    warning: "text-yellow-600",
    error: "text-red-600",
    white: "text-white",
    gray: "text-gray-400",
  };

  // Animation variants
  const animations = {
    spin: "animate-spin",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    ping: "animate-ping",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Main spinner */}
        <svg
          className={`${sizeClasses[size]} ${colorClasses[color]} ${animations.spin}`}
          fill="none"
          viewBox="0 0 24 24"
          aria-label="Loading"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>

        {/* Optional inner pulse for larger sizes */}
        {(size === "lg" || size === "xl") && (
          <div
            className={`absolute inset-0 ${animations.ping} ${colorClasses[color]} opacity-20`}
          >
            <svg
              className={`${sizeClasses[size]}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Loading text */}
      {(showText || text) && (
        <span className={`ml-2 text-sm ${colorClasses[color]} font-medium`}>
          {text || "Loading..."}
        </span>
      )}
    </div>
  );
}

// Specialized loading components for different use cases
export function PageLoader({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center min-h-64 ${className}`}
    >
      <LoadingSpinner size="xl" color="primary" />
      <p className="mt-4 text-lg font-medium text-gray-600">Loading page...</p>
      <p className="mt-2 text-sm text-gray-500">
        Please wait while we prepare everything
      </p>
    </div>
  );
}

export function ContentLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <LoadingSpinner size="lg" color="secondary" />
      <span className="ml-3 text-gray-600">Loading content...</span>
    </div>
  );
}

export function ButtonLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <LoadingSpinner size="sm" color="white" />
      <span>Loading...</span>
    </div>
  );
}

export function InlineLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <LoadingSpinner size="xs" color="primary" />
    </div>
  );
}

// Skeleton loading components
export function SkeletonLoader({
  className = "",
  lines = 3,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-gray-200 rounded mb-2 ${
            index === 0 ? "w-3/4" : index === 1 ? "w-1/2" : "w-2/3"
          }`}
        />
      ))}
    </div>
  );
}

export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
    >
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          <div className="h-3 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
}

export function MessageSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

// Progress bar loader
export function ProgressLoader({
  progress,
  className = "",
  showPercentage = true,
  color = "primary",
}: {
  progress: number;
  className?: string;
  showPercentage?: boolean;
  color?: "primary" | "success" | "warning" | "error";
}) {
  const colorClasses = {
    primary: "bg-blue-600",
    success: "bg-green-600",
    warning: "bg-yellow-600",
    error: "bg-red-600",
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Loading...</span>
        {showPercentage && (
          <span className="text-sm font-medium text-gray-700">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Dots loader for chat-like interfaces
export function DotsLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: "1s",
          }}
        />
      ))}
    </div>
  );
}

// Pulse loader for subtle loading states
export function PulseLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
      <div
        className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
        style={{ animationDelay: "0.2s" }}
      ></div>
      <div
        className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
        style={{ animationDelay: "0.4s" }}
      ></div>
    </div>
  );
}
