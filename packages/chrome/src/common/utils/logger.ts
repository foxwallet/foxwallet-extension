import { isDev } from "./env";

const levels = ["info", "warn", "error"] as const;

type Level = (typeof levels)[number];

export class Logger {
  private shouldLogMap = {
    info: true,
    warn: true,
    error: true,
  };

  private readonly prefix: string;

  constructor(opt: { level?: Level; prefix?: string }) {
    const optLevel = opt.level ?? "info";
    const optPrefix = opt.prefix ?? "";
    this.prefix = optPrefix;

    const shouldLog = function (level: Level) {
      return levels.indexOf(level) >= levels.indexOf(optLevel);
    };

    levels.forEach((level) => {
      this.shouldLogMap[level] = isDev && shouldLog(level);
    });
  }

  log(...args: any[]) {
    if (this.shouldLogMap.info) {
      const formatArgs = [this.prefix, ...args];
      console.log(...formatArgs);
    }
  }

  info(...args: any[]) {
    if (this.shouldLogMap.info) {
      const formatArgs = [this.prefix, ...args];
      console.log(...formatArgs);
    }
  }

  warn(...args: any) {
    if (this.shouldLogMap.warn) {
      const formatArgs = [this.prefix, ...args];
      console.warn(...formatArgs);
    }
  }

  error(...args: any) {
    if (this.shouldLogMap.error) {
      const formatArgs = [this.prefix, ...args];
      console.error(...formatArgs);
    }
  }
}

export const logger = console;
