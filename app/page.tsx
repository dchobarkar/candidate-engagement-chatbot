"use client";

import React, { useState, useEffect, Suspense, lazy } from "react";

import { LoadingSpinner } from "./components/LoadingSpinner";
import { useChatStore } from "./lib/store";
import { useSession, useJob } from "./lib/hooks";

const ChatInterface = lazy(() =>
  import("./components/ChatInterface").then((module) => ({
    default: module.ChatInterface,
  }))
);
const CandidateProfile = lazy(() =>
  import("./components/CandidateProfile").then((module) => ({
    default: module.CanProf,
  }))
);
const JobInfo = lazy(() =>
  import("./components/JobInfo").then((module) => ({ default: module.JobInfo }))
);
const ErrorDisplay = lazy(() =>
  import("./components/ErrorDisplay").then((module) => ({
    default: module.ErrorDisplay,
  }))
);

const Page = () => {
  // State for layout management
  const [activeView, setActiveView] = useState<"chat" | "profile" | "job">(
    "chat"
  );
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Custom hooks for data
  const { currentSession, initializeSession } = useSession();
  const { jobContext } = useJob();
  const { isLoading, error } = useChatStore();

  // Initialize session on component mount
  useEffect(() => {
    if (!currentSession) {
      initializeSession();
    }
  }, [currentSession, initializeSession]);

  // Handle view switching
  const handleViewChange = (view: "chat" | "profile" | "job") => {
    setActiveView(view);
    setShowMobileMenu(false);
  };

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Loading state
  if (isLoading && !currentSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  // Loading fallback component
  const LoadingFallback = () => (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner size="md" />
      <span className="ml-2 text-gray-600">Loading...</span>
    </div>
  );

  // Error state
  if (error && !currentSession) {
    // Convert ApiError to Error object for ErrorDisplay
    const errorForDisplay =
      error instanceof Error
        ? error
        : new Error(error.message || "An error occurred");

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Suspense fallback={<LoadingFallback />}>
          <ErrorDisplay
            error={errorForDisplay}
            title="Application Error"
            showRetry={true}
            onRetry={() => window.location.reload()}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HR</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Candidate Engagement
              </h1>
              {jobContext && (
                <span className="text-sm text-gray-500">
                  • {jobContext.title}
                </span>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => handleViewChange("chat")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === "chat"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => handleViewChange("profile")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === "profile"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => handleViewChange("job")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === "job"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Job Info
              </button>
            </nav>

            {/* Session Info */}
            <div className="hidden md:flex items-center space-x-4">
              {currentSession && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Session</p>
                  <p className="text-sm font-mono text-gray-700">
                    {currentSession.id.substring(0, 8)}...
                  </p>
                </div>
              )}
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-2">
                <button
                  onClick={() => handleViewChange("chat")}
                  className={`px-3 py-2 rounded-md text-sm font-medium text-left transition-colors ${
                    activeView === "chat"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Chat Interface
                </button>
                <button
                  onClick={() => handleViewChange("profile")}
                  className={`px-3 py-2 rounded-md text-sm font-medium text-left transition-colors ${
                    activeView === "profile"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Candidate Profile
                </button>
                <button
                  onClick={() => handleViewChange("job")}
                  className={`px-3 py-2 rounded-md text-sm font-medium text-left transition-colors ${
                    activeView === "job"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Job Information
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <Suspense fallback={<LoadingFallback />}>
              <ErrorDisplay
                error={
                  error instanceof Error
                    ? error
                    : new Error(error.message || "An error occurred")
                }
                title="Application Error"
                showRetry={true}
                onRetry={() => window.location.reload()}
              />
            </Suspense>
          </div>
        )}

        {/* Content Based on Active View */}
        {activeView === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Job Information */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-8">
                <Suspense fallback={<LoadingFallback />}>
                  <JobInfo
                    className="h-fit"
                    showBenefits={true}
                    showRequirements={true}
                    showResponsibilities={true}
                  />
                </Suspense>
              </div>
            </div>

            {/* Main Content - Chat Interface */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] lg:h-[700px]">
                <Suspense fallback={<LoadingFallback />}>
                  <ChatInterface
                    className="h-full"
                    onProfileUpdate={(profile) => {
                      console.log("Profile updated:", profile);
                      // Profile updates will be handled by the store
                    }}
                    onConversationComplete={(summary) => {
                      console.log("Conversation completed:", summary);
                      // Handle conversation completion
                    }}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        )}

        {activeView === "profile" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Candidate Profile
              </h2>
              <button
                onClick={() => handleViewChange("chat")}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
              >
                Back to Chat
              </button>
            </div>
            <Suspense fallback={<LoadingFallback />}>
              <CandidateProfile
                className="w-full"
                showEditMode={false}
                onProfileUpdate={(profile) => {
                  console.log("Profile updated:", profile);
                  // Profile updates will be handled by the store
                }}
                onExport={(profile) => {
                  console.log("Exporting profile:", profile);
                  // Handle profile export
                }}
              />
            </Suspense>
          </div>
        )}

        {activeView === "job" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Job Information
              </h2>
              <button
                onClick={() => handleViewChange("chat")}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
              >
                Back to Chat
              </button>
            </div>
            <Suspense fallback={<LoadingFallback />}>
              <JobInfo
                className="w-full"
                showBenefits={true}
                showRequirements={true}
                showResponsibilities={true}
              />
            </Suspense>
          </div>
        )}

        {/* Bottom Section - Quick Actions */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => handleViewChange("chat")}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Chat
              </button>
              <button
                onClick={() => handleViewChange("profile")}
                className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                View Profile
              </button>
              <button
                onClick={() => handleViewChange("job")}
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Job Details
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p className="text-sm">
              Candidate Engagement Chatbot • Built with Next.js and AI
            </p>
            <p className="text-xs mt-2">
              Professional candidate screening and engagement platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Page;
