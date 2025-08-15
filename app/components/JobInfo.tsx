"use client";

import React, { useState, useEffect } from "react";
import { useJob } from "../lib/hooks";
import { JobDescription, JobType, SkillLevel } from "../lib/types";
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["overview"])
  );
  const [selectedJob, setSelectedJob] = useState<JobDescription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Custom hooks
  const { jobContext, availableJobs, getJobById } = useJob();

  // Initialize selected job
  useEffect(() => {
    if (jobId) {
      const job = getJobById(jobId);
      if (job) {
        setSelectedJob(job);
      }
    } else if (jobContext) {
      setSelectedJob(jobContext);
    }
  }, [jobId, jobContext, getJobById]);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Handle job selection
  const handleJobSelect = (job: JobDescription) => {
    setSelectedJob(job);
    if (onJobSelect) {
      onJobSelect(job);
    }
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
      case "full-time":
        return "bg-green-100 text-green-800 border-green-200";
      case "part-time":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "contract":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "internship":
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

  // Get skill level styling
  const getSkillLevelStyle = (level: SkillLevel) => {
    switch (level) {
      case "beginner":
        return "bg-gray-100 text-gray-700";
      case "intermediate":
        return "bg-blue-100 text-blue-700";
      case "advanced":
        return "bg-green-100 text-green-700";
      case "expert":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
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
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedJob.title}
              </h2>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getJobTypeStyle(
                  selectedJob.type
                )}`}
              >
                {selectedJob.type.replace("-", " ")}
              </span>
            </div>

            <div className="flex items-center space-x-4 text-gray-600 mb-3">
              <div className="flex items-center space-x-1">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span>{selectedJob.company}</span>
              </div>

              <div className="flex items-center space-x-1">
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{selectedJob.location}</span>
                {selectedJob.remote && (
                  <span className="text-blue-600 font-medium">(Remote)</span>
                )}
              </div>

              <div className="flex items-center space-x-1">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{selectedJob.experience} years</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedJob.skills.length}
                </div>
                <div className="text-xs text-gray-500">Required Skills</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {selectedJob.responsibilities.length}
                </div>
                <div className="text-xs text-gray-500">Responsibilities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {selectedJob.benefits?.length || 0}
                </div>
                <div className="text-xs text-gray-500">Benefits</div>
              </div>
            </div>
          </div>

          {/* Apply Button */}
          {onApply && (
            <div className="ml-6">
              <button
                onClick={() => handleApply(selectedJob)}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
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
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {(
            [
              "overview",
              "requirements",
              "responsibilities",
              "benefits",
            ] as const
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => toggleSection(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                expandedSections.has(tab)
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Overview Section */}
        {expandedSections.has("overview") && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Job Summary
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedJob.summary}
                </p>
              </div>

              {/* Key Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Key Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience Level:</span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getExperienceStyle(
                        selectedJob.experience
                      )}`}
                    >
                      {selectedJob.experience} years
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Job Type:</span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getJobTypeStyle(
                        selectedJob.type
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
        {expandedSections.has("requirements") && showRequirements && (
          <div className="space-y-6">
            {/* Required Skills */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Required Skills
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Experience Requirements
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Minimum Experience:</span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getExperienceStyle(
                      selectedJob.experience
                    )}`}
                  >
                    {selectedJob.experience} years
                  </span>
                </div>
                {selectedJob.experienceDetails && (
                  <p className="text-gray-700">
                    {selectedJob.experienceDetails}
                  </p>
                )}
              </div>
            </div>

            {/* Education Requirements */}
            {selectedJob.education && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Education Requirements
                </h3>
                <div className="space-y-2">
                  {selectedJob.education.map((edu, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <svg
                        className="w-4 h-4 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                      <span className="text-gray-700">{edu}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Responsibilities Section */}
        {expandedSections.has("responsibilities") && showResponsibilities && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Key Responsibilities
            </h3>
            <div className="grid gap-3">
              {selectedJob.responsibilities.map((responsibility, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {responsibility}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benefits Section */}
        {expandedSections.has("benefits") &&
          showBenefits &&
          selectedJob.benefits && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Benefits & Perks
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedJob.benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 bg-green-50 rounded-lg p-4"
                  >
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Job Selection (if multiple jobs available) */}
      {availableJobs && availableJobs.length > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Other Available Positions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableJobs
              .filter((job) => job.id !== selectedJob.id)
              .slice(0, 3)
              .map((job) => (
                <button
                  key={job.id}
                  onClick={() => handleJobSelect(job)}
                  className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="font-medium text-gray-900 text-sm">
                    {job.title}
                  </div>
                  <div className="text-xs text-gray-600">{job.company}</div>
                  <div className="text-xs text-gray-500">{job.location}</div>
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

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer ${className}`}
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
            job.type === "full-time"
              ? "bg-green-100 text-green-800"
              : job.type === "part-time"
              ? "bg-blue-100 text-blue-800"
              : job.type === "contract"
              ? "bg-purple-100 text-purple-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {job.type.replace("-", " ")}
        </span>
      </div>

      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
        <span>{job.location}</span>
        <span>{job.experience} years</span>
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
