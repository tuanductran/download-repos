# Download Your Starred GitHub Repositories

This project provides a Node.js application to easily download all your starred repositories from GitHub and convert the data to various formats (JSON, XLSX, CSV).

[![CI](https://github.com/tuanductran/download-repos/workflows/CI/badge.svg)](https://github.com/tuanductran/download-repos/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**[100+ Github Starred Repositories](https://drive.google.com/drive/folders/189uUYB32jQZXWE4XimU55i7vPB-WcD7v)**

## Features

- ✨ Fetch all your starred GitHub repositories via API
- 📊 Convert data to multiple formats (JSON, XLSX, CSV)
- 🔄 Modular and maintainable architecture
- 🧪 Comprehensive unit tests
- 📝 Detailed logging for all operations
- ⚡ Rate limit handling for GitHub API
- 🛠️ Easy to extend and customize

## Installation

```bash
# Clone the repository
git clone https://github.com/tuanductran/download-repos.git
cd download-repos

# Install dependencies
pnpm install
```

## Usage

### Fetch Starred Repositories

```bash
node index.js
```

You'll be prompted to enter:
- GitHub Personal Access Token (required for API access)
- GitHub Username

The application will fetch all your starred repositories and save them to `json/starred_repos.json`.

### Convert Data Formats

```bash
node jsonToXlsx.js
```

This will convert files in the `json/` directory to XLSX and CSV formats in the `output/` directory.

## Project Structure

```
download-repos/
├── src/
│   ├── modules/
│   │   ├── github-api.js      # GitHub API client
│   │   └── file-converter.js  # File format converter
│   ├── utils/
│   │   ├── logger.js          # Logging utility
│   │   ├── file-utils.js      # File system utilities
│   │   └── validation.js      # Validation utilities
│   ├── index.js               # Main application
│   └── jsonToXlsx.js          # Converter application
├── tests/                     # Unit tests
├── .github/workflows/         # CI/CD workflows
├── index.js                   # Entry point
├── jsonToXlsx.js             # Converter entry point
└── package.json
```

## Development

### Run Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage
```

### Linting

```bash
# Check code style
pnpm run lint

# Fix linting issues automatically
pnpm run lint:fix
```

### Build

```bash
# Build executable binaries
pnpm run build

# Clean build artifacts
pnpm run clear
```

## Technologies

- **Node.js** - Runtime environment
- **XLSX** - Excel file manipulation
- **Jest** - Testing framework
- **ESLint** - Code linting
- **GitHub Actions** - CI/CD automation

## API Rate Limits

The application handles GitHub API rate limits automatically:
- Monitors remaining API calls
- Automatically sleeps when threshold is reached
- Logs all rate limit events

## Logging

All operations are logged to:
- `logs/repositories.log` - Main application logs
- `logs/converter.log` - Converter operation logs

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Author

This project is authored by Tuan Duc Tran.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more details.
