#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const https = require('https');

// Determine the base directory for the script
const baseDir = process.cwd();

const LOG_DIR = path.join(baseDir, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'repositories.log');
const TEMP_DIR = path.join(baseDir, 'temp');
const OUTPUT_DIR = path.join(baseDir, 'json');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'starred_repos.json');
const RATE_LIMIT_THRESHOLD = 10;
const SLEEP_DURATION = 3600 * 1000; // in milliseconds

// Ensure necessary directories exist
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

[LOG_DIR, TEMP_DIR, OUTPUT_DIR].forEach(ensureDirectoryExists);

const logMessage = (message) => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `${timestamp} - ${message}\n`);
};

const promptUserInput = (message) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(message, (input) => {
      rl.close();
      resolve(input);
    });
  });
};

const checkInternetConnection = () => {
  return new Promise((resolve) => {
    https.get('https://github.com', () => resolve(true))
      .on('error', () => resolve(false));
  });
};

const fetchData = (url, token) => {
  return new Promise((resolve, reject) => {
    const options = token ? { headers: { Authorization: `token ${token}` } } : {};
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ data: JSON.parse(data), headers: res.headers });
        } else {
          reject(new Error(`Failed with status code: ${res.statusCode}`));
        }
      });
    }).on('error', (err) => reject(new Error(`Fetch error: ${err.message}`)));
  });
};

const validateGithubCredentials = async (token, username) => {
  try {
    await fetchData(`https://api.github.com/users/${username}`, token);
    return true;
  } catch {
    return false;
  }
};

const displayRateLimitInfo = (rateLimit) => {
  console.log('Rate Limit Information:');
  console.log(`Core Limit: ${rateLimit.resources.core.limit}`);
  console.log(`Core Remaining: ${rateLimit.resources.core.remaining}`);
  console.log(`Search Limit: ${rateLimit.resources.search.limit}`);
  console.log(`Search Remaining: ${rateLimit.resources.search.remaining}`);
  console.log(`GraphQL Limit: ${rateLimit.resources.graphql.limit}`);
  console.log(`GraphQL Remaining: ${rateLimit.resources.graphql.remaining}`);
  console.log(`Rate Limit Reset Time (UTC): ${new Date(rateLimit.rate.reset * 1000).toISOString()}`);
};

const formatStarCount = (count) => (count >= 1000 ? `${(count / 1000).toFixed(1)}k+` : `${count}+`);

const main = async () => {
  if (!(await checkInternetConnection())) {
    const message = 'No internet connection. Please check your connection.';
    console.log(message);
    logMessage(message);
    process.exit(1);
  }

  const token = await promptUserInput('Enter GitHub Token: ');
  const username = await promptUserInput('Enter GitHub Username: ');

  if (!(await validateGithubCredentials(token, username))) {
    const message = 'Invalid GitHub Token or Username.';
    console.log(message);
    logMessage(message);
    process.exit(1);
  }

  console.log('GitHub credentials validated.');
  logMessage('GitHub credentials validated.');

  try {
    const { data: rateLimit } = await fetchData('https://api.github.com/rate_limit', token);
    displayRateLimitInfo(rateLimit);
  } catch {
    const message = 'Unable to fetch rate limit information.';
    console.log(message);
    logMessage(message);
  }

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
        description: repo.description,
        html_url: repo.html_url,
        language: repo.language,
        stargazers_count: formatStarCount(repo.stargazers_count),
        created_at: repo.created_at,
      }));

      allRepos.push(...repos);

      const linkHeader = headers.link;
      nextPageUrl = linkHeader ? linkHeader.split(',').find(link => link.includes('rel="next"'))?.split(';')[0].trim().replace(/[<>]/g, '') : '';

      const { data: rateLimitData } = await fetchData('https://api.github.com/rate_limit', token);
      if (rateLimitData.rate.remaining <= RATE_LIMIT_THRESHOLD) {
        const sleepMessage = `Rate limit reached. Sleeping for ${SLEEP_DURATION / 1000} seconds...`;
        console.log(sleepMessage);
        logMessage(sleepMessage);
        await new Promise(resolve => setTimeout(resolve, SLEEP_DURATION));
      }

      const randomSleep = (Math.random() * 10) + 1;
      const sleepMessage = `Sleeping for ${randomSleep} seconds to avoid rate limiting...`;
      console.log(sleepMessage);
      logMessage(sleepMessage);
      await new Promise(resolve => setTimeout(resolve, randomSleep * 1000));
    } catch (error) {
      const errorMessage = `Error fetching data: ${error.message}`;
      console.log(errorMessage);
      logMessage(errorMessage);
      break;
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allRepos, null, 2));
  console.log(`Data saved to ${OUTPUT_FILE}.`);
  logMessage(`Data saved to ${OUTPUT_FILE}.`);

  fs.readdirSync(TEMP_DIR).forEach(file => fs.unlinkSync(path.join(TEMP_DIR, file)));
};

main().catch((error) => {
  const errorMessage = `Script failed: ${error.message}`;
  console.error(errorMessage);
  logMessage(errorMessage);
  process.exit(1);
});