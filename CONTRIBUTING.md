# Contributing to Claudian

Thank you for your interest in contributing to Claudian! We welcome contributions from the community and are grateful for any help you can provide.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Contributor License Agreement](#contributor-license-agreement)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Community](#community)

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [contacto@enigmora.com](mailto:contacto@enigmora.com).

---

## Contributor License Agreement

Before we can accept your contributions, you must sign our [Contributor License Agreement (CLA)](CLA.md). This is a one-time requirement that ensures we can legally distribute your contributions as part of the project.

**Why a CLA?**
- Protects both you and the project
- Ensures we have the rights to distribute your contributions
- Allows us to defend the project legally if needed
- Enables potential future licensing changes if required

You will be prompted to sign the CLA when you submit your first pull request.

---

## Getting Started

### Prerequisites

Before contributing, make sure you have:

- **Node.js** v18 or higher
- **npm** v9 or higher
- **Git** installed and configured
- An **Obsidian** installation for testing
- Basic knowledge of **TypeScript**

### Understanding the Project

1. Read the [README.md](README.md) to understand what Claudian does
2. Review the [CLAUDE.md](CLAUDE.md) for technical guidelines
3. Explore the codebase structure in `src/`
4. Check existing [issues](https://github.com/Enigmora/claudian/issues) and [pull requests](https://github.com/Enigmora/claudian/pulls)

---

## How to Contribute

### Ways to Contribute

| Contribution Type | Description |
|-------------------|-------------|
| **Bug Reports** | Report bugs via GitHub Issues |
| **Feature Requests** | Suggest new features or improvements |
| **Code** | Submit bug fixes or new features |
| **Documentation** | Improve docs, wiki, or code comments |
| **Translations** | Add or improve translations |
| **Testing** | Test pre-release versions and report issues |

### First-Time Contributors

If this is your first contribution:

1. Look for issues labeled [`good first issue`](https://github.com/Enigmora/claudian/labels/good%20first%20issue)
2. Comment on the issue to express interest
3. Wait for a maintainer to assign it to you
4. Follow the development and PR process below

---

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR-USERNAME/claudian.git
cd claudian
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a Development Branch

```bash
git checkout -b feature/your-feature-name
```

### 4. Build and Test

```bash
# Development build (with sourcemaps)
npm run dev

# Production build
npm run build
```

### 5. Test in Obsidian

```bash
# Deploy to a test vault
./deploy.sh . /path/to/test-vault/.obsidian/plugins/claudian/
```

Then reload Obsidian (`Ctrl/Cmd + R`) and test your changes.

---

## Coding Guidelines

### TypeScript

- Use TypeScript for all new code
- Enable strict mode (`strict: true`)
- Avoid `any` types; use proper typing
- Document complex functions with JSDoc comments

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- No trailing semicolons (unless required)
- Maximum line length: 100 characters

### Internationalization (i18n)

**All user-visible strings must be internationalized.**

```typescript
// ✅ Correct
import { t } from './i18n';
new Notice(t('error.apiKeyMissing'));

// ❌ Wrong
new Notice('API key not configured');
```

When adding new strings:
1. Add the key to `src/i18n/types.ts`
2. Add English translation in `src/i18n/locales/en.ts`
3. Add Spanish translation in `src/i18n/locales/es.ts`

### CSS

- Use Obsidian CSS variables (`--background-primary`, etc.)
- Prefix all classes with `claudian-`
- Support both light and dark themes

### File Organization

- Keep files focused and single-purpose
- Place new features in appropriately named files
- Update `CLAUDE.md` if adding new architectural components

---

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code refactoring (no behavior change) |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |
| `perf` | Performance improvements |
| `i18n` | Internationalization changes |

### Examples

```bash
feat(agent): add folder creation action
fix(chat): resolve streaming timeout issue
docs(wiki): update agent mode documentation
i18n(es): add missing Spanish translations
refactor(client): simplify API error handling
```

---

## Pull Request Process

### Before Submitting

1. **Ensure your code builds**: `npm run build`
2. **Test your changes** in Obsidian
3. **Update documentation** if needed
4. **Add translations** for any new strings
5. **Sign the CLA** if you haven't already

### Branch Naming

Use the following prefixes:

| Prefix | Purpose |
|--------|---------|
| `feature/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation |
| `refactor/` | Code refactoring |
| `i18n/` | Translations |

Example: `feature/batch-export`, `fix/api-timeout`

### Submitting the PR

1. Push your branch to your fork
2. Open a Pull Request against `main`
3. Fill out the PR template completely
4. Link related issues using keywords (`Fixes #123`)
5. Request review from maintainers

### PR Template

Your PR description should include:

```markdown
## Summary
Brief description of changes

## Changes
- List of specific changes made

## Testing
How you tested these changes

## Screenshots
(if applicable)

## Checklist
- [ ] Code builds without errors
- [ ] Tested in Obsidian
- [ ] Documentation updated
- [ ] Translations added (if applicable)
- [ ] CLA signed
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, a maintainer will merge
4. Your contribution will be in the next release

---

## Issue Guidelines

### Bug Reports

Use the bug report template and include:

- **Claudian version**
- **Obsidian version**
- **Operating system**
- **Steps to reproduce**
- **Expected vs. actual behavior**
- **Console errors** (if any)
- **Screenshots** (if applicable)

### Feature Requests

Use the feature request template and include:

- **Problem description**: What problem does this solve?
- **Proposed solution**: How should it work?
- **Alternatives considered**: Other approaches you thought about
- **Additional context**: Mockups, examples, etc.

### Issue Labels

| Label | Meaning |
|-------|---------|
| `bug` | Something isn't working |
| `enhancement` | New feature or improvement |
| `documentation` | Documentation improvements |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |
| `question` | Further information requested |
| `wontfix` | This won't be worked on |

---

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Requests**: Code contributions

### Response Times

We try to respond to:
- **Critical bugs**: Within 48 hours
- **Other issues**: Within 1 week
- **Pull requests**: Within 1 week

### Recognition

All contributors are recognized in:
- Release notes
- Contributors list (coming soon)

---

## Questions?

If you have questions about contributing:

1. Check existing [documentation](wiki/)
2. Search [closed issues](https://github.com/Enigmora/claudian/issues?q=is%3Aissue+is%3Aclosed)
3. Open a new issue with the `question` label

---

Thank you for contributing to Claudian! Your efforts help make this project better for everyone.

---

<p align="center">
  <strong>Claudian</strong><br>
  <em>The ultimate Claude AI integration for Obsidian</em><br>
  Developed by <a href="https://enigmora.com">Enigmora SC</a>
</p>
