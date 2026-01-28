# Download Your Starred GitHub Repositories

A modern Nuxt 3 web application to easily fetch and export all your starred repositories from GitHub.

[![CI](https://github.com/tuanductran/download-repos/workflows/CI/badge.svg)](https://github.com/tuanductran/download-repos/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- ✨ Fetch all your starred GitHub repositories via API
- 🎨 Modern, responsive UI built with Nuxt UI
- 📊 Export data to CSV format (manual implementation, no external libraries)
- 🔒 Secure server-side API handling (token never exposed to client)
- 🚀 Built with Nuxt 3 and TypeScript
- ⚡ Fast and efficient pagination handling
- 🎯 Real-time loading states and error notifications
- 🌙 Dark mode support

## Screenshots

### Main Interface
![UI Screenshot](https://github.com/user-attachments/assets/b1e08908-52e6-4aaf-802f-d53672369784)

## Tech Stack

- **Framework**: Nuxt 3
- **UI Library**: Nuxt UI (based on Tailwind CSS)
- **Language**: TypeScript
- **Runtime**: Node.js
- **Server**: Nitro (built-in Nuxt 3 server)

## Installation

```bash
# Clone the repository
git clone https://github.com/tuanductran/download-repos.git
cd download-repos

# Install dependencies
pnpm install
```

## Usage

### Development

```bash
# Start development server
pnpm run dev
```

Visit `http://localhost:3000` in your browser.

### Production

```bash
# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

### Using the Application

1. **Enter your GitHub credentials**:
   - GitHub Username
   - GitHub Personal Access Token (required for API access)
   
2. **Fetch repositories**:
   - Click "Fetch Repositories" to retrieve all your starred repos
   - The app handles pagination automatically
   
3. **View results**:
   - Browse your starred repositories in a table
   - See repository name, description, language, stars, and creation date
   
4. **Export to CSV**:
   - Click "Export to CSV" to download your data
   - CSV generation is done manually without external libraries

## How to Get a GitHub Token

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name and select scopes (at minimum, you need `public_repo` or `repo` scope)
4. Click "Generate token"
5. Copy the token and use it in the application

**Note**: Never share your GitHub token publicly!

## Project Structure

```
download-repos/
├── app.vue                 # Main application component
├── server/
│   └── api/
│       └── github/
│           └── starred.post.ts  # Server API endpoint
├── composables/
│   └── useCsvExport.ts     # CSV export logic
├── types/
│   └── index.ts            # TypeScript interfaces
├── nuxt.config.ts          # Nuxt configuration
└── package.json
```

## API Endpoints

### POST `/api/github/starred`

Fetches all starred repositories for a given GitHub user.

**Request Body**:
```json
{
  "username": "your-github-username",
  "token": "your-github-token"
}
```

**Response**:
```json
{
  "repositories": [
    {
      "name": "repo-name",
      "description": "Repository description",
      "html_url": "https://github.com/owner/repo",
      "language": "JavaScript",
      "stargazers_count": "1.2k+",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## CSV Export

The CSV export feature is implemented manually using native JavaScript:

- Properly escapes commas, quotes, and newlines in data
- Creates a Blob with `text/csv` MIME type
- Triggers browser download using `URL.createObjectURL`
- No external libraries required

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

## Migration from CLI

This application was migrated from a Node.js CLI tool to a modern Nuxt 3 web application. Key changes:

- **From**: Node.js CLI with prompts and file generation
- **To**: Web-based UI with browser-based CSV downloads
- **Removed**: Heavy dependencies like `xlsx` library
- **Added**: Modern web stack with Nuxt 3, Vue 3, and TypeScript
- **Improved**: Better user experience with real-time feedback and error handling

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

## Acknowledgments

- Built with [Nuxt 3](https://nuxt.com/)
- UI components from [Nuxt UI](https://ui.nuxt.com/)
- Icons: Unicode emoji characters
