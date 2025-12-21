"use client";

import React, { Suspense, lazy } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { LoadingSpinner } from "../../components/LoadingSpinner";
import { getJobById } from "../../data/jobs";

const JobInfo = lazy(() =>
  import("../../components/JobInfo").then((module) => ({
    default: module.JobInfo,
  }))
);

const Page = () => {
  const params = useParams();
  const jobId = params?.id as string;
  const job = jobId ? getJobById(jobId) : null;

  // Loading fallback component
  const LoadingFallback = () => (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner size="md" />
      <span className="ml-2 text-gray-600">Loading...</span>
    </div>
  );

  if (!job) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Job Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The job you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Jobs
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
            >
              ← Back to Jobs
            </Link>
            <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
            <p className="text-gray-600">{job.company}</p>
          </div>
          <Link
            href={`/chat?jobId=${job.id}`}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Chat
          </Link>
        </div>
        <Suspense fallback={<LoadingFallback />}>
          <JobInfo
            className="w-full"
            job={job}
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
