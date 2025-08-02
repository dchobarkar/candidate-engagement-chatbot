import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { sessionManager } from "../../lib/session-manager";
import {
  CandidateProfile,
  ApiError,
  ApiResponse,
} from "../../lib/types";

// ============================================================================
// INPUT VALIDATION SCHEMAS
// ============================================================================

const ProfileUpdateSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID").optional(),
  profile: z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    email: z.string().email("Invalid email format").optional(),
    phone: z
      .string()
      .regex(/^[\d\s\-\(\)\+]+$/, "Invalid phone format")
      .optional(),
    experience: z
      .object({
        years: z
          .number()
          .min(0, "Years cannot be negative")
          .max(50, "Years cannot exceed 50")
          .optional(),
        months: z
          .number()
          .min(0, "Months cannot be negative")
          .max(11, "Months cannot exceed 11")
          .optional(),
        description: z.string().max(500, "Description too long").optional(),
      })
      .optional(),
    skills: z
      .array(
        z.object({
          name: z.string().min(1, "Skill name cannot be empty"),
          level: z
            .enum(["Beginner", "Intermediate", "Advanced", "Expert"])
            .optional(),
          confidence: z
            .number()
            .min(0, "Confidence cannot be negative")
            .max(1, "Confidence cannot exceed 1")
            .optional(),
        })
      )
      .optional(),
    education: z
      .array(
        z.object({
          degree: z.string().min(1, "Degree cannot be empty"),
          institution: z.string().min(1, "Institution cannot be empty"),
          graduationYear: z
            .number()
            .min(1900, "Invalid graduation year")
            .max(new Date().getFullYear() + 10, "Invalid graduation year")
            .optional(),
          gpa: z
            .number()
            .min(0, "GPA cannot be negative")
            .max(4, "GPA cannot exceed 4")
            .optional(),
        })
      )
      .optional(),
    interests: z
      .array(z.string().min(1, "Interest cannot be empty"))
      .optional(),
    availability: z
      .object({
        startDate: z.string().datetime("Invalid date format").optional(),
        noticePeriod: z
          .number()
          .min(0, "Notice period cannot be negative")
          .max(365, "Notice period cannot exceed 365 days")
          .optional(),
        preferredSchedule: z
          .enum(["Full-time", "Part-time", "Flexible"])
          .optional(),
      })
      .optional(),
    salary: z
      .object({
        expected: z
          .number()
          .min(0, "Expected salary cannot be negative")
          .max(1000000, "Expected salary too high")
          .optional(),
        currency: z
          .string()
          .length(3, "Currency must be 3 characters")
          .optional(),
        negotiable: z.boolean().optional(),
      })
      .optional(),
    location: z
      .object({
        current: z
          .string()
          .min(1, "Current location cannot be empty")
          .optional(),
        willingToRelocate: z.boolean().optional(),
        preferredLocations: z
          .array(z.string().min(1, "Location cannot be empty"))
          .optional(),
      })
      .optional(),
  }),
  mergeStrategy: z.enum(["replace", "merge", "append"]).optional(),
  confidenceThreshold: z.number().min(0).max(1).optional(),
});

const ProfileQuerySchema = z.object({
  sessionId: z.string().uuid("Invalid session ID").optional(),
  includeConfidence: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  includeHistory: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  format: z.enum(["full", "summary", "minimal"]).optional(),
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

function createErrorResponse(
  error: ApiError,
  status: number = 400
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

function createSuccessResponse(data: any): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: 200 }
  );
}

// ============================================================================
// PROFILE VALIDATION
// ============================================================================

function validateProfile(profile: Partial<CandidateProfile>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field validation
  if (!profile.name && !profile.email) {
    errors.push("Either name or email is required");
  }

  // Email validation
  if (profile.email && !isValidEmail(profile.email)) {
    errors.push("Invalid email format");
  }

  // Phone validation
  if (profile.phone && !isValidPhone(profile.phone)) {
    errors.push("Invalid phone format");
  }

  // Experience validation
  if (profile.experience) {
    if (profile.experience.years && profile.experience.years < 0) {
      errors.push("Experience years cannot be negative");
    }
    if (
      profile.experience.months &&
      (profile.experience.months < 0 || profile.experience.months > 11)
    ) {
      errors.push("Experience months must be between 0 and 11");
    }
  }

  // Skills validation
  if (profile.skills) {
    const skillNames = new Set<string>();
    for (const skill of profile.skills) {
      if (skillNames.has(skill.name.toLowerCase())) {
        warnings.push(`Duplicate skill: ${skill.name}`);
      }
      skillNames.add(skill.name.toLowerCase());
    }
  }

  // Salary validation
  if (profile.salary && profile.salary.expected) {
    if (profile.salary.expected < 0) {
      errors.push("Expected salary cannot be negative");
    }
    if (profile.salary.expected > 1000000) {
      warnings.push("Expected salary seems unusually high");
    }
  }

  // Location validation
  if (profile.location && profile.location.preferredLocations) {
    if (profile.location.preferredLocations.length > 10) {
      warnings.push("Too many preferred locations (max 10)");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
}

// ============================================================================
// CONFIDENCE SCORING LOGIC
// ============================================================================

function calculateProfileConfidence(profile: CandidateProfile): number {
  let confidence = 0;
  let totalFactors = 0;

  // Factor 1: Basic Information (25%)
  if (profile.name) confidence += 0.1;
  if (profile.email) confidence += 0.1;
  if (profile.phone) confidence += 0.05;
  totalFactors += 0.25;

  // Factor 2: Experience Information (20%)
  if (profile.experience) {
    if (profile.experience.years > 0 || profile.experience.months > 0) {
      confidence += 0.15;
    }
    if (profile.experience.description) {
      confidence += 0.05;
    }
  }
  totalFactors += 0.2;

  // Factor 3: Skills Information (25%)
  if (profile.skills && profile.skills.length > 0) {
    confidence += Math.min(profile.skills.length * 0.05, 0.25);
  }
  totalFactors += 0.25;

  // Factor 4: Education Information (15%)
  if (profile.education && profile.education.length > 0) {
    confidence += Math.min(profile.education.length * 0.15, 0.15);
  }
  totalFactors += 0.15;

  // Factor 5: Additional Information (15%)
  if (profile.interests && profile.interests.length > 0) confidence += 0.05;
  if (profile.salary && profile.salary.expected > 0) confidence += 0.05;
  if (profile.location && profile.location.current) confidence += 0.05;
  totalFactors += 0.15;

  return totalFactors > 0 ? Math.min(confidence / totalFactors, 1) : 0;
}

function calculateSkillConfidence(skills: CandidateProfile["skills"]): number {
  if (!skills || skills.length === 0) return 0;

  const totalConfidence = skills.reduce(
    (sum, skill) => sum + (skill.confidence || 0.5),
    0
  );
  return totalConfidence / skills.length;
}

// ============================================================================
// PROFILE MERGING LOGIC
// ============================================================================

function mergeProfiles(
  existingProfile: CandidateProfile,
  newProfile: Partial<CandidateProfile>,
  strategy: "replace" | "merge" | "append" = "merge"
): CandidateProfile {
  const mergedProfile = { ...existingProfile };

  switch (strategy) {
    case "replace":
      // Replace all fields with new data
      Object.assign(mergedProfile, newProfile);
      break;

    case "merge":
      // Merge fields intelligently
      if (newProfile.name && !mergedProfile.name)
        mergedProfile.name = newProfile.name;
      if (newProfile.email && !mergedProfile.email)
        mergedProfile.email = newProfile.email;
      if (newProfile.phone && !mergedProfile.phone)
        mergedProfile.phone = newProfile.phone;

      // Merge experience (take the higher values)
      if (newProfile.experience) {
        mergedProfile.experience = {
          years: Math.max(
            mergedProfile.experience.years,
            newProfile.experience.years || 0
          ),
          months: Math.max(
            mergedProfile.experience.months,
            newProfile.experience.months || 0
          ),
          description:
            newProfile.experience.description ||
            mergedProfile.experience.description,
        };
      }

      // Merge skills (avoid duplicates, keep higher confidence)
      if (newProfile.skills) {
        const existingSkills = new Map(
          mergedProfile.skills.map((s) => [s.name.toLowerCase(), s])
        );
        for (const newSkill of newProfile.skills) {
          const existing = existingSkills.get(newSkill.name.toLowerCase());
          if (
            !existing ||
            (newSkill.confidence || 0) > (existing.confidence || 0)
          ) {
            existingSkills.set(newSkill.name.toLowerCase(), newSkill);
          }
        }
        mergedProfile.skills = Array.from(existingSkills.values());
      }

      // Merge education (avoid duplicates)
      if (newProfile.education) {
        const existingEducation = new Map(
          mergedProfile.education.map((e) => [e.degree + e.institution, e])
        );
        for (const newEducation of newProfile.education) {
          const key = newEducation.degree + newEducation.institution;
          if (!existingEducation.has(key)) {
            existingEducation.set(key, newEducation);
          }
        }
        mergedProfile.education = Array.from(existingEducation.values());
      }

      // Merge other fields
      if (newProfile.interests) {
        const existingInterests = new Set(
          mergedProfile.interests.map((i) => i.toLowerCase())
        );
        const newInterests = newProfile.interests.filter(
          (i) => !existingInterests.has(i.toLowerCase())
        );
        mergedProfile.interests = [...mergedProfile.interests, ...newInterests];
      }

      if (newProfile.salary && newProfile.salary.expected > 0) {
        mergedProfile.salary = newProfile.salary;
      }

      if (newProfile.location) {
        mergedProfile.location = {
          ...mergedProfile.location,
          ...newProfile.location,
        };
      }

      break;

    case "append":
      // Append new data to existing data
      if (newProfile.skills) {
        mergedProfile.skills = [...mergedProfile.skills, ...newProfile.skills];
      }
      if (newProfile.education) {
        mergedProfile.education = [
          ...mergedProfile.education,
          ...newProfile.education,
        ];
      }
      if (newProfile.interests) {
        mergedProfile.interests = [
          ...mergedProfile.interests,
          ...newProfile.interests,
        ];
      }
      break;
  }

  // Update confidence and timestamp
  mergedProfile.confidence = calculateProfileConfidence(mergedProfile);
  mergedProfile.lastUpdated = new Date();

  return mergedProfile;
}

// ============================================================================
// API HANDLERS
// ============================================================================

// GET: Retrieve current candidate profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const queryParams = {
      sessionId: searchParams.get("sessionId"),
      includeConfidence: searchParams.get("includeConfidence"),
      includeHistory: searchParams.get("includeHistory"),
      format: searchParams.get("format") as
        | "full"
        | "summary"
        | "minimal"
        | null,
    };

    const validationResult = ProfileQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return createErrorResponse(
        {
          code: "VALIDATION_ERROR",
          message: "Invalid query parameters",
          details: validationResult.error.errors,
          timestamp: new Date(),
        },
        400
      );
    }

    const { sessionId, includeConfidence, includeHistory, format } =
      validationResult.data;

    let profile: CandidateProfile | null = null;

    if (sessionId) {
      // Get profile from specific session
      const session = sessionManager.getSession(sessionId);
      if (!session) {
        return createErrorResponse(
          {
            code: "SESSION_NOT_FOUND",
            message: "Session not found",
            timestamp: new Date(),
          },
          404
        );
      }
      profile = session.candidateProfile;
    } else {
      // Get profile from current active session (if any)
      const activeSessions = sessionManager.getActiveSessions();
      if (activeSessions.length > 0) {
        profile = activeSessions[0].candidateProfile;
      }
    }

    if (!profile) {
      return createErrorResponse(
        {
          code: "PROFILE_NOT_FOUND",
          message: "No candidate profile found",
          timestamp: new Date(),
        },
        404
      );
    }

    // Format profile based on request
    let formattedProfile: any = profile;

    switch (format) {
      case "summary":
        formattedProfile = {
          name: profile.name,
          email: profile.email,
          experience: profile.experience,
          skills: profile.skills.slice(0, 5), // Top 5 skills
          confidence: profile.confidence,
        };
        break;

      case "minimal":
        formattedProfile = {
          name: profile.name,
          email: profile.email,
          confidence: profile.confidence,
        };
        break;

      default: // full
        formattedProfile = profile;
    }

    // Add confidence details if requested
    if (includeConfidence) {
      formattedProfile.confidenceDetails = {
        overall: profile.confidence,
        skills: calculateSkillConfidence(profile.skills),
        completeness: calculateProfileConfidence(profile),
        lastUpdated: profile.lastUpdated,
      };
    }

    // Add profile history if requested
    if (includeHistory) {
      // This would typically come from a database
      formattedProfile.history = {
        createdAt: profile.lastUpdated, // Simplified
        updatedAt: profile.lastUpdated,
        updateCount: 1, // Simplified
      };
    }

    const response: ApiResponse = {
      profile: formattedProfile,
      sessionId: sessionId || null,
      message: "Profile retrieved successfully",
    };

    return createSuccessResponse(response);
  } catch (error) {
    console.error("Profile retrieval error:", error);

    return createErrorResponse(
      {
        code: "PROFILE_RETRIEVAL_ERROR",
        message: "Failed to retrieve profile",
        details: error,
        timestamp: new Date(),
      },
      500
    );
  }
}

// PUT: Update candidate profile
export async function PUT(request: NextRequest) {
  try {
    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      return createErrorResponse(
        {
          code: "INVALID_JSON",
          message: "Invalid JSON in request body",
          details: error,
          timestamp: new Date(),
        },
        400
      );
    }

    const validationResult = ProfileUpdateSchema.safeParse(requestBody);
    if (!validationResult.success) {
      return createErrorResponse(
        {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: validationResult.error.errors,
          timestamp: new Date(),
        },
        400
      );
    }

    const {
      sessionId,
      profile: newProfileData,
      mergeStrategy,
      confidenceThreshold,
    } = validationResult.data;

    // Validate profile data
    const profileValidation = validateProfile(newProfileData);
    if (!profileValidation.isValid) {
      return createErrorResponse(
        {
          code: "PROFILE_VALIDATION_ERROR",
          message: "Profile validation failed",
          details: {
            errors: profileValidation.errors,
            warnings: profileValidation.warnings,
          },
          timestamp: new Date(),
        },
        400
      );
    }

    // Get current profile
    let currentProfile: CandidateProfile | null = null;
    let targetSessionId = sessionId;

    if (sessionId) {
      const session = sessionManager.getSession(sessionId);
      if (!session) {
        return createErrorResponse(
          {
            code: "SESSION_NOT_FOUND",
            message: "Session not found",
            timestamp: new Date(),
          },
          404
        );
      }
      currentProfile = session.candidateProfile;
    } else {
      // Use current active session
      const activeSessions = sessionManager.getActiveSessions();
      if (activeSessions.length > 0) {
        currentProfile = activeSessions[0].candidateProfile;
        targetSessionId = activeSessions[0].id;
      } else {
        return createErrorResponse(
          {
            code: "NO_ACTIVE_SESSION",
            message: "No active session found",
            timestamp: new Date(),
          },
          404
        );
      }
    }

    // Merge profiles
    const mergedProfile = mergeProfiles(
      currentProfile!,
      newProfileData,
      mergeStrategy
    );

    // Check confidence threshold
    if (confidenceThreshold && mergedProfile.confidence < confidenceThreshold) {
      return createErrorResponse(
        {
          code: "LOW_CONFIDENCE",
          message: "Profile confidence below threshold",
          details: {
            currentConfidence: mergedProfile.confidence,
            threshold: confidenceThreshold,
          },
          timestamp: new Date(),
        },
        400
      );
    }

    // Update session with new profile
    const session = sessionManager.getSession(targetSessionId!);
    if (session) {
      const updatedSession = {
        ...session,
        candidateProfile: mergedProfile,
        updatedAt: new Date(),
      };
      sessionManager.updateSession(targetSessionId!, updatedSession);
    }

    // Add warnings to response if any
    const response: ApiResponse = {
      profile: mergedProfile,
      sessionId: targetSessionId,
      message: "Profile updated successfully",
      warnings:
        profileValidation.warnings.length > 0
          ? profileValidation.warnings
          : undefined,
    };

    return createSuccessResponse(response);
  } catch (error) {
    console.error("Profile update error:", error);

    return createErrorResponse(
      {
        code: "PROFILE_UPDATE_ERROR",
        message: "Failed to update profile",
        details: error,
        timestamp: new Date(),
      },
      500
    );
  }
}

// ============================================================================
// OPTIONS HANDLER (for CORS)
// ============================================================================

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// ============================================================================
// PROFILE ANALYTICS
// ============================================================================

// POST: Analyze profile and provide insights
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "analyze") {
      // Parse request body for profile analysis
      let requestBody;
      try {
        requestBody = await request.json();
      } catch (error) {
        return createErrorResponse(
          {
            code: "INVALID_JSON",
            message: "Invalid JSON in request body",
            details: error,
            timestamp: new Date(),
          },
          400
        );
      }

      const { profile, jobRequirements } = requestBody;

      if (!profile) {
        return createErrorResponse(
          {
            code: "MISSING_PROFILE",
            message: "Profile is required for analysis",
            timestamp: new Date(),
          },
          400
        );
      }

      // Analyze profile against job requirements
      const analysis = analyzeProfileFit(profile, jobRequirements);

      const response: ApiResponse = {
        analysis,
        message: "Profile analysis completed",
      };

      return createSuccessResponse(response);
    }

    return createErrorResponse(
      {
        code: "INVALID_ACTION",
        message: "Invalid action specified",
        timestamp: new Date(),
      },
      400
    );
  } catch (error) {
    console.error("Profile analysis error:", error);

    return createErrorResponse(
      {
        code: "PROFILE_ANALYSIS_ERROR",
        message: "Failed to analyze profile",
        details: error,
        timestamp: new Date(),
      },
      500
    );
  }
}

function analyzeProfileFit(
  profile: CandidateProfile,
  jobRequirements?: any
): any {
  const analysis = {
    overallFit: 0,
    skillMatch: 0,
    experienceMatch: 0,
    recommendations: [] as string[],
    strengths: [] as string[],
    gaps: [] as string[],
  };

  // Calculate skill match
  if (jobRequirements?.skills && profile.skills) {
    const requiredSkills = jobRequirements.skills.map((s: string) =>
      s.toLowerCase()
    );
    const profileSkills = profile.skills.map((s) => s.name.toLowerCase());
    const matchedSkills = requiredSkills.filter((skill) =>
      profileSkills.includes(skill)
    );
    analysis.skillMatch = matchedSkills.length / requiredSkills.length;
  }

  // Calculate experience match
  if (jobRequirements?.experience && profile.experience) {
    const requiredYears = jobRequirements.experience.min || 0;
    const profileYears =
      profile.experience.years + profile.experience.months / 12;
    analysis.experienceMatch = Math.min(profileYears / requiredYears, 1);
  }

  // Generate recommendations
  if (analysis.skillMatch < 0.5) {
    analysis.recommendations.push(
      "Consider adding more relevant skills to your profile"
    );
  }
  if (analysis.experienceMatch < 0.8) {
    analysis.recommendations.push(
      "Consider gaining more experience in the required areas"
    );
  }

  // Calculate overall fit
  analysis.overallFit = (analysis.skillMatch + analysis.experienceMatch) / 2;

  return analysis;
}
