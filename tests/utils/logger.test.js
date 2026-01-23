const Logger = require('../../src/utils/logger');
const fs = require('fs');
const path = require('path');

describe('Logger', () => {
  const testLogDir = path.join(__dirname, '..', 'temp-logs');
  const testLogFile = 'test.log';
  let logger;

  beforeEach(() => {
    // Clean up before each test
    if (fs.existsSync(testLogDir)) {
      fs.rmSync(testLogDir, { recursive: true, force: true });
    }
    logger = new Logger(testLogDir, testLogFile);
  });

  afterEach(() => {
    // Clean up after each test
    if (fs.existsSync(testLogDir)) {
      fs.rmSync(testLogDir, { recursive: true, force: true });
    }
  });

  test('should create log directory if it does not exist', () => {
    expect(fs.existsSync(testLogDir)).toBe(true);
  });

  test('should log a message to the log file', () => {
    const message = 'Test log message';
    logger.log(message);

    const logPath = path.join(testLogDir, testLogFile);
    const logContent = fs.readFileSync(logPath, 'utf8');
    
    expect(logContent).toContain(message);
    expect(logContent).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // Check for timestamp
  });

  test('should log info message', () => {
    const message = 'Test info message';
    console.log = jest.fn(); // Mock console.log
    
    logger.info(message);

    const logPath = path.join(testLogDir, testLogFile);
    const logContent = fs.readFileSync(logPath, 'utf8');
    
    expect(logContent).toContain(`INFO: ${message}`);
    expect(console.log).toHaveBeenCalledWith(`[INFO] ${message}`);
  });

  test('should log error message', () => {
    const message = 'Test error message';
    console.error = jest.fn(); // Mock console.error
    
    logger.error(message);

    const logPath = path.join(testLogDir, testLogFile);
    const logContent = fs.readFileSync(logPath, 'utf8');
    
    expect(logContent).toContain(`ERROR: ${message}`);
    expect(console.error).toHaveBeenCalledWith(`[ERROR] ${message}`);
  });

  test('should log warning message', () => {
    const message = 'Test warning message';
    console.warn = jest.fn(); // Mock console.warn
    
    logger.warn(message);

    const logPath = path.join(testLogDir, testLogFile);
    const logContent = fs.readFileSync(logPath, 'utf8');
    
    expect(logContent).toContain(`WARNING: ${message}`);
    expect(console.warn).toHaveBeenCalledWith(`[WARNING] ${message}`);
  });
});
