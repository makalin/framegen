# Contributing to FrameGen AI

Thank you for your interest in contributing to FrameGen AI! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/makalin/framegen.git
   cd framegen
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3001 in your browser

## Development Workflow

### Code Style

- Use ESLint for code linting
- Follow the existing code style and formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Write self-documenting code

### Git Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Branch Naming

Use descriptive branch names:
- `feature/ai-enhancements`
- `fix/crop-selection-bug`
- `docs/api-documentation`
- `refactor/image-processing`

## Project Structure

```
framegen/
├── src/                    # Source code
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   ├── images/            # Image assets
│   └── index.html         # Main HTML file
├── dist/                  # Built files (generated)
├── uploads/               # Uploaded images (generated)
├── outputs/               # Cropped images (generated)
├── server.js              # Express server
├── webpack.config.js      # Webpack configuration
├── package.json           # Dependencies and scripts
└── README.md              # Project documentation
```

## Testing

### Manual Testing

1. Test image upload functionality
2. Verify crop selection works on desktop and mobile
3. Check composition guides display correctly
4. Test AI suggestions
5. Verify download and save functionality
6. Test responsive design on different screen sizes

### Automated Testing

Run the test suite:
```bash
npm test
```

## Submitting Changes

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Commit your changes with descriptive messages
5. Push to your fork
6. Create a pull request

### Pull Request Guidelines

- Provide a clear description of the changes
- Include screenshots for UI changes
- Reference any related issues
- Ensure all tests pass
- Update documentation if needed

## Code Review Process

1. All pull requests require review
2. Address feedback and make requested changes
3. Maintainers will merge approved changes
4. Keep discussions constructive and respectful

## Reporting Issues

When reporting issues, please include:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable
- Console errors if any

## Feature Requests

For feature requests:

- Describe the feature clearly
- Explain the use case
- Consider implementation complexity
- Check if it aligns with project goals

## Getting Help

- Check existing issues and pull requests
- Review documentation
- Ask questions in discussions
- Join the community

## Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Focus on constructive feedback
- Follow the project's coding standards

## License

By contributing to FrameGen AI, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to FrameGen AI! 🎨 