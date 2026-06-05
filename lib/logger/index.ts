/**
 * Unified logger: Pino (structured logging) + Sentry (error reporting)
 *
 * - Development: pretty-printed colored output via pino-pretty
 * - Production stdout: JSON output (captured by cloud platform log aggregators)
 * - Production with LOG_DIR set: adds file rotation via pino-roll
 * - Edge runtime: JSON to stdout only (no worker threads / file system)
 *
 * Sentry integration:
 * - warn: adds breadcrumb
 * - error / fatal: captures exception and reports to Sentry
 */

// Sentry is initialized via instrumentation.ts + sentry.*.config.ts
// All calls here are no-ops if NEXT_PUBLIC_SENTRY_DSN is not configured
import * as Sentry from "@sentry/nextjs";
import pino, { type Logger } from "pino";

const LOG_LEVEL = (process.env.LOG_LEVEL ?? "info") as pino.Level;
const IS_DEV = process.env.NODE_ENV === "development";
const IS_EDGE = process.env.NEXT_RUNTIME === "edge";
const LOG_DIR = process.env.LOG_DIR;

function buildBaseOptions(name: string): pino.LoggerOptions {
  return {
    level: LOG_LEVEL,
    base: { name },
    timestamp: pino.stdTimeFunctions.isoTime,
    serializers: {
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err,
    },
    formatters: {
      level: (label) => ({ level: label }),
    },
  };
}

function createPinoLogger(name: string): Logger {
  const options = buildBaseOptions(name);

  // Edge runtime: no worker threads, just plain JSON stdout
  if (IS_EDGE) {
    return pino(options);
  }

  // Development: pretty-printed console output
  if (IS_DEV) {
    const transport = pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
      },
    });
    return pino(options, transport);
  }

  // Production Node.js: JSON stdout by default; add file rotation if LOG_DIR is set
  if (LOG_DIR) {
    const path = require("path") as typeof import("path");
    const targets: pino.TransportTargetOptions[] = [
      {
        target: "pino-roll",
        options: {
          file: path.join(LOG_DIR, name),
          frequency: "daily",
          size: parseInt(process.env.LOG_MAX_SIZE ?? String(10 * 1024 * 1024), 10),
          mkdir: true,
          extension: ".log",
          dateFormat: "yyyy-MM-dd",
        },
        level: LOG_LEVEL,
      },
    ];
    const transport = pino.transport({ targets });
    return pino(options, transport);
  }

  // Default production: JSON to stdout
  return pino(options);
}

export interface AppLogger {
  trace(obj: object, msg?: string): void;
  debug(obj: object, msg?: string): void;
  info(obj: object, msg?: string): void;
  warn(obj: object, msg?: string): void;
  error(err: Error | object, msg?: string): void;
  fatal(err: Error | object, msg?: string): void;
  /** Manually capture an error with extra context */
  captureError(error: Error, context?: Record<string, unknown>): void;
  /** Access the underlying pino logger for child loggers etc. */
  pino: Logger;
}

export function createLogger(name: string): AppLogger {
  const logger = createPinoLogger(name);

  const appLogger: AppLogger = {
    pino: logger,

    trace: (obj, msg) => logger.trace(obj, msg),
    debug: (obj, msg) => logger.debug(obj, msg),
    info: (obj, msg) => logger.info(obj, msg),

    warn: (obj, msg) => {
      logger.warn(obj, msg);
      Sentry.addBreadcrumb({
        category: name,
        message: msg ?? "Warning",
        level: "warning",
        data: obj,
      });
    },

    error: (errOrObj, msg) => {
      if (errOrObj instanceof Error) {
        logger.error({ err: errOrObj }, msg ?? errOrObj.message);
        Sentry.captureException(errOrObj, {
          tags: { logger: name },
          extra: { message: msg },
        });
      } else {
        logger.error(errOrObj, msg);
        const nested = (errOrObj as Record<string, unknown>).err ?? (errOrObj as Record<string, unknown>).error;
        if (nested instanceof Error) {
          Sentry.captureException(nested, {
            tags: { logger: name },
            extra: { ...(errOrObj as object), message: msg },
          });
        }
      }
    },

    fatal: (errOrObj, msg) => {
      if (errOrObj instanceof Error) {
        logger.fatal({ err: errOrObj }, msg ?? errOrObj.message);
        Sentry.captureException(errOrObj, {
          level: "fatal",
          tags: { logger: name },
          extra: { message: msg },
        });
      } else {
        logger.fatal(errOrObj, msg);
      }
    },

    captureError: (error, context) => {
      logger.error({ err: error, ...context }, error.message);
      Sentry.captureException(error, {
        tags: { logger: name },
        extra: context,
      });
    },
  };

  return appLogger;
}

const loggerCache = new Map<string, AppLogger>();

/** Get or create a cached logger by name */
export function getLogger(name: string): AppLogger {
  if (!loggerCache.has(name)) {
    loggerCache.set(name, createLogger(name));
  }
  return loggerCache.get(name)!;
}
