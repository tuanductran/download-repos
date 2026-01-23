#!/usr/bin/env node

const path = require('path');
const Logger = require('./src/utils/logger');
const FileUtils = require('./src/utils/file-utils');
const ValidationUtils = require('./src/utils/validation');
const GitHubAPI = require('./src/modules/github-api');

// Base paths
const baseDir = process.cwd();
const LOG_DIR = path.join(baseDir, 'logs');
const TEMP_DIR = path.join(baseDir, 'temp');
const OUTPUT_DIR = path.join(baseDir, 'json');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'starred_repos.json');

// Initialize logger
const logger = new Logger(LOG_DIR);

/**
 * Main program logic
 */
const main = async () => {
  // Create directories
  FileUtils.ensureDirectories([LOG_DIR, TEMP_DIR, OUTPUT_DIR]);

  // Check internet connection
  if (!(await ValidationUtils.checkInternetConnection())) {
    console.log('No internet connection. Please check your connection.');
    logger.error('No internet connection.');
    process.exit(1);
  }

  // Get user credentials
  const token = await ValidationUtils.promptUserInput('Enter GitHub Token (required): ');
  const username = await ValidationUtils.promptUserInput('Enter GitHub Username (required): ');

  // Initialize GitHub API client
  const githubAPI = new GitHubAPI(token, logger);

  // Validate credentials
  if (!(await ValidationUtils.validateGithubCredentials(token, username, githubAPI.fetchData.bind(githubAPI)))) {
    console.log('Invalid GitHub Token or Username. Please try again.');
    logger.error('Invalid credentials provided.');
    process.exit(1);
  }

  console.log('GitHub credentials validated successfully.');
  logger.info('GitHub credentials validated.');

  // Fetch starred repositories
  const allRepos = await githubAPI.fetchStarredRepos(username);

  // Save to file
  FileUtils.writeJSON(OUTPUT_FILE, allRepos);
  console.log(`Data successfully saved to ${OUTPUT_FILE}. Total repositories fetched: ${allRepos.length}`);
  logger.info(`Data successfully saved. Total repositories: ${allRepos.length}`);
};

main().catch(error => {
  console.error(`Script failed with error: ${error.message}`);
  logger.error(`Script failed: ${error.message}`);
});
