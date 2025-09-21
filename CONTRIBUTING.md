# Contributing

Thank you for your interest in contributing to this project. This guide explains how to set up a development environment, the conventions we follow, and how to propose changes so they are easy to review and accept.

## Code of Conduct

Please read the repository's Code of Conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). **All contributors must follow it.**

## Development workflow

1. Create a branch from the default branch (`next`):
   `git checkout -b feat/<scope>-short-description`
   _Use `feat`, `fix`, `chore` etc. for branch naming where it helps communicate intent._

2. Make small, focused commits that each pass tests and linting.
3. Rebase to keep history clean; avoid merge commits in feature branches.
4. Open a pull request when your change is ready for review.

## Issues and bug reports

- Search existing issues before filing: [Repository issues](https://github.com/agrawal-rohit/npm-library-template/issues)
- When opening an issue include:
  - A clear title and description
  - _Expected vs actual behavior_
  - _Steps to reproduce_ (minimal and verifiable)
  - Environment details (Node version, OS)
  - Relevant logs / stack traces (redact sensitive data)

For feature requests, explain the problem, proposed solution, and alternatives considered.

## Pull request guidelines

- Ensure all tests and lint checks pass locally before opening a PR: `pnpm test` and `pnpm run lint`.
- Include tests for bug fixes and new features.
- Reference related issues using GitHub keywords (e.g., `Closes #123`).
- Use a clear, descriptive title and body — explain _why_ the change is needed, not just _what_ changed.
- Update docs _(README or other docs)_ if behavior or public API changes.
- We typically squash or rebase when merging to keep the main branch history clean. If you need to preserve commits, explain why in the PR.

**Important:** do not mix unrelated changes in a single PR.

## Commit message convention (Conventional Commits)

We follow [Conventional Commits](https://www.conventionalcommits.org/).

Format:

```
type(scope)!: short summary
```

Examples:

- `feat(cli): add init command`
- `fix(core): handle edge case in parser`
- `docs: update README usage section`

Common types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`, `chore`, `revert`.
Use `!` and a `BREAKING CHANGE:` footer for breaking changes and include migration notes.

**Note:** Our release tooling derives semver bumps from commit types — write meaningful commit messages.

## Testing & coverage

- Run tests locally: `pnpm test`
- Add tests for new features and regressions for bug fixes.
- Always remember - quality over quantity

## Linting & formatting

- This repo uses **Biome** and **lint-staged** for pre-commit checks.
- Fix lint/format problems before committing:
  - `pnpm run lint`
  - `pnpm run format`
  - `pnpm run check`

If commit hooks block you, run the fix commands and re-commit.

## Documentation

- Keep `README.md` and other docs up to date for public-facing changes.
- Document new public APIs, CLI options, and breaking changes.
- Small documentation fixes _(typos, clarifications)_ are welcome.

## Release & versioning

- Releases are automated using `semantic-release` _(see `release.config.cjs`)_.
- **Do not** manually:
  - bump `package.json` version
  - create release tags

Release types are derived from Conventional Commits: `feat → minor`, `fix, perf → patch`, `BREAKING CHANGE → major`. Releases run from the `beta` and `main` branches when CI passes.

## Dependency policy

- Propose non-trivial dependency additions or upgrades via an issue _(consider bundle size, maintenance, licensing)_.
- Tooling/CI dependency changes may be restricted to maintainers.
- Security updates / critical fixes are welcome; include rationale and testing notes.

## Security reporting

- _Do not_ open public issues for security vulnerabilities.
- Use GitHub’s private Security Advisory workflow or contact maintainers privately _(see repository metadata)_.
- We will acknowledge receipt and coordinate disclosure and fixes.

## What not to change (maintainer-owned)

Avoid editing maintainer-owned automation files without prior discussion:

- `release.config.cjs`
- `commitlint.config.js`
- `lint-staged.config.js`
- `biome.json`
- `jest.config.ts`
- CI workflow files _(e.g., `.github/workflows/*`)_

If you believe a change is required, open an issue to discuss the reasoning.

## Recognition & credits

Contributors are credited via GitHub’s contributors graph, PR activity, and release notes derived from Conventional Commits. **Thank you for contributing!**
