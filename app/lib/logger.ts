import { NextRequest } from "next/server";

// ============================================================================
// LOG LEVELS
// ============================================================================

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4,
}

export const LOG_LEVEL_NAMES = {
  [LogLevel.DEBUG]: "DEBUG",
  [LogLevel.INFO]: "INFO",
  [LogLevel.WARN]: "WARN",
  [LogLevel.ERROR]: "ERROR",
  [LogLevel.CRITICAL]: "CRITICAL",
};

// ============================================================================
// LOG ENTRY INTERFACE
// ============================================================================

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  requestId?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  duration?: number;
  error?: Error;
  stack?: string;
}

// ============================================================================
// LOGGER CLASS
// ============================================================================

export class Logger {
  private static instance: Logger;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize: number = 1000;
  private currentLogLevel: LogLevel = LogLevel.INFO;
  private enableConsoleOutput: boolean = true;
  private enableFileOutput: boolean = false;
  private logFilePath?: string;

  private constructor() {
    // Set log level from environment
    const envLogLevel = process.env.LOG_LEVEL?.toUpperCase();
    if (envLogLevel && envLogLevel in LogLevel) {
      this.currentLogLevel = LogLevel[envLogLevel as keyof typeof LogLevel];
    }

    this.enableConsoleOutput = process.env.NODE_ENV !== "test";
    this.enableFileOutput = process.env.LOG_TO_FILE === "true";
    this.logFilePath = process.env.LOG_FILE_PATH;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // ========================================================================
  // LOGGING METHODS
  // ========================================================================

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  critical(
    message: string,
    error?: Error,
    context?: Record<string, any>
  ): void {
    this.log(LogLevel.CRITICAL, message, context, error);
  }

  // ========================================================================
  // REQUEST LOGGING
  // ========================================================================

  logRequest(request: NextRequest, context?: Record<string, any>): string {
    const requestId = this.generateRequestId();
    const method = request.method;
    const url = request.url;
    const userAgent = request.headers.get("user-agent") || "unknown";
    const ip =
      request.ip || request.headers.get("x-forwarded-for") || "unknown";

    this.info("Request started", {
      requestId,
      method,
      url,
      userAgent,
      ip,
      ...context,
    });

    return requestId;
  }

  logResponse(
    requestId: string,
    statusCode: number,
    duration: number,
    context?: Record<string, any>
  ): void {
    const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const message = `Request completed - ${statusCode}`;

    this.log(level, message, {
      requestId,
      statusCode,
      duration: `${duration}ms`,
      ...context,
    });
  }

  // ========================================================================
  // API LOGGING
  // ========================================================================

  logApiCall(
    endpoint: string,
    method: string,
    requestId: string,
    context?: Record<string, any>
  ): void {
    this.info("API call", {
      endpoint,
      method,
      requestId,
      ...context,
    });
  }

  logApiError(
    endpoint: string,
    method: string,
    requestId: string,
    error: Error,
    context?: Record<string, any>
  ): void {
    this.error("API error", error, {
      endpoint,
      method,
      requestId,
      ...context,
    });
  }

  // ========================================================================
  // SESSION LOGGING
  // ========================================================================

  logSessionCreated(sessionId: string, context?: Record<string, any>): void {
    this.info("Session created", {
      sessionId,
      ...context,
    });
  }

  logSessionAccessed(sessionId: string, context?: Record<string, any>): void {
    this.debug("Session accessed", {
      sessionId,
      ...context,
    });
  }

  logSessionExpired(sessionId: string, context?: Record<string, any>): void {
    this.warn("Session expired", {
      sessionId,
      ...context,
    });
  }

  logSessionDeleted(sessionId: string, context?: Record<string, any>): void {
    this.info("Session deleted", {
      sessionId,
      ...context,
    });
  }

  // ========================================================================
  // PROFILE LOGGING
  // ========================================================================

  logProfileUpdated(
    sessionId: string,
    profileId: string,
    context?: Record<string, any>
  ): void {
    this.info("Profile updated", {
      sessionId,
      profileId,
      ...context,
    });
  }

  logProfileValidationFailed(
    sessionId: string,
    errors: string[],
    context?: Record<string, any>
  ): void {
    this.warn("Profile validation failed", {
      sessionId,
      errors,
      ...context,
    });
  }

  // ========================================================================
  // CONVERSATION LOGGING
  // ========================================================================

  logMessageProcessed(
    sessionId: string,
    messageId: string,
    processingTime: number,
    context?: Record<string, any>
  ): void {
    this.info("Message processed", {
      sessionId,
      messageId,
      processingTime: `${processingTime}ms`,
      ...context,
    });
  }

  logConversationError(
    sessionId: string,
    error: Error,
    context?: Record<string, any>
  ): void {
    this.error("Conversation error", error, {
      sessionId,
      ...context,
    });
  }

  // ========================================================================
  // PERFORMANCE LOGGING
  // ========================================================================

  logPerformance(
    operation: string,
    duration: number,
    context?: Record<string, any>
  ): void {
    const level = duration > 5000 ? LogLevel.WARN : LogLevel.DEBUG;
    const message = `Performance: ${operation} took ${duration}ms`;

    this.log(level, message, {
      operation,
      duration,
      ...context,
    });
  }

  // ========================================================================
  // CORE LOGGING LOGIC
  // ========================================================================

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    if (level < this.currentLogLevel) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      error,
      stack: error?.stack,
    };

    // Add to buffer
    this.logBuffer.push(logEntry);

    // Keep buffer size manageable
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
    }

    // Output to console
    if (this.enableConsoleOutput) {
      this.outputToConsole(logEntry);
    }

    // Output to file
    if (this.enableFileOutput && this.logFilePath) {
      this.outputToFile(logEntry);
    }
  }

  private outputToConsole(logEntry: LogEntry): void {
    const timestamp = logEntry.timestamp.toISOString();
    const levelName = LOG_LEVEL_NAMES[logEntry.level];
    const contextStr = logEntry.context
      ? ` ${JSON.stringify(logEntry.context)}`
      : "";
    const errorStr = logEntry.error ? `\nError: ${logEntry.error.message}` : "";
    const stackStr = logEntry.stack ? `\nStack: ${logEntry.stack}` : "";

    const logMessage = `[${timestamp}] ${levelName}: ${logEntry.message}${contextStr}${errorStr}${stackStr}`;

    switch (logEntry.level) {
      case LogLevel.DEBUG:
        console.debug(logMessage);
        break;
      case LogLevel.INFO:
        console.info(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.ERROR:
        console.error(logMessage);
        break;
      case LogLevel.CRITICAL:
        console.error("🚨 CRITICAL:", logMessage);
        break;
    }
  }

  private outputToFile(logEntry: LogEntry): void {
    // In a real implementation, you would write to a file
    // For now, we'll just simulate it
    const logLine =
      JSON.stringify({
        timestamp: logEntry.timestamp.toISOString(),
        level: LOG_LEVEL_NAMES[logEntry.level],
        message: logEntry.message,
        context: logEntry.context,
        error: logEntry.error?.message,
        stack: logEntry.stack,
      }) + "\n";

    // In production, you might use fs.appendFileSync or a logging service
    // fs.appendFileSync(this.logFilePath!, logLine);
  }

  // ========================================================================
  // LOG RETRIEVAL AND ANALYTICS
  // ========================================================================

  getLogs(level?: LogLevel, limit: number = 100): LogEntry[] {
    let filteredLogs = this.logBuffer;

    if (level !== undefined) {
      filteredLogs = filteredLogs.filter((log) => log.level >= level);
    }

    return filteredLogs.slice(-limit);
  }

  getLogStats(): {
    total: number;
    byLevel: Record<string, number>;
    recentLogs: number;
    averageLogsPerMinute: number;
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    const byLevel: Record<string, number> = {};
    let recentLogs = 0;
    let logsInLastMinute = 0;

    this.logBuffer.forEach((log) => {
      // Count by level
      const levelName = LOG_LEVEL_NAMES[log.level];
      byLevel[levelName] = (byLevel[levelName] || 0) + 1;

      // Count recent logs
      if (log.timestamp > oneHourAgo) {
        recentLogs++;
      }

      // Count logs in last minute
      if (log.timestamp > oneMinuteAgo) {
        logsInLastMinute++;
      }
    });

    return {
      total: this.logBuffer.length,
      byLevel,
      recentLogs,
      averageLogsPerMinute: logsInLastMinute,
    };
  }

  clearLogs(): void {
    this.logBuffer = [];
  }

  // ========================================================================
  // CONFIGURATION
  // ========================================================================

  setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
  }

  setConsoleOutput(enabled: boolean): void {
    this.enableConsoleOutput = enabled;
  }

  setFileOutput(enabled: boolean, filePath?: string): void {
    this.enableFileOutput = enabled;
    if (filePath) {
      this.logFilePath = filePath;
    }
  }

  setMaxBufferSize(size: number): void {
    this.maxBufferSize = size;
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ========================================================================
  // PERFORMANCE MONITORING
  // ========================================================================

  timeOperation<T>(
    operation: string,
    fn: () => T | Promise<T>,
    context?: Record<string, any>
  ): T | Promise<T> {
    const startTime = Date.now();

    try {
      const result = fn();

      if (result instanceof Promise) {
        return result.finally(() => {
          const duration = Date.now() - startTime;
          this.logPerformance(operation, duration, context);
        });
      } else {
        const duration = Date.now() - startTime;
        this.logPerformance(operation, duration, context);
        return result;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logPerformance(operation, duration, { ...context, error: true });
      throw error;
    }
  }

  async timeAsyncOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.logPerformance(operation, duration, context);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logPerformance(operation, duration, { ...context, error: true });
      throw error;
    }
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export const logger = Logger.getInstance();

export const logDebug = (message: string, context?: Record<string, any>) =>
  logger.debug(message, context);
export const logInfo = (message: string, context?: Record<string, any>) =>
  logger.info(message, context);
export const logWarn = (message: string, context?: Record<string, any>) =>
  logger.warn(message, context);
export const logError = (
  message: string,
  error?: Error,
  context?: Record<string, any>
) => logger.error(message, error, context);
export const logCritical = (
  message: string,
  error?: Error,
  context?: Record<string, any>
) => logger.critical(message, error, context);

export const logRequest = (
  request: NextRequest,
  context?: Record<string, any>
) => logger.logRequest(request, context);
export const logResponse = (
  requestId: string,
  statusCode: number,
  duration: number,
  context?: Record<string, any>
) => logger.logResponse(requestId, statusCode, duration, context);

export const timeOperation = <T>(
  operation: string,
  fn: () => T | Promise<T>,
  context?: Record<string, any>
) => logger.timeOperation(operation, fn, context);
export const timeAsyncOperation = <T>(
  operation: string,
  fn: () => Promise<T>,
  context?: Record<string, any>
) => logger.timeAsyncOperation(operation, fn, context);
