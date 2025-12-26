import crypto from "crypto";

type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

type LogEvent = {
  level: LogLevel;
  message: string;
  context?: LogContext;
  correlationId?: string;
};

function write(event: LogEvent) {
  const payload = {
    ts: new Date().toISOString(),
    level: event.level,
    msg: event.message,
    correlationId: event.correlationId,
    context: event.context
  };

  // Keep console usage centralized for easy redirection later.
  // eslint-disable-next-line no-console
  console[event.level === "debug" ? "log" : event.level](JSON.stringify(payload));
}

export function withCorrelationId(existing?: string): string {
  return existing ?? crypto.randomUUID();
}

export function logDebug(message: string, context?: LogContext, correlationId?: string) {
  write({ level: "debug", message, context, correlationId });
}

export function logInfo(message: string, context?: LogContext, correlationId?: string) {
  write({ level: "info", message, context, correlationId });
}

export function logWarn(message: string, context?: LogContext, correlationId?: string) {
  write({ level: "warn", message, context, correlationId });
}

export function logError(message: string, context?: LogContext, correlationId?: string) {
  write({ level: "error", message, context, correlationId });
}
