"use client";

import React, { useEffect, Suspense, lazy } from "react";
import { useSearchParams } from "next/navigation";

import { LoadingSpinner } from "../components/LoadingSpinner";
import { useChatStore } from "../lib/store";
import { useSession } from "../lib/hooks";
import { getJobById } from "../data/jobs";
import { sessionManager } from "../lib/session-manager";

const ChatInterface = lazy(() => import("../components/ChatInterface"));
const JobInfo = lazy(() =>
  import("../components/JobInfo").then((module) => ({
    default: module.JobInfo,
  }))
);
const ErrorDisplay = lazy(() =>
  import("../components/ErrorDisplay").then((module) => ({
    default: module.ErrorDisplay,
  }))
);

const Page = () => {
  const searchParams = useSearchParams();
  const jobId = searchParams?.get("jobId");
  const { currentSession, initializeSession } = useSession();
  const { isLoading, error, setSession } = useChatStore();

  // Initialize session on component mount
  useEffect(() => {
    if (!currentSession) {
      // If jobId is provided, get the job and initialize session with it
      if (jobId) {
        const job = getJobById(jobId);
        if (job) {
          // Create session with specific job context
          const newSession = sessionManager.createSession(undefined, job);
          setSession(newSession);
        } else {
          // Job not found, initialize with default
          initializeSession();
        }
      } else {
        initializeSession();
      }
    }
  }, [currentSession, initializeSession, jobId, setSession]);

  // Loading fallback component
  const LoadingFallback = () => (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner size="md" />
      <span className="ml-2 text-gray-600">Loading...</span>
    </div>
  );

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

  // Error state
  if (error && !currentSession) {
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

      {/* Chat View */}
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
                }}
                onConversationComplete={(summary) => {
                  console.log("Conversation completed:", summary);
                }}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
