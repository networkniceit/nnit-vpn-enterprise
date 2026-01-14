# Contributing to NNIT VPN Enterprise

Thank you for your interest in contributing to NNIT VPN Enterprise! This document provides guidelines and instructions for contributing.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the issue already exists in [GitHub Issues](https://github.com/networkniceit/nnit-vpn-enterprise/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Search existing issues for similar suggestions
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Potential implementation approach
   - Any relevant examples

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/nnit-vpn-enterprise.git
   cd nnit-vpn-enterprise
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the code style guide
   - Add tests for new features
   - Update documentation as needed
   - Ensure all tests pass

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template

## Development Guidelines

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add TOTP authentication support
fix: resolve connection timeout issue
docs: update API documentation
```

### Testing

All code should include tests:

```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.service.test.ts

# Run with coverage
npm test -- --coverage
```

### Documentation

Update documentation when making changes:

- Code comments for complex logic
- README for feature changes
- API documentation for endpoint changes
- Architecture docs for structural changes

## Project Structure

```
nnit-vpn-enterprise/
├── backend/           # Backend services
│   ├── auth/         # Authentication service
│   ├── api/          # Main API service
│   ├── admin/        # Admin service
│   ├── billing/      # Billing service
│   ├── vpn-core/     # VPN core service
│   └── monitoring/   # Monitoring service
├── apps/             # Frontend applications
│   ├── mobile/       # React Native app
│   ├── desktop/      # Electron app
│   ├── admin-dashboard/  # Admin web app
│   └── user-portal/  # User portal
├── infrastructure/   # Infrastructure configs
├── tests/           # Test files
└── docs/            # Documentation
```

## Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commit messages follow conventions
- [ ] No merge conflicts with main branch
- [ ] PR description clearly explains changes

## Review Process

1. **Automated Checks**
   - Linting and formatting
   - Unit and integration tests
   - Security scanning
   - Build verification

2. **Code Review**
   - At least one maintainer approval required
   - Address review comments
   - Keep discussions constructive

3. **Merge**
   - Squash and merge for clean history
   - Delete branch after merge

## Areas for Contribution

We welcome contributions in:

### High Priority
- Security enhancements
- Performance optimizations
- Bug fixes
- Test coverage improvements

### Medium Priority
- New VPN protocol support
- Additional OAuth providers
- Enhanced monitoring
- UI/UX improvements

### Nice to Have
- Code refactoring
- Documentation improvements
- Example implementations
- Developer tools

## Getting Help

- **Documentation**: Check [docs/](./docs/)
- **Issues**: Search or create GitHub issues
- **Discussions**: Use GitHub Discussions
- **Email**: dev@nnitvpn.com

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Eligible for special swag (major contributions)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (Enterprise License).

## Questions?

Feel free to reach out:
- GitHub Issues for bugs and features
- GitHub Discussions for questions
- Email: dev@nnitvpn.com

Thank you for contributing to NNIT VPN Enterprise! 🚀
