"use client";

import React, { useEffect, Suspense, lazy } from "react";

import { LoadingSpinner } from "./components/LoadingSpinner";
import { useView } from "./components/layout/ViewContext";
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
  // Get active view from context
  const { activeView, setActiveView } = useView();

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
    <>
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
    </>
  );
};

export default Page;
