import { NextResponse } from "next/server";

import { ApiError, ErrorCode, ErrorSeverity } from "./types";

// ============================================================================
// ERROR CODES AND MESSAGES
// ============================================================================

export const ERROR_CODES = {
  // Validation Errors (400)
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_JSON: "INVALID_JSON",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  INVALID_FORMAT: "INVALID_FORMAT",
  INVALID_UUID: "INVALID_UUID",
  INVALID_EMAIL: "INVALID_EMAIL",
  INVALID_PHONE: "INVALID_PHONE",
  INVALID_DATE: "INVALID_DATE",
  INVALID_NUMBER: "INVALID_NUMBER",
  INVALID_BOOLEAN: "INVALID_BOOLEAN",
  INVALID_ENUM: "INVALID_ENUM",
  FIELD_TOO_LONG: "FIELD_TOO_LONG",
  FIELD_TOO_SHORT: "FIELD_TOO_SHORT",
  VALUE_TOO_HIGH: "VALUE_TOO_HIGH",
  VALUE_TOO_LOW: "VALUE_TOO_LOW",
  DUPLICATE_VALUE: "DUPLICATE_VALUE",

  // Authentication & Authorization Errors (401, 403)
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_API_KEY: "INVALID_API_KEY",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",

  // Resource Errors (404)
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  SESSION_NOT_FOUND: "SESSION_NOT_FOUND",
  PROFILE_NOT_FOUND: "PROFILE_NOT_FOUND",
  MESSAGE_NOT_FOUND: "MESSAGE_NOT_FOUND",
  JOB_NOT_FOUND: "JOB_NOT_FOUND",

  // Conflict Errors (409)
  RESOURCE_CONFLICT: "RESOURCE_CONFLICT",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  SESSION_INVALID: "SESSION_INVALID",
  PROFILE_CONFLICT: "PROFILE_CONFLICT",

  // Rate Limiting Errors (429)
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",

  // Server Errors (500)
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_API_ERROR: "EXTERNAL_API_ERROR",
  LLM_ERROR: "LLM_ERROR",
  CONVERSATION_ERROR: "CONVERSATION_ERROR",
  SESSION_CREATION_ERROR: "SESSION_CREATION_ERROR",
  SESSION_RETRIEVAL_ERROR: "SESSION_RETRIEVAL_ERROR",
  SESSION_UPDATE_ERROR: "SESSION_UPDATE_ERROR",
  SESSION_DELETION_ERROR: "SESSION_DELETION_ERROR",
  PROFILE_RETRIEVAL_ERROR: "PROFILE_RETRIEVAL_ERROR",
  PROFILE_UPDATE_ERROR: "PROFILE_UPDATE_ERROR",
  PROFILE_VALIDATION_ERROR: "PROFILE_VALIDATION_ERROR",
  PROFILE_ANALYSIS_ERROR: "PROFILE_ANALYSIS_ERROR",
  MESSAGE_PROCESSING_ERROR: "MESSAGE_PROCESSING_ERROR",

  // Business Logic Errors
  LOW_CONFIDENCE: "LOW_CONFIDENCE",
  INSUFFICIENT_DATA: "INSUFFICIENT_DATA",
  INVALID_ACTION: "INVALID_ACTION",
  NO_ACTIVE_SESSION: "NO_ACTIVE_SESSION",
  SESSION_VALIDATION_ERROR: "SESSION_VALIDATION_ERROR",
  SESSION_EXTENSION_ERROR: "SESSION_EXTENSION_ERROR",
  SESSION_COMPLETION_ERROR: "SESSION_COMPLETION_ERROR",
} as const;

// ============================================================================
// ERROR SEVERITY LEVELS
// ============================================================================

export const ERROR_SEVERITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

// ============================================================================
// HTTP STATUS CODE MAPPING
// ============================================================================

export const ERROR_STATUS_CODES: Record<ErrorCode, number> = {
  // Validation Errors
  VALIDATION_ERROR: 400,
  INVALID_JSON: 400,
  MISSING_REQUIRED_FIELD: 400,
  INVALID_FORMAT: 400,
  INVALID_UUID: 400,
  INVALID_EMAIL: 400,
  INVALID_PHONE: 400,
  INVALID_DATE: 400,
  INVALID_NUMBER: 400,
  INVALID_BOOLEAN: 400,
  INVALID_ENUM: 400,
  FIELD_TOO_LONG: 400,
  FIELD_TOO_SHORT: 400,
  VALUE_TOO_HIGH: 400,
  VALUE_TOO_LOW: 400,
  DUPLICATE_VALUE: 400,

  // Authentication & Authorization
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INVALID_API_KEY: 401,
  INSUFFICIENT_PERMISSIONS: 403,

  // Resource Not Found
  RESOURCE_NOT_FOUND: 404,
  SESSION_NOT_FOUND: 404,
  PROFILE_NOT_FOUND: 404,
  MESSAGE_NOT_FOUND: 404,
  JOB_NOT_FOUND: 404,

  // Conflicts
  RESOURCE_CONFLICT: 409,
  SESSION_EXPIRED: 409,
  SESSION_INVALID: 409,
  PROFILE_CONFLICT: 409,

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 429,
  TOO_MANY_REQUESTS: 429,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  DATABASE_ERROR: 500,
  EXTERNAL_API_ERROR: 500,
  LLM_ERROR: 500,
  CONVERSATION_ERROR: 500,
  SESSION_CREATION_ERROR: 500,
  SESSION_RETRIEVAL_ERROR: 500,
  SESSION_UPDATE_ERROR: 500,
  SESSION_DELETION_ERROR: 500,
  PROFILE_RETRIEVAL_ERROR: 500,
  PROFILE_UPDATE_ERROR: 500,
  PROFILE_VALIDATION_ERROR: 500,
  PROFILE_ANALYSIS_ERROR: 500,
  MESSAGE_PROCESSING_ERROR: 500,

  // Business Logic
  LOW_CONFIDENCE: 400,
  INSUFFICIENT_DATA: 400,
  INVALID_ACTION: 400,
  NO_ACTIVE_SESSION: 404,
  SESSION_VALIDATION_ERROR: 500,
  SESSION_EXTENSION_ERROR: 500,
  SESSION_COMPLETION_ERROR: 500,
};

// ============================================================================
// ERROR MESSAGE TEMPLATES
// ============================================================================

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Validation Errors
  VALIDATION_ERROR: "Invalid request data",
  INVALID_JSON: "Invalid JSON in request body",
  MISSING_REQUIRED_FIELD: "Required field is missing",
  INVALID_FORMAT: "Invalid data format",
  INVALID_UUID: "Invalid UUID format",
  INVALID_EMAIL: "Invalid email format",
  INVALID_PHONE: "Invalid phone format",
  INVALID_DATE: "Invalid date format",
  INVALID_NUMBER: "Invalid number format",
  INVALID_BOOLEAN: "Invalid boolean value",
  INVALID_ENUM: "Invalid enum value",
  FIELD_TOO_LONG: "Field value is too long",
  FIELD_TOO_SHORT: "Field value is too short",
  VALUE_TOO_HIGH: "Value is too high",
  VALUE_TOO_LOW: "Value is too low",
  DUPLICATE_VALUE: "Duplicate value detected",

  // Authentication & Authorization
  UNAUTHORIZED: "Authentication required",
  FORBIDDEN: "Access forbidden",
  INVALID_API_KEY: "Invalid API key",
  INSUFFICIENT_PERMISSIONS: "Insufficient permissions",

  // Resource Not Found
  RESOURCE_NOT_FOUND: "Resource not found",
  SESSION_NOT_FOUND: "Session not found",
  PROFILE_NOT_FOUND: "Profile not found",
  MESSAGE_NOT_FOUND: "Message not found",
  JOB_NOT_FOUND: "Job not found",

  // Conflicts
  RESOURCE_CONFLICT: "Resource conflict",
  SESSION_EXPIRED: "Session has expired",
  SESSION_INVALID: "Session is invalid",
  PROFILE_CONFLICT: "Profile conflict detected",

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: "Rate limit exceeded",
  TOO_MANY_REQUESTS: "Too many requests",

  // Server Errors
  INTERNAL_SERVER_ERROR: "Internal server error",
  DATABASE_ERROR: "Database error",
  EXTERNAL_API_ERROR: "External API error",
  LLM_ERROR: "Language model error",
  CONVERSATION_ERROR: "Conversation processing error",
  SESSION_CREATION_ERROR: "Failed to create session",
  SESSION_RETRIEVAL_ERROR: "Failed to retrieve session",
  SESSION_UPDATE_ERROR: "Failed to update session",
  SESSION_DELETION_ERROR: "Failed to delete session",
  PROFILE_RETRIEVAL_ERROR: "Failed to retrieve profile",
  PROFILE_UPDATE_ERROR: "Failed to update profile",
  PROFILE_VALIDATION_ERROR: "Profile validation failed",
  PROFILE_ANALYSIS_ERROR: "Failed to analyze profile",
  MESSAGE_PROCESSING_ERROR: "Failed to process message",

  // Business Logic
  LOW_CONFIDENCE: "Profile confidence below threshold",
  INSUFFICIENT_DATA: "Insufficient data provided",
  INVALID_ACTION: "Invalid action specified",
  NO_ACTIVE_SESSION: "No active session found",
  SESSION_VALIDATION_ERROR: "Session validation failed",
  SESSION_EXTENSION_ERROR: "Failed to extend session",
  SESSION_COMPLETION_ERROR: "Failed to complete session",
};

// ============================================================================
// ERROR HANDLER CLASS
// ============================================================================

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: Array<{
    timestamp: Date;
    error: ApiError;
    requestId?: string;
    userId?: string;
    endpoint?: string;
    method?: string;
  }> = [];

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // ========================================================================
  // ERROR CREATION
  // ========================================================================

  createError(
    code: ErrorCode,
    message?: string,
    details?: any,
    severity: ErrorSeverity = "medium"
  ): ApiError {
    return {
      code,
      message: message || ERROR_MESSAGES[code],
      details,
      severity,
      timestamp: new Date(),
    };
  }

  // ========================================================================
  // ERROR RESPONSE CREATION
  // ========================================================================

  createErrorResponse(
    code: ErrorCode,
    message?: string,
    details?: any,
    severity: ErrorSeverity = "medium",
    status?: number
  ): NextResponse {
    const error = this.createError(code, message, details, severity);
    const statusCode = status || ERROR_STATUS_CODES[code];

    // Log the error
    this.logError(error);

    return NextResponse.json(
      {
        success: false,
        error,
        requestId: this.generateRequestId(),
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }

  // ========================================================================
  // VALIDATION ERROR HANDLING
  // ========================================================================

  handleValidationError(validationErrors: any[]): NextResponse {
    const formattedErrors = validationErrors.map((error) => ({
      field: error.path?.join(".") || "unknown",
      message: error.message,
      value: error.received,
    }));

    return this.createErrorResponse(
      "VALIDATION_ERROR",
      "Request validation failed",
      { errors: formattedErrors },
      "medium"
    );
  }

  // ========================================================================
  // ZOD VALIDATION ERROR HANDLING
  // ========================================================================

  handleZodError(zodError: any): NextResponse {
    const formattedErrors = zodError.errors.map((error: any) => ({
      field: error.path.join("."),
      message: error.message,
      code: error.code,
      received: error.received,
    }));

    return this.createErrorResponse(
      "VALIDATION_ERROR",
      "Request validation failed",
      { errors: formattedErrors },
      "medium"
    );
  }

  // ========================================================================
  // EXCEPTION HANDLING
  // ========================================================================

  handleException(
    error: any,
    context?: {
      endpoint?: string;
      method?: string;
      requestId?: string;
      userId?: string;
    }
  ): NextResponse {
    console.error("Unhandled exception:", error);

    // Determine error type and create appropriate response
    if (error.name === "ValidationError") {
      return this.handleValidationError(error.errors);
    }

    if (error.name === "ZodError") {
      return this.handleZodError(error);
    }

    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      return this.createErrorResponse(
        "EXTERNAL_API_ERROR",
        "External service unavailable",
        { originalError: error.message },
        "high"
      );
    }

    if (error.code === "RATE_LIMIT_EXCEEDED") {
      return this.createErrorResponse(
        "RATE_LIMIT_EXCEEDED",
        "Rate limit exceeded",
        { retryAfter: error.retryAfter },
        "medium",
        429
      );
    }

    // Default to internal server error
    return this.createErrorResponse(
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred",
      { originalError: error.message },
      "critical"
    );
  }

  // ========================================================================
  // LOGGING
  // ========================================================================

  logError(
    error: ApiError,
    context?: {
      requestId?: string;
      userId?: string;
      endpoint?: string;
      method?: string;
    }
  ): void {
    const logEntry = {
      timestamp: new Date(),
      error,
      ...context,
    };

    this.errorLog.push(logEntry);

    // Console logging based on severity
    const logMessage = this.formatLogMessage(logEntry);

    switch (error.severity) {
      case "low":
        console.warn(logMessage);
        break;
      case "medium":
        console.error(logMessage);
        break;
      case "high":
        console.error("🚨 HIGH SEVERITY ERROR:", logMessage);
        break;
      case "critical":
        console.error("💥 CRITICAL ERROR:", logMessage);
        // In production, you might want to send alerts here
        break;
    }

    // Keep only last 1000 errors in memory
    if (this.errorLog.length > 1000) {
      this.errorLog = this.errorLog.slice(-1000);
    }
  }

  private formatLogMessage(logEntry: any): string {
    const { timestamp, error, requestId, endpoint, method } = logEntry;
    return `[${timestamp.toISOString()}] ${error.code}: ${
      error.message
    } - ${method} ${endpoint} (${requestId || "no-id"})`;
  }

  // ========================================================================
  // ERROR RETRIEVAL AND ANALYTICS
  // ========================================================================

  getErrorLog(limit: number = 100): any[] {
    return this.errorLog.slice(-limit);
  }

  getErrorStats(): {
    total: number;
    bySeverity: Record<ErrorSeverity, number>;
    byCode: Record<ErrorCode, number>;
    recentErrors: number;
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const bySeverity: Record<ErrorSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    const byCode: Record<ErrorCode, number> = {} as Record<ErrorCode, number>;
    let recentErrors = 0;

    this.errorLog.forEach((entry) => {
      // Count by severity
      bySeverity[entry.error.severity]++;

      // Count by code
      byCode[entry.error.code] = (byCode[entry.error.code] || 0) + 1;

      // Count recent errors
      if (entry.timestamp > oneHourAgo) {
        recentErrors++;
      }
    });

    return {
      total: this.errorLog.length,
      bySeverity,
      byCode,
      recentErrors,
    };
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ========================================================================
  // SUCCESS RESPONSE CREATION
  // ========================================================================

  createSuccessResponse(data: any, message?: string): NextResponse {
    return NextResponse.json(
      {
        success: true,
        data,
        message,
        requestId: this.generateRequestId(),
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export const errorHandler = ErrorHandler.getInstance();

export function createError(
  code: ErrorCode,
  message?: string,
  details?: any,
  severity?: ErrorSeverity
): ApiError {
  return errorHandler.createError(code, message, details, severity);
}

export function createErrorResponse(
  code: ErrorCode,
  message?: string,
  details?: any,
  severity?: ErrorSeverity,
  status?: number
): NextResponse {
  return errorHandler.createErrorResponse(
    code,
    message,
    details,
    severity,
    status
  );
}

export function handleException(
  error: any,
  context?: {
    endpoint?: string;
    method?: string;
    requestId?: string;
    userId?: string;
  }
): NextResponse {
  return errorHandler.handleException(error, context);
}

export function createSuccessResponse(
  data: any,
  message?: string
): NextResponse {
  return errorHandler.createSuccessResponse(data, message);
}
