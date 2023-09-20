import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { format, transports } from 'winston';
const { combine, label, printf, timestamp } = format;

// Logger Label
const labelObj = {
  label: 'spo-api-example'
};

//------------------------------------------------------------------------------------------
// Ensure time stamps are in AZ time, but still formatted as ISO
// While this isn't totally necessary as I've switched the VM to AZ time, I'm keeping it
// for easy access for any future needs.
//------------------------------------------------------------------------------------------
// const timezoned = () => {
//   // 'sv-SE': It looks like there isn't a locale for ISO standards,
//   // so the next best thing is to use a locale for a place that uses ISO standards for time.
//   // This one is Sweden.
//   // Lithuanian ('lt') is another option
//   return new Date().toLocaleString('sv-SE', {
//     timeZone: 'US/Arizona'
//   });
// };

//------------------------------------------------------------------------------------------
// Custom log format
//------------------------------------------------------------------------------------------
const myFormat = printf(({ level, label, message, timestamp, stack }) => {
  if (stack) {
    return `${level}: ${timestamp}: ${stack}`;
  } else {
    return `${level}: ${timestamp}: ${message}`;
  }
});

//------------------------------------------------------------------------------------------
// Final formatter
//------------------------------------------------------------------------------------------
const winstonFormatter = combine(
  timestamp({
    //format: 'YYYY-MM-DD HH:mm:ss'
    //format: timezoned
    format: 'HH:mm:ss'
  }),
  label(labelObj),
  format.errors({ stack: true }),
  format.align(),
  format.padLevels(),
  myFormat
);

//------------------------------------------------------------------------------------------
// Define Transports
//------------------------------------------------------------------------------------------
const logPath: string = `logs/%DATE%`;
const files: string = '7d';
let winstonTransports: any[] = [
  new DailyRotateFile({
    level: 'error',
    filename: `${logPath}/%DATE%-errors.log`,
    maxFiles: files,
    format: winstonFormatter
  }),
  new DailyRotateFile({
    level: 'debug',
    filename: `${logPath}/%DATE%-debug.log`,
    maxFiles: files,
    format: winstonFormatter
  })
];

// Add console.log during dev
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local') {
  winstonTransports.push(
    new transports.Console({
      level: 'debug',
      format: combine(
        winston.format.colorize(),
        timestamp({
          //format: 'YYYY-MM-DD HH:mm:ss'
          //format: timezoned
          format: 'HH:mm:ss'
        }),
        label(labelObj),
        format.errors({ stack: true }),
        format.align(),
        format.padLevels(),
        myFormat
      )
    })
  );
}

//------------------------------------------------------------------------------------------
// Create final Logger object
//------------------------------------------------------------------------------------------
export const logger = winston.createLogger({
  transports: winstonTransports
});
