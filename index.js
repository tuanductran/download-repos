#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const https = require('https');

// Base paths
const baseDir = process.cwd();
const LOG_DIR = path.join(baseDir, 'logs');
const TEMP_DIR = path.join(baseDir, 'temp');
const OUTPUT_DIR = path.join(baseDir, 'json');
const LOG_FILE = path.join(LOG_DIR, 'repositories.log');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'starred_repos.json');

// GitHub API rate limit configuration
const RATE_LIMIT_THRESHOLD = 10;
const SLEEP_DURATION = 3600 * 1000; // 1 hour

// Create directories if they don't exist
[LOG_DIR, TEMP_DIR, OUTPUT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Log messages to a file
const logMessage = message => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `${timestamp} - ${message}\n`);
};

// Prompt user input via CLI
const promptUserInput = async message => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => rl.question(message, input => {
    rl.close();
    resolve(input.trim());
  }));
};

// Check internet connection
const checkInternetConnection = () =>
  new Promise(resolve =>
    https.get('https://github.com', () => resolve(true)).on('error', () => resolve(false))
  );

// Fetch data from GitHub API
const fetchData = (url, token) => {
  const options = token ? { headers: { Authorization: `token ${token}` } } : {};
  return new Promise((resolve, reject) => {
    https.get(url, options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ data: JSON.parse(data), headers: res.headers });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', err => reject(new Error(`Fetch error: ${err.message}`)));
  });
};

// Validate GitHub credentials
const validateGithubCredentials = async (token, username) => {
  try {
    await fetchData(`https://api.github.com/users/${username}`, token);
    return true;
  } catch (error) {
    console.error(`Validation failed: ${error.message}`);
    return false;
  }
};

// Display rate limit information
const displayRateLimitInfo = rateLimit => {
  console.log(`
    Rate Limit Information:
    - Core Limit: ${rateLimit.resources.core.limit}
    - Core Remaining: ${rateLimit.resources.core.remaining}
    - Reset Time (UTC): ${new Date(rateLimit.rate.reset * 1000).toISOString()}
  `);
};

// Format star count
const formatStarCount = count =>
  count >= 1000 ? `${(count / 1000).toFixed(1)}k+` : `${count}+`;

// Main program logic
const main = async () => {
  if (!(await checkInternetConnection())) {
    console.log('No internet connection. Please check your connection.');
    logMessage('No internet connection.');
    process.exit(1);
  }

  const token = await promptUserInput('Enter GitHub Token (required): ');
  const username = await promptUserInput('Enter GitHub Username (required): ');

  if (!(await validateGithubCredentials(token, username))) {
    console.log('Invalid GitHub Token or Username. Please try again.');
    logMessage('Invalid credentials provided.');
    process.exit(1);
  }

  console.log('GitHub credentials validated successfully.');
  logMessage('GitHub credentials validated.');

  let nextPageUrl = `https://api.github.com/users/${username}/starred`;
  const allRepos = [];

  while (nextPageUrl) {
    console.log(`Fetching data from ${nextPageUrl}...`);
    logMessage(`Fetching data from ${nextPageUrl}...`);

    try {
      const { data, headers } = await fetchData(nextPageUrl, token);

      if (!data.length) break;

      const repos = data.map(repo => ({
        name: repo.name,
        description: repo.description || 'No description provided.',
        html_url: repo.html_url,
        language: repo.language || 'Unknown',
        stargazers_count: formatStarCount(repo.stargazers_count),
        created_at: repo.created_at,
      }));

      allRepos.push(...repos);

      const linkHeader = headers.link;
      nextPageUrl =
        linkHeader?.split(',').find(link => link.includes('rel="next"'))?.split(';')[0].replace(/[<>]/g, '') || '';

      // Check API rate limits
      const { data: rateLimitData } = await fetchData('https://api.github.com/rate_limit', token);
      if (rateLimitData.rate.remaining <= RATE_LIMIT_THRESHOLD) {
        console.log(`Rate limit reached. Sleeping for ${(SLEEP_DURATION / 1000).toFixed(0)} seconds...`);
        logMessage('Rate limit hit, sleeping...');
        await new Promise(resolve => setTimeout(resolve, SLEEP_DURATION));
      }
    } catch (error) {
      console.error(`Error fetching data from GitHub API: ${error.message}`);
      logMessage(`Error fetching data from GitHub API: ${error.message}`);
      break;
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allRepos, null, 2));
  console.log(`Data successfully saved to ${OUTPUT_FILE}. Total repositories fetched: ${allRepos.length}`);
};

main().catch(error => {
  console.error(`Script failed with error: ${error.message}`);
});
