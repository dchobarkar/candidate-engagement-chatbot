"use client";

import React, { Suspense, lazy } from "react";
import Link from "next/link";

import { LoadingSpinner } from "../components/LoadingSpinner";

const JobInfo = lazy(() =>
  import("../components/JobInfo").then((module) => ({
    default: module.JobInfo,
  }))
);

const Page = () => {
  // Loading fallback component
  const LoadingFallback = () => (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner size="md" />
      <span className="ml-2 text-gray-600">Loading...</span>
    </div>
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Job Information</h2>
          <Link
            href="/chat"
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
          >
            Back to Chat
          </Link>
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
    </main>
  );
};

export default Page;
