import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { sessionManager } from "../../lib/session-manager";
import {
  ConversationSession,
  SessionStatus,
  ApiError,
  ApiResponse,
} from "../../lib/types";

// ============================================================================
// INPUT VALIDATION SCHEMAS
// ============================================================================

const CreateSessionSchema = z.object({
  candidateProfile: z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      experience: z
        .object({
          years: z.number().min(0).optional(),
          months: z.number().min(0).optional(),
          description: z.string().optional(),
        })
        .optional(),
      skills: z
        .array(
          z.object({
            name: z.string(),
            level: z
              .enum(["Beginner", "Intermediate", "Advanced", "Expert"])
              .optional(),
            confidence: z.number().min(0).max(1).optional(),
          })
        )
        .optional(),
      location: z
        .object({
          current: z.string().optional(),
          willingToRelocate: z.boolean().optional(),
          preferredLocations: z.array(z.string()).optional(),
        })
        .optional(),
      salary: z
        .object({
          expected: z.number().min(0).optional(),
          currency: z.string().optional(),
          negotiable: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
  jobContext: z
    .object({
      id: z.string().optional(),
      title: z.string().optional(),
      company: z.string().optional(),
      location: z.string().optional(),
      requirements: z.array(z.string()).optional(),
      responsibilities: z.array(z.string()).optional(),
      salary: z
        .object({
          min: z.number().optional(),
          max: z.number().optional(),
          currency: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  metadata: z
    .object({
      source: z.string().optional(),
      userAgent: z.string().optional(),
      ipAddress: z.string().optional(),
      referrer: z.string().optional(),
      utmParams: z.record(z.string()).optional(),
    })
    .optional(),
});

const SessionQuerySchema = z.object({
  sessionId: z.string().uuid("Invalid session ID").optional(),
  status: z.enum(["active", "completed", "expired"]).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
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
// SESSION VALIDATION MIDDLEWARE
// ============================================================================

async function validateSessionAccess(sessionId: string): Promise<{
  valid: boolean;
  session?: ConversationSession;
  error?: ApiError;
}> {
  try {
    const session = sessionManager.getSession(sessionId);

    if (!session) {
      return {
        valid: false,
        error: {
          code: "SESSION_NOT_FOUND",
          message: "Session not found",
          timestamp: new Date(),
        },
      };
    }

    if (!sessionManager.validateSession(sessionId)) {
      return {
        valid: false,
        error: {
          code: "SESSION_INVALID",
          message: "Session is invalid or expired",
          timestamp: new Date(),
        },
      };
    }

    return { valid: true, session };
  } catch (error) {
    return {
      valid: false,
      error: {
        code: "SESSION_VALIDATION_ERROR",
        message: "Failed to validate session",
        details: error,
        timestamp: new Date(),
      },
    };
  }
}

// ============================================================================
// SESSION METADATA TRACKING
// ============================================================================

interface SessionMetadata {
  source?: string;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  utmParams?: Record<string, string>;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
}

const sessionMetadataStore = new Map<string, SessionMetadata>();

function trackSessionMetadata(
  sessionId: string,
  metadata: Partial<SessionMetadata>
): void {
  const existing = sessionMetadataStore.get(sessionId);

  if (existing) {
    existing.lastAccessed = new Date();
    existing.accessCount += 1;
    Object.assign(existing, metadata);
  } else {
    sessionMetadataStore.set(sessionId, {
      ...metadata,
      createdAt: new Date(),
      lastAccessed: new Date(),
      accessCount: 1,
    });
  }
}

function getSessionMetadata(sessionId: string): SessionMetadata | undefined {
  return sessionMetadataStore.get(sessionId);
}

// ============================================================================
// API HANDLERS
// ============================================================================

// POST: Create new conversation session
export async function POST(request: NextRequest) {
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

    const validationResult = CreateSessionSchema.safeParse(requestBody);
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

    const { candidateProfile, jobContext, metadata } = validationResult.data;

    // Create new session
    const newSession = sessionManager.createSession(
      candidateProfile,
      jobContext
    );

    // Track session metadata
    const clientIP =
      request.ip || request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || undefined;
    const referrer = request.headers.get("referer") || undefined;

    trackSessionMetadata(newSession.id, {
      source: metadata?.source,
      userAgent,
      ipAddress: clientIP,
      referrer,
      utmParams: metadata?.utmParams,
    });

    // Return success response
    const response: ApiResponse = {
      session: newSession,
      metadata: getSessionMetadata(newSession.id),
      message: "Session created successfully",
    };

    return createSuccessResponse(response);
  } catch (error) {
    console.error("Session creation error:", error);

    return createErrorResponse(
      {
        code: "SESSION_CREATION_ERROR",
        message: "Failed to create session",
        details: error,
        timestamp: new Date(),
      },
      500
    );
  }
}

// GET: Retrieve existing session by ID or list sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const queryParams = {
      sessionId: searchParams.get("sessionId"),
      status: searchParams.get("status") as SessionStatus | null,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : undefined,
      offset: searchParams.get("offset")
        ? parseInt(searchParams.get("offset")!)
        : undefined,
    };

    // Validate query parameters
    const validationResult = SessionQuerySchema.safeParse(queryParams);
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

    const { sessionId, status, limit, offset } = validationResult.data;

    // If sessionId is provided, retrieve specific session
    if (sessionId) {
      const sessionValidation = await validateSessionAccess(sessionId);
      if (!sessionValidation.valid) {
        return createErrorResponse(sessionValidation.error!, 404);
      }

      const session = sessionValidation.session!;

      // Track access metadata
      trackSessionMetadata(sessionId, {
        ipAddress:
          request.ip || request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || undefined,
      });

      const response: ApiResponse = {
        session,
        metadata: getSessionMetadata(sessionId),
        message: "Session retrieved successfully",
      };

      return createSuccessResponse(response);
    }

    // Otherwise, list sessions based on filters
    let sessions: ConversationSession[] = [];

    if (status) {
      switch (status) {
        case "active":
          sessions = sessionManager.getActiveSessions();
          break;
        case "completed":
          sessions = sessionManager
            .getAllSessions()
            .filter((s) => s.status === SessionStatus.COMPLETED);
          break;
        case "expired":
          sessions = sessionManager
            .getAllSessions()
            .filter((s) => s.status === SessionStatus.EXPIRED);
          break;
      }
    } else {
      sessions = sessionManager.getAllSessions();
    }

    // Apply pagination
    const startIndex = offset || 0;
    const endIndex = limit ? startIndex + limit : sessions.length;
    const paginatedSessions = sessions.slice(startIndex, endIndex);

    // Get metadata for each session
    const sessionsWithMetadata = paginatedSessions.map((session) => ({
      session,
      metadata: getSessionMetadata(session.id),
    }));

    const response: ApiResponse = {
      sessions: sessionsWithMetadata,
      pagination: {
        total: sessions.length,
        limit: limit || sessions.length,
        offset: startIndex,
        hasMore: endIndex < sessions.length,
      },
      message: "Sessions retrieved successfully",
    };

    return createSuccessResponse(response);
  } catch (error) {
    console.error("Session retrieval error:", error);

    return createErrorResponse(
      {
        code: "SESSION_RETRIEVAL_ERROR",
        message: "Failed to retrieve session(s)",
        details: error,
        timestamp: new Date(),
      },
      500
    );
  }
}

// DELETE: Clean up expired sessions or delete specific session
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const cleanupAll = searchParams.get("cleanup") === "true";

    if (sessionId) {
      // Delete specific session
      const sessionValidation = await validateSessionAccess(sessionId);
      if (!sessionValidation.valid) {
        return createErrorResponse(sessionValidation.error!, 404);
      }

      const deleted = sessionManager.deleteSession(sessionId);
      if (!deleted) {
        return createErrorResponse(
          {
            code: "SESSION_DELETION_ERROR",
            message: "Failed to delete session",
            timestamp: new Date(),
          },
          500
        );
      }

      // Clean up metadata
      sessionMetadataStore.delete(sessionId);

      const response: ApiResponse = {
        message: "Session deleted successfully",
        sessionId,
      };

      return createSuccessResponse(response);
    } else if (cleanupAll) {
      // Clean up all expired sessions
      const deletedCount = sessionManager.cleanupExpiredSessions();

      // Clean up metadata for deleted sessions
      const allSessions = sessionManager.getAllSessions();
      const activeSessionIds = new Set(allSessions.map((s) => s.id));

      for (const [sessionId, metadata] of sessionMetadataStore.entries()) {
        if (!activeSessionIds.has(sessionId)) {
          sessionMetadataStore.delete(sessionId);
        }
      }

      const response: ApiResponse = {
        message: "Expired sessions cleaned up successfully",
        deletedCount,
        totalSessions: sessionManager.getSessionCount(),
      };

      return createSuccessResponse(response);
    } else {
      return createErrorResponse(
        {
          code: "INVALID_REQUEST",
          message: "Either sessionId or cleanup=true parameter is required",
          timestamp: new Date(),
        },
        400
      );
    }
  } catch (error) {
    console.error("Session deletion error:", error);

    return createErrorResponse(
      {
        code: "SESSION_DELETION_ERROR",
        message: "Failed to delete session(s)",
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
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// ============================================================================
// HEALTH CHECK AND STATISTICS
// ============================================================================

// PATCH: Update session (extend expiry, update status, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return createErrorResponse(
        {
          code: "MISSING_SESSION_ID",
          message: "Session ID is required",
          timestamp: new Date(),
        },
        400
      );
    }

    // Parse request body
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

    const { action, ...params } = requestBody;

    switch (action) {
      case "extend":
        const hours = params.hours || 24;
        const extended = sessionManager.extendSession(sessionId, hours);
        if (!extended) {
          return createErrorResponse(
            {
              code: "SESSION_EXTENSION_ERROR",
              message: "Failed to extend session",
              timestamp: new Date(),
            },
            404
          );
        }
        break;

      case "complete":
        const completed = sessionManager.completeSession(sessionId);
        if (!completed) {
          return createErrorResponse(
            {
              code: "SESSION_COMPLETION_ERROR",
              message: "Failed to complete session",
              timestamp: new Date(),
            },
            404
          );
        }
        break;

      case "update":
        const updated = sessionManager.updateSession(sessionId, params);
        if (!updated) {
          return createErrorResponse(
            {
              code: "SESSION_UPDATE_ERROR",
              message: "Failed to update session",
              timestamp: new Date(),
            },
            404
          );
        }
        break;

      default:
        return createErrorResponse(
          {
            code: "INVALID_ACTION",
            message: "Invalid action specified",
            timestamp: new Date(),
          },
          400
        );
    }

    const response: ApiResponse = {
      message: `Session ${action} successful`,
      sessionId,
    };

    return createSuccessResponse(response);
  } catch (error) {
    console.error("Session update error:", error);

    return createErrorResponse(
      {
        code: "SESSION_UPDATE_ERROR",
        message: "Failed to update session",
        details: error,
        timestamp: new Date(),
      },
      500
    );
  }
}
