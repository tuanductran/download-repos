const https = require('https');

/**
 * GitHub API client for fetching repository data
 */
class GitHubAPI {
  constructor(token, logger) {
    this.token = token;
    this.logger = logger;
    this.rateLimitThreshold = 10;
    this.sleepDuration = 3600 * 1000; // 1 hour
  }

  /**
   * Fetch data from GitHub API
   * @param {string} url - API URL
   * @returns {Promise<{data: object, headers: object}>}
   */
  async fetchData(url) {
    const options = this.token ? { headers: { Authorization: `Bearer ${this.token}` } } : {};
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
  }

  /**
   * Display rate limit information
   * @param {object} rateLimit - Rate limit data from GitHub
   */
  displayRateLimitInfo(rateLimit) {
    const info = `
      Rate Limit Information:
      - Core Limit: ${rateLimit.resources.core.limit}
      - Core Remaining: ${rateLimit.resources.core.remaining}
      - Reset Time (UTC): ${new Date(rateLimit.rate.reset * 1000).toISOString()}
    `;
    console.log(info);
    if (this.logger) {
      this.logger.info('Rate limit info displayed');
    }
  }

  /**
   * Check API rate limits and sleep if necessary
   * @returns {Promise<void>}
   */
  async checkRateLimit() {
    try {
      const { data: rateLimitData } = await this.fetchData('https://api.github.com/rate_limit');
      if (rateLimitData.rate.remaining <= this.rateLimitThreshold) {
        const sleepSeconds = (this.sleepDuration / 1000).toFixed(0);
        console.log(`Rate limit reached. Sleeping for ${sleepSeconds} seconds...`);
        if (this.logger) {
          this.logger.warn('Rate limit hit, sleeping...');
        }
        await new Promise(resolve => setTimeout(resolve, this.sleepDuration));
      }
    } catch (error) {
      if (this.logger) {
        this.logger.error(`Error checking rate limit: ${error.message}`);
      }
    }
  }

  /**
   * Fetch all starred repositories for a user
   * @param {string} username - GitHub username
   * @returns {Promise<Array>} - Array of repository objects
   */
  async fetchStarredRepos(username) {
    let nextPageUrl = `https://api.github.com/users/${username}/starred`;
    const allRepos = [];

    while (nextPageUrl) {
      console.log(`Fetching data from ${nextPageUrl}...`);
      if (this.logger) {
        this.logger.info(`Fetching data from ${nextPageUrl}...`);
      }

      try {
        const { data, headers } = await this.fetchData(nextPageUrl);

        if (!data.length) break;

        const repos = data.map(repo => ({
          name: repo.name,
          description: repo.description || 'No description provided.',
          html_url: repo.html_url,
          language: repo.language || 'Unknown',
          stargazers_count: this.formatStarCount(repo.stargazers_count),
          created_at: repo.created_at,
        }));

        allRepos.push(...repos);

        // Parse link header for next page
        const linkHeader = headers.link;
        nextPageUrl = linkHeader?.split(',')
          .find(link => link.includes('rel="next"'))
          ?.split(';')[0]
          .replace(/[<>]/g, '') || '';

        // Check rate limits
        await this.checkRateLimit();
      } catch (error) {
        console.error(`Error fetching data from GitHub API: ${error.message}`);
        if (this.logger) {
          this.logger.error(`Error fetching data from GitHub API: ${error.message}`);
        }
        break;
      }
    }

    return allRepos;
  }

  /**
   * Format star count for display
   * @param {number} count - Star count
   * @returns {string} - Formatted count
   */
  formatStarCount(count) {
    return count >= 1000 ? `${(count / 1000).toFixed(1)}k+` : `${count}+`;
  }
}

module.exports = GitHubAPI;
