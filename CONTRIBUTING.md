# Contributing to BuilderIO/skills

Thank you for your interest in contributing! We welcome contributors of all types — code, tests, documentation, and design — and appreciate your time and effort. This document explains how to report issues, propose changes, and get your pull requests reviewed and merged quickly.

---

## Table of contents
- [How can I contribute?](#how-can-i-contribute)
- [Code of conduct](#code-of-conduct)
- [Filing issues](#filing-issues)
- [Proposing changes (pull requests)](#proposing-changes-pull-requests)
- [Development setup](#development-setup)
- [Repository workflows & checks](#repository-workflows--checks)
- [Code style & commit messages](#code-style--commit-messages)
- [Review process & expectations](#review-process--expectations)
- [License](#license)

---

## How can I contribute?

You can help in many ways:

- Report bugs with a minimal reproducible example.
- Add or improve documentation and skill guidelines.
- Fix bugs and implement small features via PRs.
- Review other people's PRs.

If you're unsure where to start, check the repository issues and look for labels like `good first issue` or `help wanted`.

## Code of conduct

This project follows an inclusive code of conduct. Please be respectful and considerate in all interactions. If there is no CODE_OF_CONDUCT.md in this repo yet, please follow standard community etiquette (be constructive, assume good intent, and be patient).

## Filing issues

When filing an issue, please include:

- A clear, descriptive title.
- A concise description of the problem or request.
- Steps to reproduce (minimum reproducible example preferred).
- Expected vs. actual behavior.
- Environment details (OS, Node version, browser if relevant).
- Any relevant logs, stack traces, or screenshots.

If you're proposing a feature, explain the use case and suggested API or UX.

---

## Proposing changes (Pull Requests)

Follow these steps to propose changes:

1. Fork the repository and create a branch with a descriptive name (e.g. `fix/missing-docs` or `feat/new-skill`).
2. Keep changes small and focused — one logical change per PR. Smaller PRs get reviewed faster.
3. Update or add necessary documentation for your change.
4. Run the local checks and make sure they pass before committing.
5. Open a pull request with a clear title and a short summary. Use this structure in the PR body:
   - Summary (one-line)
   - Why (why this change is needed)
   - What changed (bullet list)
   - How to test (steps)
   - Notes (migrations, breaking changes)
6. Request reviews from specific maintainers or teams and explain what you want reviewed (logic, tests, docs).

We recommend creating draft PRs for early feedback on larger changes.

## Development setup

1. Clone this repository:
   ```bash
   git clone https://github.com/BuilderIO/skills.git
   cd skills
   npm install
   ```

2. Set up the agent-native framework path:

   On Windows (Command Prompt):
   ```DOS
   git clone https://github.com/BuilderIO/agent-native.git ../agent-native
   set AGENT_NATIVE_FRAMEWORK_PATH=../agent-native
   ```
   On Mac/Linux or PowerShell:
   ```bash
   git clone https://github.com/BuilderIO/agent-native.git ../agent-native
   export AGENT_NATIVE_FRAMEWORK_PATH=../agent-native
   ```

   This environment variable is required for local checks to work properly. The skills repository depends on code from BuilderIO/agent-native, which is cloned separately rather than installed as a package.

## Repository workflows & checks

This repository intentionally has zero standard npm dependencies. Instead, it uses specific scripts to sync and validate the skills structure.

- Running Local Checks: Before opening a PR, ensure your changes pass the local check using the environment variable you set in the step above:
```bash
npm run check
```

This command runs the sync and validation checks specific to the skills repository. All checks must pass before submitting a pull request.

What `npm run check` does:

   - Syncs skill definitions with the agent-native visual plans
   - Validates skill structure and configuration
   - Ensures all changes are compatible with the agent-native framework

If the check fails, review the error messages and fix the issues before committing.

## Code style & commit messages

   1. Use clear, descriptive commit messages explaining the "why" behind your changes.
   2. Keep commits atomic — one logical change per commit.
   3. Follow the PR structure outlined above (Summary, Why, What changed, How to test).
   4. Ensure code is readable and well-documented.
   5. Review the existing codebase to match the project's style conventions.

## Review process & expectations

   1. Submit a pull request with a clear description and meaningful title.
   2. At least one maintainer review is required before merging.
   3. All CI checks must pass (`npm run check` and GitHub Actions workflows).
   4. Address feedback promptly and mark conversations as resolved.
   5. Maintainers will review as soon as they're able.

We appreciate your patience and collaboration throughout the review process!

## License

This project is licensed under the terms specified in the [LICENSE](./LICENSE) file in the repository root.
