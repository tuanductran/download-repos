const FileConverter = require('../../src/modules/file-converter');
const fs = require('fs');
const path = require('path');

describe('FileConverter', () => {
  let converter;
  let mockLogger;
  const testDir = path.join(__dirname, '..', 'temp-converter');

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    };
    converter = new FileConverter(mockLogger);

    // Clean up before each test
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up after each test
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('constructor', () => {
    test('should initialize with logger', () => {
      expect(converter.logger).toBe(mockLogger);
    });

    test('should work without logger', () => {
      const converterWithoutLogger = new FileConverter();
      expect(converterWithoutLogger.logger).toBeNull();
    });
  });

  describe('convertFromJSON', () => {
    test('should convert JSON to XLSX', () => {
      const testData = [
        { name: 'Test1', value: 100 },
        { name: 'Test2', value: 200 }
      ];
      const outputPath = path.join(testDir, 'output.xlsx');

      console.log = jest.fn();
      converter.convertFromJSON(testData, 'xlsx', outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[SUCCESS] JSON to XLSX'));
      expect(mockLogger.info).toHaveBeenCalled();
    });

    test('should convert JSON to CSV', () => {
      const testData = [
        { name: 'Test1', value: 100 },
        { name: 'Test2', value: 200 }
      ];
      const outputPath = path.join(testDir, 'output.csv');

      console.log = jest.fn();
      converter.convertFromJSON(testData, 'csv', outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[SUCCESS] JSON to CSV'));
      expect(mockLogger.info).toHaveBeenCalled();
    });

    test('should handle unsupported format', () => {
      const testData = [{ name: 'Test', value: 100 }];
      const outputPath = path.join(testDir, 'output.unknown');

      console.error = jest.fn();
      converter.convertFromJSON(testData, 'unknown', outputPath);

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('[ERROR]'));
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
