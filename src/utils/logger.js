const { addColors, transports, format, createLogger } = require("winston");
const { combine, timestamp, colorize, printf, errors, json } = format;
require("dotenv").config();

const logLevels = {
  levels: { critical: 0, error: 1, warning: 2, debug: 3, info: 4 },
  colors: {
    critical: "bold magenta",
    error: "bold red",
    warning: "bold yellow",
    info: "bold blue",
    debug: "bold green",
  },
};

const myFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

addColors(logLevels.colors);

// const transport =
//   process.env.NODE_ENV === "production"
//     ? new transports.Console({
//         format: combine(colorize(), simple()),
//       })
//     : new transports.File({ filename: "file.log" });

const devLogger = () => {
  console.log(process.env.NODE_ENV);
  return createLogger({
    levels: logLevels.levels,
    format: combine(
    //   colorize(),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      errors({ stack: true, stackTrace: true, message: true, }),
      myFormat
    ),
    transports: [new transports.Console(), new transports.File({ filename: "file.log" })],
  });
};

const prodLogger = () => {
  return createLogger({
    levels: logLevels.levels,
    format: combine(timestamp(), format.errors({ stack: true }), json()),
    transports: [new transports.Console(), new transports.File({ filename: "file.log" })],
  });
};

module.exports = {
  logger: process.env.NODE_ENV === "production" ? prodLogger() : devLogger(),
};
