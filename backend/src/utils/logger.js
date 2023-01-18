const winston = require('winston');
require('winston-daily-rotate-file');
require('winston-mongodb');
const path = require('path');
const PROJECT_ROOT = path.join(__dirname, '..');

const highlight = require('cli-highlight').highlight;
const arrow = '\u276F\u276F\u25B6';

const logConfig = {
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.label({
      label: `Label🏷️`,
    }),
    winston.format.timestamp({
      format: 'DD-MMM-YYYY HH:mm:ss',
    }),
    winston.format.align(),
    winston.format.printf(
      (info) =>{
        return `${info.level}: ${info.label} : ${[info.timestamp]}: ${info.message}`
      } 
    )
  ),
};

// const options = {
//   file: {
//     level: 'info',
//     filename: `${PROJECT_ROOT}/logs/app.log`,
//     handleExceptions: true,
//     json: true,
//     maxSize: 5242880, // 5MB
//     maxFiles: 5,
//     colorize: false,
//   },
//   errorFile: {
//     level: 'error',
//     filename: `${PROJECT_ROOT}/logs/error.log`,
//     handleExceptions: true,
//     json: true,
//     maxSize: 5242880, // 5MB
//     maxFiles: 5,
//     colorize: false,
//   },
//   console: {
//     level: 'debug',
//     handleExceptions: true,
//     json: false,
//     colorize: true,
//   },
// };

const logger = winston.createLogger({
  // File transport

  transports: [
    // Daily Rotation File
    new winston.transports.DailyRotateFile({
      filename: `${PROJECT_ROOT}/logs/logs-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '2000m',
      maxFiles: '60d',
    }),

    // Normal Files
    /*
    new winston.transports.File({
      level: 'info',
      filename: `${PROJECT_ROOT}/logs/server-%DATE%.log`,
      handleExceptions: true,
      json: true,
      maxSize: 5242880, // 5MB
      maxFiles: 5,
      colorize: true,
    }),
    new winston.transports.File({
      level: 'error',
      filename: `${PROJECT_ROOT}/logs/errors-%DATE%.log`,
      handleExceptions: true,
      json: true,
      maxSize: 5242880, // 5MB
      maxFiles: 5,
      colorize: true,
    }),
    */

    // Console Log
    // new winston.transports.Console(logConfig),

    // MongoDB Transport
    new winston.transports.MongoDB({
      level: 'error',
      // mongo database connection link
      db: process.env.MONGO_URI,
      options: {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      },
      // A collection to save json formatted logs
      collection: 'dblog',
      format: winston.format.combine(
        winston.format.timestamp(),
        // Convert logs to a json format
        winston.format.json(),
        winston.format.errors({ stack: true }),
        winston.format.metadata()
      ),
    }),

    new winston.transports.MongoDB({
        level: 'info',
        // mongo database connection link
        db: process.env.MONGO_URI,
        options: {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        },
        // A collection to save json formatted logs
        collection: 'dblog',
        format: winston.format.combine(
          winston.format.timestamp(),
          // Convert logs to a json format
          winston.format.json(),
          winston.format.errors({ stack: true }),
          winston.format.metadata()
        ),
      }),
  ],
  exitOnError: false,
});

logger.stream = {
  write: function (message) {
    logger.info(message, { meta: { serverLogs: 'server-logs' } });
  },
};

module.exports.debug = module.exports.log = function () {
  logger.debug.apply(logger, formatLogArguments(arguments));
};

module.exports.info = function () {
  logger.info.apply(logger, formatLogArguments(arguments));
};

module.exports.warn = function () {
  logger.warn.apply(logger, formatLogArguments(arguments));
};

module.exports.error = function () {
  logger.error.apply(logger, formatLogArguments(arguments));
};

module.exports.stream = logger.stream;

/**
 * Attempts to add file and line number info to the given log arguments.
 * @param {*} args
 */

function formatLogArguments(args) {
  args = Array.prototype.slice.call(args);
  // console.log('args', args);

  const stackInfo = getStackInfo(1);


  if (stackInfo) {
    // get file path relative to project root
    // const calleeStr = '(' + stackInfo.relativePath + ':' + stackInfo.line + ')';
    const calleeStr = `${stackInfo.relativePath}:${stackInfo.line}`;
    
    const calleeStrHl = highlight(calleeStr);
    // console.log(calleeStrHl);

    if (typeof args[0] === 'string') {
      // console.log(calleeStrHl, args[0]);
      // args[0] = calleeStr + ' ' + args[0];
      args[0] = `log${arrow} ${args[0]}`;
    } else {
      const logging = highlight('Logging below\u2B07 ');
      // console.log(calleeStrHl, logging);
      // console.log(JSON.stringify(args, null, 2));
      // args.unshift(calleeStr);

      args[0] = {...args[0], info: calleeStr}
    }
  }

  return args;
}

/**
 * Parses and returns info about the call stack at the given index.
 */
function getStackInfo(stackIndex) {
  // get call stack, and analyze it
  // get all file, method, and line numbers
  const stacklist = new Error().stack.split('\n').slice(5);

  // stack trace format:
  // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
  // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
  const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi;
  const stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi;

  const s = stacklist[stackIndex] || stacklist[0];
  const sp = stackReg.exec(s) || stackReg2.exec(s);

  if (sp && sp.length === 5) {
    return {
      method: sp[1],
      relativePath: path.relative(PROJECT_ROOT, sp[2]),
      line: sp[3],
      pos: sp[4],
      file: path.basename(sp[2]),
      stack: stacklist.join('\n'),
    };
  }
}