const fs = require('fs');
const path = require('path');

/**
 * Logger utility for writing log messages to a file
 */
class Logger {
  constructor(logDir, logFileName = 'repositories.log') {
    this.logDir = logDir;
    this.logFile = path.join(logDir, logFileName);
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  log(message) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(this.logFile, `${timestamp} - ${message}\n`);
  }

  info(message) {
    console.log(`[INFO] ${message}`);
    this.log(`INFO: ${message}`);
  }

  error(message) {
    console.error(`[ERROR] ${message}`);
    this.log(`ERROR: ${message}`);
  }

  warn(message) {
    console.warn(`[WARNING] ${message}`);
    this.log(`WARNING: ${message}`);
  }
}

module.exports = Logger;
