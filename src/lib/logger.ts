/* eslint-disable @typescript-eslint/no-explicit-any */
import { ILogger } from './interfaces';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  correlationId?: string;
}

export class Logger implements ILogger {
  private correlationId?: string;

  constructor(correlationId?: string) {
    this.correlationId = correlationId;
  }

  private format(level: LogLevel, message: string, context?: Record<string, any>): string {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      correlationId: this.correlationId,
    };
    return JSON.stringify(entry);
  }

  info(message: string, context?: Record<string, any>) {
    console.log(this.format('info', message, context));
  }

  warn(message: string, context?: Record<string, any>) {
    console.warn(this.format('warn', message, context));
  }

  error(message: string, context?: Record<string, any>) {
    console.error(this.format('error', message, context));
  }

  debug(message: string, context?: Record<string, any>) {
    console.debug(this.format('debug', message, context));
  }

  child(context: Record<string, any>) {
    // Basic child logger implementation - in a more advanced version, this would merge context
    return new Logger(this.correlationId);
  }
}

export const logger = new Logger();
