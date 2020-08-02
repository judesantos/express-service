/**
 * Setup the winston logger.
 *
 * Documentation: https://github.com/winstonjs/winston
 */

import { createLogger, format, transports } from "winston";
import env from "../../.env";

const moment = require("moment");

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
  level: env.logging.logLevel,
});

const _tsFormat = () => moment().format("YYYY-MM-DD hh:mm:ss").trim();
const _format = format.printf(({ level, message, timestamp, ms }) => {
  return `${timestamp} ${ms} ${level}: ${message}`;
});

/**
 * For production write to all logs with level `info` and below
 * to `combined.log. Write all logs error (and below) to `error.log`.
 * For development, print to the console.
 */
if (process.env.NODE_ENV === "production") {
  const fileFormat = format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.json(),
    format.ms()
  );
  const errTransport = new File({
    filename: env.logging.errorLogPath,
    format: fileFormat,
    level: "error",
  });
  const infoTransport = new File({
    filename: env.logging.commonLogPath,
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
    format: format.combine(
      format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      format.ms(),
      _format
    ),
  });
  logger.add(consoleTransport);
}

export default logger;
