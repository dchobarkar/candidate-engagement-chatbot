import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { sessionManager } from "../../lib/session-manager";
import { ConversationManager } from "../../lib/conversation-manager";
import { DataExtractor } from "../../lib/data-extractor";
import { LLMClient } from "../../lib/llm-client";
import {
  ChatMessage,
  MessageRole,
  ApiError,
  ApiResponse,
} from "../../lib/types";

// ============================================================================
// INPUT VALIDATION SCHEMAS
// ============================================================================

const ChatRequestSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message too long"),
  sessionId: z.string().uuid("Invalid session ID"),
  metadata: z
    .object({
      timestamp: z.string().optional(),
      userAgent: z.string().optional(),
      ipAddress: z.string().optional(),
    })
    .optional(),
});

// ============================================================================
// RATE LIMITING
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  // Increment count
  entry.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.count,
    resetTime: entry.resetTime,
  };
}

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

async function validateSession(
  sessionId: string
): Promise<{ valid: boolean; session?: any; error?: ApiError }> {
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
// MAIN CHAT API HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // ========================================================================
    // RATE LIMITING
    // ========================================================================
    const clientIP =
      request.ip || request.headers.get("x-forwarded-for") || "unknown";
    const rateLimitResult = checkRateLimit(clientIP);

    if (!rateLimitResult.allowed) {
      return createErrorResponse(
        {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later.",
          details: {
            remaining: rateLimitResult.remaining,
            resetTime: rateLimitResult.resetTime,
          },
          timestamp: new Date(),
        },
        429
      );
    }

    // ========================================================================
    // REQUEST VALIDATION
    // ========================================================================
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

    // Validate request schema
    const validationResult = ChatRequestSchema.safeParse(requestBody);
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

    const { message, sessionId, metadata } = validationResult.data;

    // ========================================================================
    // SESSION VALIDATION
    // ========================================================================
    const sessionValidation = await validateSession(sessionId);
    if (!sessionValidation.valid) {
      return createErrorResponse(sessionValidation.error!, 400);
    }

    const session = sessionValidation.session!;

    // ========================================================================
    // CONVERSATION PROCESSING
    // ========================================================================
    try {
      // Initialize conversation manager
      const conversationManager = new ConversationManager(session);

      // Initialize LLM client
      const llmClient = new LLMClient();

      // Initialize data extractor
      const dataExtractor = new DataExtractor();

      // Process the message through conversation manager
      const conversationResult = await conversationManager.processMessage(
        message,
        {
          llmClient,
          dataExtractor,
          sessionManager,
        }
      );

      // ========================================================================
      // RESPONSE PROCESSING
      // ========================================================================
      const assistantMessage: ChatMessage = {
        id: conversationResult.messageId,
        content: conversationResult.response,
        role: MessageRole.ASSISTANT,
        timestamp: new Date(),
        sessionId: sessionId,
        metadata: {
          confidence: conversationResult.confidence,
          extractedInfo: conversationResult.extractedInfo,
          processingTime: Date.now() - startTime,
        },
      };

      // Update session with new message
      const updatedSession = {
        ...session,
        messages: [...session.messages, assistantMessage],
        updatedAt: new Date(),
      };

      // Save updated session
      sessionManager.updateSession(sessionId, updatedSession);

      // ========================================================================
      // SUCCESS RESPONSE
      // ========================================================================
      const response: ApiResponse = {
        message: assistantMessage,
        sessionId: sessionId,
        confidence: conversationResult.confidence,
        extractedInfo: conversationResult.extractedInfo,
        processingTime: Date.now() - startTime,
        rateLimit: {
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
        },
      };

      return createSuccessResponse(response);
    } catch (conversationError) {
      console.error("Conversation processing error:", conversationError);

      return createErrorResponse(
        {
          code: "CONVERSATION_ERROR",
          message: "Failed to process conversation",
          details: conversationError,
          timestamp: new Date(),
        },
        500
      );
    }
  } catch (error) {
    console.error("Chat API error:", error);

    return createErrorResponse(
      {
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// ============================================================================
// HEALTH CHECK (for monitoring)
// ============================================================================

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      endpoints: {
        chat: "POST /api/chat",
        session: "GET/POST/DELETE /api/session",
        profile: "GET/PUT /api/candidate-profile",
      },
    },
    { status: 200 }
  );
}
