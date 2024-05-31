#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { prompt } from 'enquirer';
import dns from 'dns';

const LOG_DIR = 'logs';
const LOG_FILE = path.join(LOG_DIR, 'repositories_to_json.log');
const TEMP_DIR = 'temp';
const OUTPUT_DIR = 'json';
const PER_PAGE = 100;
const RATE_LIMIT_THRESHOLD = 10;
const SLEEP_DURATION = 3600;

// Create necessary directories if they don't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

const logMessage = (message) => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `${timestamp} - ${message}\n`);
};

const promptForInput = async (promptMessage) => {
  const response = await prompt({
    type: 'input',
    name: 'input',
    message: promptMessage,
  });
  return response.input;
};

const validateGithubToken = async (token) => {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`
      },
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

const validateGithubUsername = async (username) => {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

const checkInternetConnection = () => {
  return new Promise((resolve) => {
    dns.lookup('google.com', (err) => {
      if (err && err.code === 'ENOTFOUND') {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

const fetchData = async (url, token) => {
  while (true) {
    if (await checkInternetConnection()) {
      const response = await fetch(url, {
        headers: {
          Authorization: `token ${token}`
        },
      });
      if (response.status === 200) {
        return response.json();
      }
      if (response.status === 404) {
        return null;
      }
    } else {
      console.log('No internet connection. Waiting to reconnect...');
      logMessage('No internet connection. Waiting to reconnect...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

const main = async () => {
  const token = await promptForInput('Enter GitHub Token: ');
  const username = await promptForInput('Enter GitHub Username: ');

  if (!(await validateGithubToken(token))) {
    console.log('Invalid GitHub Token. Please check your token and try again.');
    logMessage('Invalid GitHub Token. Exiting script.');
    process.exit(1);
  }

  if (!(await validateGithubUsername(username))) {
    console.log('Invalid GitHub Username. Please check the username and try again.');
    logMessage('Invalid GitHub Username. Exiting script.');
    process.exit(1);
  }

  console.log('GitHub Token and Username are valid.');
  logMessage('GitHub Token and Username are valid.');

  let nextPageUrl = `https://api.github.com/users/${username}/starred?per_page=${PER_PAGE}`;

  while (nextPageUrl) {
    console.log(`Fetching data from ${nextPageUrl}...`);
    logMessage(`Fetching data from ${nextPageUrl}...`);

    try {
      const data = await fetchData(nextPageUrl, token);

      if (!data || !data.length) {
        console.log('No more data to fetch. Ending data retrieval.');
        logMessage('No more data to fetch. Ending data retrieval.');
        break;
      }

      const tempFile = path.join(TEMP_DIR, `starred-repos-temp-${Date.now()}.json`);
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
      logMessage(`Saved data to ${tempFile}.`);

      const linkHeader = response.headers.get('link');
      if (linkHeader) {
        const nextLink = linkHeader.split(',').find((link) => link.includes('rel="next"'));
        nextPageUrl = nextLink ? nextLink.split(';')[0].trim().replace(/<|>/g, '') : '';
      } else {
        nextPageUrl = '';
      }

      const rateLimitResponse = await fetch('https://api.github.com/rate_limit', {
        headers: {
          Authorization: `token ${token}`
        },
      });
      const rateLimitData = await rateLimitResponse.json();
      const rateLimitRemaining = rateLimitData.rate.remaining;

      if (rateLimitRemaining <= RATE_LIMIT_THRESHOLD) {
        console.log(`Rate limit reached. Pausing for ${SLEEP_DURATION} seconds...`);
        logMessage(`Rate limit reached. Pausing for ${SLEEP_DURATION} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, SLEEP_DURATION * 1000));
      }

      const randomSleep = Math.floor(Math.random() * 10) + 1;
      console.log(`Sleeping for ${randomSleep} seconds to avoid spamming...`);
      logMessage(`Sleeping for ${randomSleep} seconds to avoid spamming...`);
      await new Promise((resolve) => setTimeout(resolve, randomSleep * 1000));
    } catch (error) {
      console.log('Error fetching data:', error.message);
      logMessage(`Error fetching data: ${error.message}`);
      break;
    }
  }

  // Move files from temp to output directory
  const tempFiles = fs.readdirSync(TEMP_DIR);
  tempFiles.forEach((file) => {
    const tempFilePath = path.join(TEMP_DIR, file);
    const outputFilePath = path.join(OUTPUT_DIR, file.replace('temp-', ''));
    fs.renameSync(tempFilePath, outputFilePath);
    logMessage(`Moved ${tempFilePath} to ${outputFilePath}.`);
  });

  console.log(`Data has been saved to ${OUTPUT_DIR}.`);
  logMessage(`Data has been saved to ${OUTPUT_DIR}.`);
};

main().catch((error) => {
  console.error('Script failed:', error);
  logMessage(`Script failed: ${error.message}`);
  process.exit(1);
});
