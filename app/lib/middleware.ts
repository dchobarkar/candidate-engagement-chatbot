import { NextRequest, NextResponse } from "next/server";

import { logger, logRequest, logResponse, timeAsyncOperation } from "./logger";
import { handleException, createErrorResponse } from "./error-handler";

// ============================================================================
// MIDDLEWARE TYPES
// ============================================================================

export interface MiddlewareContext {
  requestId: string;
  startTime: number;
  endpoint: string;
  method: string;
  userId?: string;
}

export interface MiddlewareConfig {
  enableLogging?: boolean;
  enableErrorHandling?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableRateLimiting?: boolean;
  enableCORS?: boolean;
  enableRequestValidation?: boolean;
}

// ============================================================================
// MIDDLEWARE UTILITIES
// ============================================================================

export class MiddlewareUtils {
  // ========================================================================
  // REQUEST LOGGING MIDDLEWARE
  // ========================================================================

  static withRequestLogging<
    T extends (...args: any[]) => Promise<NextResponse>
  >(handler: T, config: MiddlewareConfig = {}): T {
    return (async (...args: any[]) => {
      const request = args[0] as NextRequest;
      const context = this.createContext(request);

      if (config.enableLogging !== false) {
        logRequest(request, { requestId: context.requestId });
      }

      try {
        const response = await timeAsyncOperation(
          `${context.method} ${context.endpoint}`,
          () => handler(...args),
          { requestId: context.requestId }
        );

        if (config.enableLogging !== false) {
          const duration = Date.now() - context.startTime;
          logResponse(context.requestId, response.status, duration);
        }

        return response;
      } catch (error) {
        if (config.enableLogging !== false) {
          const duration = Date.now() - context.startTime;
          logger.logApiError(
            context.endpoint,
            context.method,
            context.requestId,
            error as Error
          );
          logResponse(context.requestId, 500, duration, { error: true });
        }

        if (config.enableErrorHandling !== false) {
          return handleException(error as Error, {
            endpoint: context.endpoint,
            method: context.method,
            requestId: context.requestId,
          });
        }

        throw error;
      }
    }) as T;
  }

  // ========================================================================
  // ERROR HANDLING MIDDLEWARE
  // ========================================================================

  static withErrorHandling<T extends (...args: any[]) => Promise<NextResponse>>(
    handler: T,
    config: MiddlewareConfig = {}
  ): T {
    return (async (...args: any[]) => {
      const request = args[0] as NextRequest;
      const context = this.createContext(request);

      try {
        return await handler(...args);
      } catch (error) {
        if (config.enableLogging !== false) {
          logger.logApiError(
            context.endpoint,
            context.method,
            context.requestId,
            error as Error
          );
        }

        if (config.enableErrorHandling !== false) {
          return handleException(error as Error, {
            endpoint: context.endpoint,
            method: context.method,
            requestId: context.requestId,
          });
        }

        throw error;
      }
    }) as T;
  }

  // ========================================================================
  // PERFORMANCE MONITORING MIDDLEWARE
  // ========================================================================

  static withPerformanceMonitoring<
    T extends (...args: any[]) => Promise<NextResponse>
  >(handler: T, config: MiddlewareConfig = {}): T {
    return (async (...args: any[]) => {
      const request = args[0] as NextRequest;
      const context = this.createContext(request);

      if (config.enablePerformanceMonitoring !== false) {
        return await timeAsyncOperation(
          `${context.method} ${context.endpoint}`,
          () => handler(...args),
          { requestId: context.requestId }
        );
      }

      return await handler(...args);
    }) as T;
  }

  // ========================================================================
  // CORS MIDDLEWARE
  // ========================================================================

  static withCORS<T extends (...args: any[]) => Promise<NextResponse>>(
    handler: T,
    config: MiddlewareConfig = {}
  ): T {
    return (async (...args: any[]) => {
      const request = args[0] as NextRequest;

      // Handle preflight requests
      if (request.method === "OPTIONS") {
        return new NextResponse(null, {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods":
              "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers":
              "Content-Type, Authorization, X-Requested-With",
            "Access-Control-Max-Age": "86400",
          },
        });
      }

      const response = await handler(...args);

      // Add CORS headers to response
      if (config.enableCORS !== false) {
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        );
        response.headers.set(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization, X-Requested-With"
        );
      }

      return response;
    }) as T;
  }

  // ========================================================================
  // RATE LIMITING MIDDLEWARE
  // ========================================================================

  static withRateLimiting<T extends (...args: any[]) => Promise<NextResponse>>(
    handler: T,
    config: MiddlewareConfig = {},
    rateLimitConfig: {
      windowMs: number;
      maxRequests: number;
      keyGenerator?: (request: NextRequest) => string;
    } = { windowMs: 60000, maxRequests: 100 }
  ): T {
    const rateLimitStore = new Map<
      string,
      { count: number; resetTime: number }
    >();

    return (async (...args: any[]) => {
      const request = args[0] as NextRequest;

      if (config.enableRateLimiting !== false) {
        const key =
          rateLimitConfig.keyGenerator?.(request) || this.getClientIP(request);
        const now = Date.now();
        const windowStart = now - rateLimitConfig.windowMs;

        const entry = rateLimitStore.get(key);
        if (entry && entry.resetTime > windowStart) {
          if (entry.count >= rateLimitConfig.maxRequests) {
            return createErrorResponse(
              "RATE_LIMIT_EXCEEDED",
              "Too many requests. Please try again later.",
              {
                retryAfter: Math.ceil((entry.resetTime - now) / 1000),
              },
              "medium",
              429
            );
          }
          entry.count++;
        } else {
          rateLimitStore.set(key, {
            count: 1,
            resetTime: now + rateLimitConfig.windowMs,
          });
        }

        // Clean up old entries
        for (const [k, v] of rateLimitStore.entries()) {
          if (v.resetTime <= windowStart) {
            rateLimitStore.delete(k);
          }
        }
      }

      return await handler(...args);
    }) as T;
  }

  // ========================================================================
  // REQUEST VALIDATION MIDDLEWARE
  // ========================================================================

  static withRequestValidation<
    T extends (...args: any[]) => Promise<NextResponse>
  >(handler: T, config: MiddlewareConfig = {}, validationSchema?: any): T {
    return (async (...args: any[]) => {
      const request = args[0] as NextRequest;

      if (config.enableRequestValidation !== false && validationSchema) {
        try {
          // Validate request body for POST/PUT/PATCH requests
          if (["POST", "PUT", "PATCH"].includes(request.method)) {
            const body = await request.json();
            const validationResult = validationSchema.safeParse(body);

            if (!validationResult.success) {
              return createErrorResponse(
                "VALIDATION_ERROR",
                "Request validation failed",
                { errors: validationResult.error.errors },
                "medium"
              );
            }
          }

          // Validate query parameters
          const url = new URL(request.url);
          const queryParams = Object.fromEntries(url.searchParams.entries());

          if (Object.keys(queryParams).length > 0) {
            // You could add query parameter validation here
            // const queryValidation = querySchema.safeParse(queryParams);
            // if (!queryValidation.success) { ... }
          }
        } catch (error) {
          return createErrorResponse(
            "INVALID_JSON",
            "Invalid JSON in request body",
            { error: (error as Error).message },
            "medium"
          );
        }
      }

      return await handler(...args);
    }) as T;
  }

  // ========================================================================
  // COMPOSITE MIDDLEWARE
  // ========================================================================

  static withAllMiddleware<T extends (...args: any[]) => Promise<NextResponse>>(
    handler: T,
    config: MiddlewareConfig = {},
    rateLimitConfig?: any,
    validationSchema?: any
  ): T {
    let wrappedHandler = handler;

    // Apply all middleware in order
    wrappedHandler = this.withRequestValidation(
      wrappedHandler,
      config,
      validationSchema
    );
    wrappedHandler = this.withRateLimiting(
      wrappedHandler,
      config,
      rateLimitConfig
    );
    wrappedHandler = this.withCORS(wrappedHandler, config);
    wrappedHandler = this.withPerformanceMonitoring(wrappedHandler, config);
    wrappedHandler = this.withErrorHandling(wrappedHandler, config);
    wrappedHandler = this.withRequestLogging(wrappedHandler, config);

    return wrappedHandler;
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  private static createContext(request: NextRequest): MiddlewareContext {
    const url = new URL(request.url);
    return {
      requestId: this.generateRequestId(),
      startTime: Date.now(),
      endpoint: url.pathname,
      method: request.method,
    };
  }

  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static getClientIP(request: NextRequest): string {
    return (
      request.ip ||
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown"
    );
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export const withRequestLogging = <
  T extends (...args: any[]) => Promise<NextResponse>
>(
  handler: T,
  config?: MiddlewareConfig
) => MiddlewareUtils.withRequestLogging(handler, config);

export const withErrorHandling = <
  T extends (...args: any[]) => Promise<NextResponse>
>(
  handler: T,
  config?: MiddlewareConfig
) => MiddlewareUtils.withErrorHandling(handler, config);

export const withPerformanceMonitoring = <
  T extends (...args: any[]) => Promise<NextResponse>
>(
  handler: T,
  config?: MiddlewareConfig
) => MiddlewareUtils.withPerformanceMonitoring(handler, config);

export const withCORS = <T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  config?: MiddlewareConfig
) => MiddlewareUtils.withCORS(handler, config);

export const withRateLimiting = <
  T extends (...args: any[]) => Promise<NextResponse>
>(
  handler: T,
  config?: MiddlewareConfig,
  rateLimitConfig?: any
) => MiddlewareUtils.withRateLimiting(handler, config, rateLimitConfig);

export const withRequestValidation = <
  T extends (...args: any[]) => Promise<NextResponse>
>(
  handler: T,
  config?: MiddlewareConfig,
  validationSchema?: any
) => MiddlewareUtils.withRequestValidation(handler, config, validationSchema);

export const withAllMiddleware = <
  T extends (...args: any[]) => Promise<NextResponse>
>(
  handler: T,
  config?: MiddlewareConfig,
  rateLimitConfig?: any,
  validationSchema?: any
) =>
  MiddlewareUtils.withAllMiddleware(
    handler,
    config,
    rateLimitConfig,
    validationSchema
  );

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const DEFAULT_MIDDLEWARE_CONFIG: MiddlewareConfig = {
  enableLogging: true,
  enableErrorHandling: true,
  enablePerformanceMonitoring: true,
  enableRateLimiting: true,
  enableCORS: true,
  enableRequestValidation: true,
};

export const DEFAULT_RATE_LIMIT_CONFIG = {
  windowMs: 60000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  keyGenerator: (request: NextRequest) => {
    return request.ip || request.headers.get("x-forwarded-for") || "unknown";
  },
};
