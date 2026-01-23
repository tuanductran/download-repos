const readline = require('readline');
const https = require('https');

/**
 * Validation utilities for user input and credentials
 */
class ValidationUtils {
  /**
   * Prompt user for input via CLI
   * @param {string} message - Message to display
   * @returns {Promise<string>} - User input
   */
  static async promptUserInput(message) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    return new Promise(resolve => rl.question(message, input => {
      rl.close();
      resolve(input.trim());
    }));
  }

  /**
   * Check if internet connection is available
   * @returns {Promise<boolean>} - True if connected
   */
  static checkInternetConnection() {
    return new Promise(resolve =>
      https.get('https://github.com', () => resolve(true))
        .on('error', () => resolve(false))
    );
  }

  /**
   * Validate GitHub credentials
   * @param {string} token - GitHub token
   * @param {string} username - GitHub username
   * @param {Function} fetchDataFn - Function to fetch data from GitHub
   * @returns {Promise<boolean>} - True if valid
   */
  static async validateGithubCredentials(token, username, fetchDataFn) {
    try {
      await fetchDataFn(`https://api.github.com/users/${username}`, token);
      return true;
    } catch (error) {
      console.error(`Validation failed: ${error.message}`);
      return false;
    }
  }
}

module.exports = ValidationUtils;
