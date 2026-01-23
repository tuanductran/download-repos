# Contributing to Download Repos

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/download-repos.git
   cd download-repos
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Project Structure

```
download-repos/
├── src/
│   ├── modules/       # Core functionality modules
│   ├── utils/         # Utility functions
│   ├── index.js       # Main application
│   └── jsonToXlsx.js  # Converter application
├── tests/             # Unit tests
├── .github/workflows/ # CI/CD pipelines
└── ...
```

## Making Changes

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add or update tests as needed
- Update documentation if required

### 3. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### 4. Run Linter

```bash
# Check for linting issues
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

### 5. Commit Your Changes

Use clear and descriptive commit messages:

```bash
git add .
git commit -m "feat: add new feature description"
# or
git commit -m "fix: fix bug description"
```

We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Adding or updating tests
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

### 6. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style Guidelines

- Use **semicolons**
- Use **single quotes** for strings (allow template literals)
- **Indent** with 2 spaces
- Keep lines under **120 characters** when possible
- Use **meaningful variable names**
- Add **JSDoc comments** for functions and classes

## Testing Guidelines

- Write tests for new functionality
- Ensure all tests pass before submitting PR
- Maintain or improve test coverage
- Use descriptive test names
- Group related tests using `describe` blocks

### Test Structure

```javascript
describe('ModuleName', () => {
  describe('methodName', () => {
    test('should do something specific', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = doSomething(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure CI passes** (all tests and linting)
4. **Request review** from maintainers
5. **Address feedback** if requested
6. Once approved, maintainers will merge your PR

## Pull Request Checklist

Before submitting your PR, ensure:

- [ ] Code follows the project's style guidelines
- [ ] All tests pass (`npm test`)
- [ ] Linter passes (`npm run lint`)
- [ ] New code has test coverage
- [ ] Documentation is updated
- [ ] Commit messages are clear and follow conventions
- [ ] Branch is up to date with main branch

## Reporting Bugs

When reporting bugs, please include:

- **Description** of the issue
- **Steps to reproduce** the bug
- **Expected behavior**
- **Actual behavior**
- **Environment details** (OS, Node.js version, etc.)
- **Error messages** or logs if applicable

## Suggesting Enhancements

When suggesting enhancements:

- **Clearly describe** the feature
- **Explain the use case** and benefits
- **Provide examples** if possible
- **Consider implementation** complexity

## Questions?

If you have questions, feel free to:

- Open an issue for discussion
- Reach out to the maintainers

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

Thank you for contributing! 🎉
