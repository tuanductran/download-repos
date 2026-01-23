const FileUtils = require('../../src/utils/file-utils');
const fs = require('fs');
const path = require('path');

describe('FileUtils', () => {
  const testDir = path.join(__dirname, '..', 'temp-files');
  const testSubDir = path.join(testDir, 'subdir');

  beforeEach(() => {
    // Clean up before each test
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up after each test
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('ensureDirectories', () => {
    test('should create directories if they do not exist', () => {
      FileUtils.ensureDirectories([testDir, testSubDir]);
      
      expect(fs.existsSync(testDir)).toBe(true);
      expect(fs.existsSync(testSubDir)).toBe(true);
    });

    test('should not throw error if directories already exist', () => {
      fs.mkdirSync(testDir, { recursive: true });
      
      expect(() => FileUtils.ensureDirectories([testDir])).not.toThrow();
      expect(fs.existsSync(testDir)).toBe(true);
    });
  });

  describe('writeJSON and readJSON', () => {
    test('should write and read JSON data correctly', () => {
      const testFile = path.join(testDir, 'test.json');
      const testData = { name: 'test', value: 123 };
      
      FileUtils.ensureDirectories([testDir]);
      FileUtils.writeJSON(testFile, testData);
      
      expect(fs.existsSync(testFile)).toBe(true);
      
      const readData = FileUtils.readJSON(testFile);
      expect(readData).toEqual(testData);
    });
  });

  describe('fileExists', () => {
    test('should return true if file exists', () => {
      const testFile = path.join(testDir, 'exists.txt');
      
      FileUtils.ensureDirectories([testDir]);
      fs.writeFileSync(testFile, 'content');
      
      expect(FileUtils.fileExists(testFile)).toBe(true);
    });

    test('should return false if file does not exist', () => {
      const testFile = path.join(testDir, 'nonexistent.txt');
      
      expect(FileUtils.fileExists(testFile)).toBe(false);
    });
  });

  describe('getFilesWithExtensions', () => {
    test('should return files with specified extensions', () => {
      FileUtils.ensureDirectories([testDir]);
      
      fs.writeFileSync(path.join(testDir, 'file1.json'), '{}');
      fs.writeFileSync(path.join(testDir, 'file2.csv'), 'data');
      fs.writeFileSync(path.join(testDir, 'file3.txt'), 'text');
      
      const files = FileUtils.getFilesWithExtensions(testDir, ['.json', '.csv']);
      
      expect(files).toHaveLength(2);
      expect(files).toContain('file1.json');
      expect(files).toContain('file2.csv');
      expect(files).not.toContain('file3.txt');
    });

    test('should return empty array if directory does not exist', () => {
      const files = FileUtils.getFilesWithExtensions(path.join(testDir, 'nonexistent'), ['.json']);
      
      expect(files).toEqual([]);
    });
  });
});
