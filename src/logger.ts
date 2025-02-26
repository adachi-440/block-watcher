import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, label, prettyPrint, colorize } = format;

const baseFormats = [timestamp(), prettyPrint(), colorize()];

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

export const logger = createLogger({
  level: 'debug',
  format: combine(label({ label: 'watcher' }), ...baseFormats),
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'watcher.log' }),
  ],
});

logger.add(
  new transports.Console({
    format: combine(
      label({ label: 'watcher' }),
      ...baseFormats,
      myFormat
    ),
  })
);
