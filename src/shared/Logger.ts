/**
 * Setup the winston logger.
 *
 * Documentation: https://github.com/winstonjs/winston
 */

import { createLogger, format, transports } from "winston";

// Import Functions
const { File, Console } = transports;

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

// Init Logger
const logger = createLogger({
  level: "info",
});

const _format = format.printf(({ level, message, timestamp, ms }) => {
  return `${timestamp} ${level}: ${message} - ${ms}`;
});

/**
 * For production write to all logs with level `info` and below
 * to `combined.log. Write all logs error (and below) to `error.log`.
 * For development, print to the console.
 */
if (process.env.NODE_ENV === "production") {
  const fileFormat = format.combine(
    format.timestamp(),
    format.json(),
    format.ms()
  );
  const errTransport = new File({
    filename: "./logs/error.log",
    format: fileFormat,
    level: "error",
  });
  const infoTransport = new File({
    filename: "./logs/combined.log",
    format: fileFormat,
  });
  logger.add(errTransport);
  logger.add(infoTransport);
} else {
  const errorStackFormat = format((info) => {
    if (info.stack) {
      // tslint:disable-next-line:no-console
      console.log(info.stack);
      return false;
    }
    return info;
  });
  const consoleTransport = new Console({
    format: format.combine(format.timestamp(), format.ms(), _format),
  });
  logger.add(consoleTransport);
}

export default logger;
