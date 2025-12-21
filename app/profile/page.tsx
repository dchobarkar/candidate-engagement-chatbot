"use client";

import React, { Suspense, lazy, useEffect, useState } from "react";
import Link from "next/link";

import { LoadingSpinner } from "../components/LoadingSpinner";
import { useCandidate } from "../lib/hooks";
import { getDefaultProfile } from "../data/profiles";

const CandidateProfile = lazy(() =>
  import("../components/CandidateProfile").then((module) => ({
    default: module.CanProf,
  }))
);

const Page = () => {
  const { candidateProfile, updateProfile } = useCandidate();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize profile with static data when page loads
  useEffect(() => {
    // Always initialize with static data on profile page
    // This ensures the profile page always has data to display
    if (!isInitialized) {
      const defaultProfile = getDefaultProfile();
      console.log("Initializing profile with static data:", defaultProfile);
      updateProfile(defaultProfile);
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Debug: Log when profile changes
  useEffect(() => {
    console.log("Profile page - candidateProfile:", candidateProfile);
    console.log("Profile page - has name:", candidateProfile?.name);
    console.log("Profile page - has email:", candidateProfile?.email);
  }, [candidateProfile]);

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
          <h2 className="text-2xl font-bold text-gray-900">
            Candidate Profile
          </h2>
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
          >
            Back to Jobs
          </Link>
        </div>
        <Suspense fallback={<LoadingFallback />}>
          <CandidateProfile
            className="w-full"
            showEditMode={false}
            onProfileUpdate={(profile) => {
              console.log("Profile updated:", profile);
            }}
            onExport={(profile) => {
              console.log("Exporting profile:", profile);
            }}
          />
        </Suspense>
      </div>
    </main>
  );
};

export default Page;
