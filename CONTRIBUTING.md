# Contributing to Web-AI

Thank you for your interest in contributing to Web-AI! This document provides guidelines and instructions for contributing to the project.

## 🚀 Quick Start

### Development Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   # Then clone your fork
   git clone https://github.com/your-username/Web-AI.git
   cd Web-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Ollama**
   ```bash
   # Start Ollama service
   ollama serve
   
   # Pull a test model
   ollama pull llama3.2:3b
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

## 🛠️ Development Workflow

### Creating a Feature Branch

```bash
# Create and switch to a new feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Making Changes

1. **Follow TypeScript best practices**
2. **Maintain consistent code style**
3. **Add comments for complex logic**
4. **Update tests if applicable**

### Committing Changes

```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: add smart context awareness to chat"

# Or for bug fixes
git commit -m "fix: resolve streaming response timeout issue"
```

### Commit Message Format

Follow conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

### Submitting a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your feature branch
   - Fill out the PR template

3. **PR Guidelines**
   - Provide clear description of changes
   - Reference related issues
   - Include screenshots for UI changes
   - Ensure all checks pass

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test ChatService.test.ts
```

### Writing Tests

- Write unit tests for new components
- Add integration tests for API routes
- Include edge cases and error scenarios
- Follow existing test patterns

## 📝 Code Style

### TypeScript Guidelines

```typescript
// ✅ Good: Proper typing
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ✅ Good: Clear function signatures
async function generateResponse(
  prompt: string,
  history: ChatMessage[]
): Promise<string> {
  // Implementation
}

// ❌ Avoid: Any types
function processData(data: any): any {
  // Avoid this
}
```

### Component Guidelines

```typescript
// ✅ Good: Proper component structure
interface ChatHeaderProps {
  title: string;
  onClose: () => void;
}

export function ChatHeader({ title, onClose }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4">
      <h1 className="text-lg font-semibold">{title}</h1>
      <button onClick={onClose}>Close</button>
    </header>
  );
}
```

### CSS/Styling Guidelines

- Use Tailwind CSS utility classes
- Follow consistent spacing patterns
- Ensure responsive design
- Maintain accessibility standards

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, include:
- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, Node.js version, browser
- **Screenshots**: If applicable

### Feature Requests

For new features, include:
- **Problem Description**: What problem does this solve?
- **Proposed Solution**: How would you implement it?
- **Alternatives**: Other approaches considered
- **Additional Context**: Screenshots, mockups, examples

## 🔍 Code Review Process

### What We Look For

- **Functionality**: Does the code work as intended?
- **Style**: Follows project conventions
- **Performance**: No unnecessary performance impacts
- **Security**: No security vulnerabilities
- **Documentation**: Adequate comments and docs

### Review Checklist

- [ ] Code follows TypeScript best practices
- [ ] Components are properly typed
- [ ] UI is responsive and accessible
- [ ] No console errors or warnings
- [ ] Tests pass and coverage is maintained
- [ ] Documentation is updated if needed

## 🎯 Project Areas

### Easy Contributions

Perfect for first-time contributors:
- Documentation improvements
- Bug fixes
- UI/UX enhancements
- Test coverage improvements
- TypeScript type improvements

### Advanced Contributions

For experienced contributors:
- New features (chat enhancements, model management)
- Performance optimizations
- Architecture improvements
- Integration with new AI models
- Advanced streaming features

## 📚 Resources

### Project Documentation

- [Installation Guide](./docs/installation.md)
- [Architecture Guide](./docs/architecture.md)
- [API Documentation](./docs/api.md)

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Ollama Documentation](https://ollama.ai/docs)

## 🤝 Community Guidelines

### Be Respectful

- Use welcoming and inclusive language
- Respect different viewpoints and experiences
- Give and accept constructive feedback gracefully
- Focus on what's best for the community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **Pull Requests**: Code contributions and discussions
- **Discussions**: General questions and ideas

## 📞 Getting Help

If you need help or have questions:

1. Check existing [Issues](https://github.com/rudra-sah00/Web-AI/issues)
2. Review the [Documentation](./docs/)
3. Create a new issue with your question

## 🎉 Recognition

Contributors are recognized in:
- GitHub contributor graph
- Release notes for significant contributions
- Project documentation credits

Thank you for contributing to Web-AI! Your contributions help make this project better for everyone.
