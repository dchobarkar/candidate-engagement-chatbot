"use client";

import React, { useState, useEffect } from "react";

import { useJob } from "../lib/hooks";
import { JobDescription, JobType } from "../lib/types";
import { format } from "date-fns";

interface JobInfoProps {
  className?: string;
  jobId?: string;
  showBenefits?: boolean;
  showRequirements?: boolean;
  showResponsibilities?: boolean;
  onJobSelect?: (job: JobDescription) => void;
  onApply?: (job: JobDescription) => void;
}

export function JobInfo({
  className = "",
  jobId,
  showBenefits = true,
  showRequirements = true,
  showResponsibilities = true,
  onJobSelect,
  onApply,
}: JobInfoProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedJob, setSelectedJob] = useState<JobDescription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Custom hooks
  const { jobContext, availableJobs, getJobById } = useJob();

  // Initialize selected job
  useEffect(() => {
    if (jobId) {
      const job = getJobById(jobId);
      if (job) setSelectedJob(job);
    } else if (jobContext) setSelectedJob(jobContext);
  }, [jobId, jobContext, getJobById]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Handle job selection
  const handleJobSelect = (job: JobDescription) => {
    setSelectedJob(job);
    if (onJobSelect) onJobSelect(job);
  };

  // Handle apply action
  const handleApply = async (job: JobDescription) => {
    if (onApply) {
      setIsLoading(true);
      try {
        await onApply(job);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Get job type styling
  const getJobTypeStyle = (type: JobType) => {
    switch (type) {
      case JobType.FULL_TIME:
        return "bg-green-100 text-green-800 border-green-200";
      case JobType.PART_TIME:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case JobType.CONTRACT:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case JobType.INTERNSHIP:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get experience level styling
  const getExperienceStyle = (years: number) => {
    if (years <= 2) return "bg-blue-100 text-blue-800";
    if (years <= 5) return "bg-green-100 text-green-800";
    if (years <= 8) return "bg-yellow-100 text-yellow-800";
    return "bg-purple-100 text-purple-800";
  };

  // Format experience range
  const formatExperience = (experience: {
    min: number;
    max: number;
    unit: string;
  }) => {
    return `${experience.min}-${experience.max} ${experience.unit}`;
  };

  // Format salary range
  const formatSalary = (min: number, max: number, currency: string = "USD") => {
    const formatNumber = (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
      return num.toString();
    };

    return `${currency} ${formatNumber(min)} - ${formatNumber(max)}`;
  };

  if (!selectedJob) {
    return (
      <div
        className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
      >
        <div className="text-center py-8 text-gray-500">
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
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.815-8.927-2.2M21 13.255v-3.255a3 3 0 00-3-3H6a3 3 0 00-3 3v3.255M21 13.255a23.931 23.931 0 01-8.927 2.2M21 13.255a23.931 23.931 0 00-8.927-2.2M21 13.255v-3.255a3 3 0 00-3-3H6a3 3 0 00-3 3v3.255M21 13.255a23.931 23.931 0 01-8.927 2.2"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Job Selected
          </h3>
          <p className="text-gray-600">Select a job to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
      {/* Job Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 gap-2 mb-3">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                {selectedJob.title}
              </h2>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium border flex-shrink-0 ${getJobTypeStyle(
                  selectedJob.type as JobType
                )}`}
              >
                {selectedJob.type.replace("-", " ")}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-2 sm:gap-4 text-gray-600 mb-3">
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span className="text-sm truncate">{selectedJob.company}</span>
              </div>

              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-sm truncate">{selectedJob.location}</span>
                {selectedJob.remote && (
                  <span className="text-blue-600 font-medium text-sm">
                    (Remote)
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm">
                  {selectedJob.experience.min}-{selectedJob.experience.max}{" "}
                  {selectedJob.experience.unit}
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {selectedJob.skills.length}
                </div>
                <div className="text-xs text-gray-500">Required Skills</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {selectedJob.responsibilities.length}
                </div>
                <div className="text-xs text-gray-500">Responsibilities</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">
                  {selectedJob.benefits?.length || 0}
                </div>
                <div className="text-xs text-gray-500">Benefits</div>
              </div>
            </div>
          </div>

          {/* Apply Button */}
          {onApply && (
            <div className="lg:ml-6 flex-shrink-0">
              <button
                onClick={() => handleApply(selectedJob)}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Applying...</span>
                  </div>
                ) : (
                  "Apply Now"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Job Details Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <nav
          className="flex space-x-1 px-4 sm:px-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          aria-label="Tabs"
        >
          {(
            [
              {
                id: "overview",
                label: "Overview",
                icon: (
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                ),
              },
              {
                id: "requirements",
                label: "Requirements",
                icon: (
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
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                ),
              },
              {
                id: "responsibilities",
                label: "Responsibilities",
                icon: (
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                ),
              },
              {
                id: "benefits",
                label: "Benefits",
                icon: (
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                group relative flex items-center space-x-2 px-3 sm:px-4 py-3 sm:py-4 
                font-medium text-xs sm:text-sm transition-all duration-200
                whitespace-nowrap flex-shrink-0 border-b-2
                ${
                  activeTab === tab.id
                    ? "text-blue-600 border-blue-600 bg-blue-50/50"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50/50"
                }
              `}
            >
              <span
                className={
                  activeTab === tab.id
                    ? "text-blue-600"
                    : "text-gray-400 group-hover:text-gray-600 transition-colors"
                }
              >
                {tab.icon}
              </span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6 min-h-[300px]">
        {/* Overview Section */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job Summary */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3">
                  Job Summary
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {selectedJob.summary}
                </p>
              </div>

              {/* Key Details */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3">
                  Key Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience Level:</span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getExperienceStyle(
                        selectedJob.experience.min
                      )}`}
                    >
                      {selectedJob.experience.min}-{selectedJob.experience.max}{" "}
                      {selectedJob.experience.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Job Type:</span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getJobTypeStyle(
                        selectedJob.type as JobType
                      )}`}
                    >
                      {selectedJob.type.replace("-", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="text-gray-900">
                      {selectedJob.location}
                    </span>
                  </div>
                  {selectedJob.remote && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remote:</span>
                      <span className="text-green-600 font-medium">
                        Available
                      </span>
                    </div>
                  )}
                  {selectedJob.salary && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Salary Range:</span>
                      <span className="text-gray-900 font-medium">
                        {formatSalary(
                          selectedJob.salary.min,
                          selectedJob.salary.max,
                          selectedJob.salary.currency
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Posted Date */}
            {selectedJob.postedDate && (
              <div className="text-center text-sm text-gray-500">
                Posted on{" "}
                {format(new Date(selectedJob.postedDate), "MMMM d, yyyy")}
              </div>
            )}
          </div>
        )}

        {/* Requirements Section */}
        {activeTab === "requirements" && showRequirements && (
          <div className="space-y-6 animate-fade-in">
            {/* Required Skills */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3">
                Required Skills
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {selectedJob.skills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience Requirements */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3">
                Experience Requirements
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Minimum Experience:</span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getExperienceStyle(
                      selectedJob.experience.min
                    )}`}
                  >
                    {formatExperience(selectedJob.experience)}
                  </span>
                </div>
                {selectedJob.experienceDetails && (
                  <p className="text-gray-700">
                    {typeof selectedJob.experienceDetails === "string"
                      ? selectedJob.experienceDetails
                      : JSON.stringify(selectedJob.experienceDetails, null, 2)}
                  </p>
                )}
              </div>
            </div>

            {/* Education Requirements */}
            {selectedJob.education && (
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3">
                  Education Requirements
                </h3>
                <div className="space-y-2">
                  {Array.isArray(selectedJob.education) ? (
                    selectedJob.education.map(
                      (
                        edu:
                          | string
                          | number
                          | bigint
                          | boolean
                          | React.ReactElement<
                              unknown,
                              string | React.JSXElementConstructor<unknown>
                            >
                          | Iterable<React.ReactNode>
                          | React.ReactPortal
                          | Promise<
                              | string
                              | number
                              | bigint
                              | boolean
                              | React.ReactPortal
                              | React.ReactElement<
                                  unknown,
                                  string | React.JSXElementConstructor<unknown>
                                >
                              | Iterable<React.ReactNode>
                              | null
                              | undefined
                            >
                          | null
                          | undefined,
                        index: React.Key | null | undefined
                      ) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <svg
                            className="w-4 h-4 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                          </svg>
                          <span className="text-gray-700">{edu}</span>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-gray-700">
                      {typeof selectedJob.education === "string"
                        ? selectedJob.education
                        : JSON.stringify(selectedJob.education, null, 2)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Responsibilities Section */}
        {activeTab === "responsibilities" && showResponsibilities && (
          <div className="space-y-3 sm:space-y-4 animate-fade-in">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">
              Key Responsibilities
            </h3>
            <div className="grid gap-2 sm:gap-3">
              {selectedJob.responsibilities.map((responsibility, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 sm:space-x-3 bg-gray-50 rounded-lg p-3 sm:p-4"
                >
                  <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 text-xs sm:text-sm font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    {responsibility}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benefits Section */}
        {activeTab === "benefits" && showBenefits && selectedJob.benefits && (
          <div
            className="space-y-3 sm:space-y-4"
            style={{ animation: "fadeIn 0.3s ease-in-out" }}
          >
            <h3 className="text-base sm:text-lg font-medium text-gray-900">
              Benefits & Perks
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              {selectedJob.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 sm:space-x-3 bg-green-50 rounded-lg p-3 sm:p-4"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm sm:text-base text-gray-700">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Job Selection (if multiple jobs available) */}
      {availableJobs && availableJobs.length > 1 && (
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Other Available Positions
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            {availableJobs
              .filter((job) => job.id !== selectedJob.id)
              .slice(0, 3)
              .map((job) => (
                <button
                  key={job.id}
                  onClick={() => handleJobSelect(job)}
                  className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200 w-full"
                >
                  <div className="font-medium text-gray-900 text-sm break-words">
                    {job.title}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {job.company}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {job.location}
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact Job Card Component for sidebar or small spaces
export function JobCard({
  job,
  className = "",
  onClick,
  showApply = false,
  onApply,
}: {
  job: JobDescription;
  className?: string;
  onClick?: (job: JobDescription) => void;
  showApply?: boolean;
  onApply?: (job: JobDescription) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = async () => {
    if (onApply) {
      setIsLoading(true);
      try {
        await onApply(job);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(job);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1">
            {job.title}
          </h3>
          <p className="text-xs text-gray-600">{job.company}</p>
        </div>
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            job.type === JobType.FULL_TIME
              ? "bg-green-100 text-green-800"
              : job.type === JobType.PART_TIME
              ? "bg-blue-100 text-blue-800"
              : job.type === JobType.CONTRACT
              ? "bg-purple-100 text-purple-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {job.type.replace("-", " ")}
        </span>
      </div>

      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
        <span>{job.location}</span>
        <span>
          {job.experience.min}-{job.experience.max} {job.experience.unit}
        </span>
        {job.remote && <span className="text-blue-600">Remote</span>}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {job.skills.slice(0, 2).join(", ")}
          {job.skills.length > 2 && ` +${job.skills.length - 2} more`}
        </div>

        {showApply && onApply && (
          <button
            onClick={handleApply}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Applying..." : "Apply"}
          </button>
        )}
      </div>
    </div>
  );
}
