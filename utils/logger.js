const fs = require("fs");
const util = require("util");
const dayjs = require("dayjs");
const consts = require("../consts");
//const { Console } = require("node:console");

var day = dayjs().format("YYYY-MM-DD");

const fileOutput = fs.createWriteStream(
  `${consts.LOGS_DIRNAME}/stdout_${day}.txt`,
  {
    flags: "as+",
  }
);
const errorOutput = fs.createWriteStream(
  `${consts.LOGS_DIRNAME}/stderr_${day}.txt`,
  {
    flags: "a+",
  }
);
const consoleOutput = process.stdout;

const formatLogMessage = (e, level) => {
  try {
    const formattedMsg = `${dayjs().format(
      "YYYY-MM-DD HH:mm:ssss"
    )} | ${level} | ${util.format(e) ?? "empty"}`;
    return formattedMsg;
  } catch (error) {
    throw error;
  }
};

// stdout is a writable stream to print log or info output.
// stderr is used for warning or error output.
//const console = new Console({ stdout: fileOutput, stderr: errorOutput });

const level = consts.LOG_LEVEL;

console.log = (e) => {
  const text = JSON.stringify(e)?.trim() ?? e;
  const msg = formatLogMessage(text, level.INFO);
  fileOutput.write(msg + "\n");
  consoleOutput.write(msg + "\n");
};

console.error = (e) => {
  const msg = formatLogMessage(e, level.ERROR);
  consoleOutput.write(msg + "\n");
  errorOutput.write(msg + "\n");
};

console.trace = (e) => {
  const msg = formatLogMessage(e, level.TRACE);
  consoleOutput.write(msg + "\n");
  errorOutput.write(msg + "\n");
};

console.debug = (e) => {
  consoleOutput.write(e + "\n");
};

module.exports = { console };
