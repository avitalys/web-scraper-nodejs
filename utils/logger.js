const fs = require("fs");
const util = require("util");
const dayjs = require("dayjs");
const consts = require("../consts");
const { Console } = require("node:console");

var today = dayjs().format("YYYY-MM-DD-HH-mm");

const fileOutput = fs.createWriteStream(
  `${consts.LOGS_DIRNAME}/stdout_${today}.txt`,
  {
    flag: "as",
  }
);
const errorOutput = fs.createWriteStream(
  `${consts.LOGS_DIRNAME}/stderr_${today}.txt`
);
const consoleOutput = process.stdout;

const formatLogMessage = (e) => {
  const msg = JSON.stringify(e).trim();
  const formattedMsg = `${dayjs().format(
    "YYYY-MM-DD HH:mm:sss"
  )} | INFO | ${util.format(msg)}`;

  return formattedMsg;
};

// stdout is a writable stream to print log or info output.
// stderr is used for warning or error output.
const console = new Console({ stdout: fileOutput, stderr: errorOutput });

const level = consts.LOG_LEVEL;

console.log = (e) => {
  const msg = formatLogMessage(e, level.INFO);
  fileOutput.write(msg + "\n");
  consoleOutput.write(msg + "\n");
};

console.error = (e) => {
  const msg = formatLogMessage(e, level.ERROR);
  ErrorLog.write(msg + "\n");
};

module.exports = { console };
