const GitHubAPI = require('../../src/modules/github-api');

describe('GitHubAPI', () => {
  let githubAPI;
  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    };
    githubAPI = new GitHubAPI('test-token', mockLogger);
  });

  describe('formatStarCount', () => {
    test('should format count less than 1000 with + suffix', () => {
      expect(githubAPI.formatStarCount(100)).toBe('100+');
      expect(githubAPI.formatStarCount(999)).toBe('999+');
    });

    test('should format count greater than or equal to 1000 with k suffix', () => {
      expect(githubAPI.formatStarCount(1000)).toBe('1.0k+');
      expect(githubAPI.formatStarCount(1500)).toBe('1.5k+');
      expect(githubAPI.formatStarCount(10000)).toBe('10.0k+');
    });
  });

  describe('displayRateLimitInfo', () => {
    test('should display rate limit information', () => {
      const mockRateLimit = {
        resources: {
          core: {
            limit: 5000,
            remaining: 4999
          }
        },
        rate: {
          reset: 1234567890
        }
      };

      console.log = jest.fn();
      
      githubAPI.displayRateLimitInfo(mockRateLimit);
      
      expect(console.log).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Rate limit info displayed');
    });
  });

  describe('constructor', () => {
    test('should initialize with token and logger', () => {
      expect(githubAPI.token).toBe('test-token');
      expect(githubAPI.logger).toBe(mockLogger);
      expect(githubAPI.rateLimitThreshold).toBe(10);
      expect(githubAPI.sleepDuration).toBe(3600000);
    });

    test('should work without logger', () => {
      const apiWithoutLogger = new GitHubAPI('token');
      expect(apiWithoutLogger.logger).toBeUndefined();
    });
  });
});
