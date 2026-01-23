# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Modular Architecture**: Reorganized codebase into a modular structure with separate modules and utilities
  - `src/modules/github-api.js` - GitHub API client with rate limit handling
  - `src/modules/file-converter.js` - File format conversion utilities
  - `src/utils/logger.js` - Logging utility with file and console output
  - `src/utils/file-utils.js` - File system utilities
  - `src/utils/validation.js` - Input validation and credential checking
- **Unit Tests**: Comprehensive test suite using Jest
  - Tests for all modules and utilities
  - 22 test cases with 100% pass rate
  - Test coverage reporting
- **CI/CD Pipeline**: GitHub Actions workflow for automated testing and building
  - Multi-version Node.js testing (18.x, 20.x, 22.x)
  - Automated linting and test execution
  - Code coverage reporting with Codecov integration
- **Development Tools**:
  - ESLint configuration for code quality
  - Jest configuration for testing
  - npm scripts for testing, linting, and coverage
- **Documentation**: Enhanced README with:
  - Project structure overview
  - Detailed usage instructions
  - Development guidelines
  - Contributing guidelines

### Changed
- **Entry Points**: Main scripts (`index.js`, `jsonToXlsx.js`) now redirect to modular implementations in `src/`
- **Dependencies**: Updated to latest versions and added development dependencies
  - Added `jest` (^30.2.0) for testing
  - Added `eslint` (^9.39.2) for linting
- **Configuration**: Improved project configuration
  - Updated `.gitignore` to exclude coverage and log files
  - Added `jest.config.js` for test configuration
  - Added `eslint.config.js` for linting rules

### Improved
- **Code Quality**: Better separation of concerns with modular architecture
- **Maintainability**: Easier to understand, test, and extend
- **Error Handling**: Improved error messages and logging throughout
- **Developer Experience**: Added npm scripts for common tasks

### Technical Debt Addressed
- Eliminated code duplication through reusable modules
- Improved testability with dependency injection
- Enhanced logging for better debugging
- Standardized code style with ESLint

## [1.0.0] - Previous Release
- Initial release with basic functionality
- GitHub starred repositories fetcher
- JSON to XLSX/CSV converter
