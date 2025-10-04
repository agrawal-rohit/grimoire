# Contributing

Thanks for your interest in contributing to `{{ name }}`! This guide will help you get started with the development process, from setting up your environment to submitting changes.

## Table of Contents

- [Getting Help](#getting-help)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing & Code Quality](#testing--code-quality)
- [Documentation](#documentation)
- [Release Process](#release-process)
- [Dependencies](#dependencies)
- [Security](#security)
- [Maintainer Guidelines](#maintainer-guidelines)
- [Recognition](#recognition)

## Getting Help

If you have questions, ideas, or need help:
- Search existing [GitHub Discussions](https://github.com/{{ authorGitUsername }}/{{ name }}/discussions) first
- Open a new discussion for questions and proposals
- Create a [GitHub Issue](https://github.com/{{ authorGitUsername }}/{{ name }}/issues) for bug reports

Please be specific about your environment and include steps to reproduce issues when reporting bugs.

## Development Setup

1. Fork the repository
2. Install dependencies: `pnpm install`
{{#templateHasPlayground}}
3. Start the local playground: `pnpm dev`
{{/templateHasPlayground}}
{{^templateHasPlayground}}
3. Start development (watch): `pnpm dev`
{{/templateHasPlayground}}
4. Run the test suite: `pnpm test`
5. Build the library: `pnpm build`

## Making Changes

### Branching Strategy

- Create feature branches from `main`
- Use descriptive branch names: `feat/<scope>-description` or `fix/<scope>-description`
- Keep changes focused and atomic

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short description

Optional longer description

BREAKING CHANGE: details (if applicable)
```

Common types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`, `chore`

### Pull Requests

- Run tests with coverage: `pnpm cov`
- Include tests for new features and bug fixes
- Reference related issues using GitHub keywords (e.g., `Closes #123`)
- Use a clear title and explain the why behind changes
- Keep PRs focused on a single purpose

## Testing & Code Quality

- Run tests with coverage: `pnpm cov`
- Check linting: `pnpm run lint`
- Format code: `pnpm run format`
- Run type checks: `pnpm run check`

Pre-commit hooks will automatically check your code quality. If they block your commit, run the appropriate fix commands and try again.

## Documentation

- Update `README.md` for public-facing changes
- Document new APIs, CLI commands, and configuration options
- Include examples for complex functionality
- Keep documentation consistent with code changes

Small documentation fixes (typos, clarifications) are always welcome!

## Release Process

Releases are automated through our CI system:

1. **Development**: All changes happen on `main`
2. **Release Candidates**: Cut `release/vX.Y.Z` branches from `main`
   - Each commit creates RC tags (`vX.Y.Z-rc.1`, `vX.Y.Z-rc.2`, etc.)
   - [GitHub Pre-release](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases) are automatically created
3. **Production Release**: Create a GitHub Release with tag `vX.Y.Z` _(not marked as prerelease)_
   - CI will promote to production distribution channels
   - The `vX.Y.Z` tag is permanently associated with the release

**Do not** manually bump versions or create release tags.

## Dependencies

- Propose new dependencies via GitHub Issues first
- Consider bundle size, maintenance burden, and licensing
- Security updates and critical fixes are always welcome
- Include rationale and testing notes for dependency changes

## Security

- **Do not** report security vulnerabilities in public issues
- Use GitHub's [private vulnerability reporting](https://github.com/{{ authorGitUsername }}/{{ name }}/security/advisories)
- We'll acknowledge reports within 48 hours and work on a fix

## Maintainer Guidelines

Some guidelines for maintainers:

- Use pull requests for all changes (avoid pushing directly to `main`)
- Release branches must strictly match `release/v<major>.<minor>.<patch>` (e.g., `release/v1.2.3`)
- Pre-release tags use `vX.Y.Z-rc.N`; production tags must be `vX.Y.Z`
- Production GitHub Releases must not be marked as prereleases
- Keep required checks and branch protection enabled on `main` and `release/v*` branches
- Avoid modifying automation without discussion:
  - Configuration files (`biome.json`, `commitlint.config.js`, etc.)
  - CI workflows (`.github/workflows/*`)
  - Release tooling

If changes to these areas are needed, open an issue to discuss first.

## Recognition

Contributors are recognized through:

- GitHub's contributor graph
- Release notes (generated from commit messages)
- Community acknowledgments

Your contributions are greatly appreciated!
