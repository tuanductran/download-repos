const fs = require('fs');

/**
 * File system utilities for directory and file operations
 */
class FileUtils {
  /**
   * Ensure directories exist, create them if they don't
   * @param {string[]} directories - Array of directory paths
   */
  static ensureDirectories(directories) {
    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Write JSON data to a file
   * @param {string} filePath - Path to the file
   * @param {object} data - Data to write
   */
  static writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  /**
   * Read JSON data from a file
   * @param {string} filePath - Path to the file
   * @returns {object} - Parsed JSON data
   */
  static readJSON(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  /**
   * Check if a file exists
   * @param {string} filePath - Path to the file
   * @returns {boolean} - True if file exists
   */
  static fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  /**
   * Get files in a directory with specific extensions
   * @param {string} directory - Directory path
   * @param {string[]} extensions - Array of extensions to filter
   * @returns {string[]} - Array of file names
   */
  static getFilesWithExtensions(directory, extensions) {
    if (!fs.existsSync(directory)) {
      return [];
    }
    return fs.readdirSync(directory).filter(file =>
      extensions.some(ext => file.endsWith(ext))
    );
  }
}

module.exports = FileUtils;
