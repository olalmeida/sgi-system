# Contributing to Gestio System

## Development Workflow

### Prerequisites
- Node.js 18+ and npm
- Git configured with your name and email

### Getting Started

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd sgi-system/apps/web
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials

---

## Code Quality Standards

### Linting and Formatting

We use **ESLint** and **Prettier** to maintain code quality:

```bash
# Check linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Pre-commit Hooks

Git hooks automatically run before commits:
- **Pre-commit**: Runs ESLint and Prettier on staged files
- **Commit-msg**: Validates commit message format

---

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes

### Examples
```bash
feat(finance): add export to Excel functionality
fix(auth): resolve language persistence issue
docs(readme): update installation instructions
refactor(hooks): extract user-aware data fetching logic
```

---

## Development Guidelines

### TypeScript
- Use strict TypeScript mode
- Avoid `any` types (warnings enabled)
- Prefix unused variables with `_`

### React
- Use functional components with hooks
- Implement proper error boundaries
- Follow React 19+ best practices

### Imports
- Imports are automatically sorted alphabetically
- Group: builtin → external → internal → parent → sibling

### Accessibility
- Follow WCAG guidelines
- Use semantic HTML
- Ensure keyboard navigation works

---

## Testing Your Changes

Before submitting a PR:

1. **Lint your code**
   ```bash
   npm run lint:fix
   ```

2. **Format your code**
   ```bash
   npm run format
   ```

3. **Test locally**
   ```bash
   npm run dev
   # Test all affected features
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

---

## Pull Request Process

1. Create a feature branch from `main`
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. Make your changes following the guidelines above

3. Commit with conventional commit messages

4. Push and create a PR
   ```bash
   git push origin feat/your-feature-name
   ```

5. Fill out the PR template completely

6. Wait for code review and address feedback

---

## Project Structure

```
apps/web/src/
├── components/
│   ├── auth/           # Authentication components
│   ├── finance/        # Finance module
│   ├── budgets/        # Budget management
│   ├── logistics/      # Logistics module
│   └── settings/       # Settings UI
├── contexts/           # React contexts (Auth, Settings)
├── hooks/              # Custom React hooks
├── i18n/               # Internationalization
├── lib/                # Utilities (Supabase client)
└── types/              # TypeScript type definitions
```

---

## Common Issues

### Pre-commit Hook Fails
If the pre-commit hook fails:
1. Check the error message
2. Run `npm run lint:fix` and `npm run format`
3. Stage the fixed files
4. Try committing again

### Commit Message Rejected
Ensure your commit message follows the conventional format:
```bash
# ❌ Bad
git commit -m "fixed bug"

# ✅ Good
git commit -m "fix(auth): resolve session persistence issue"
```

---

## Need Help?

- Check existing issues and PRs
- Review the [README.md](../../README.md)
- Ask questions in discussions

---

## License

MIT License - see [LICENSE](../../LICENSE) for details
