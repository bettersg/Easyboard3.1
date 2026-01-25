# Linting and Formatting

This document outlines the linting and formatting standards for the EasyBoard monorepo. We use a combination of **Biome** for high-performance formatting and basic linting, and **ESLint** for specialized environment-specific rules (React, Next.js, React Native).

## Tools

### Biome

[Biome](https://biomejs.dev/) is our primary tool for formatting and static analysis. It is configured at the root of the repository.

- **Purpose**: Fast formatting of TypeScript, JSON, CSS, and Markdown files.
- **Config**: `biome.json` in the root directory.
- **Scope**: Entire monorepo.

### ESLint

We use [ESLint](https://eslint.org/) for more complex, framework-specific linting rules that Biome doesn't yet cover.

- **Purpose**: Specialized rules for Next.js (web), React Native (native), and shared packages.
- **Config**: Root configuration is shared via `packages/eslint-config`, and each workspace has its own `eslint.config.js` or `eslint.config.mjs`.
- **Scope**: Workspace-specific.

---

## Root Commands

You can run the following commands from the root of the monorepo:

| Command | Tool | Description |
|---------|------|-------------|
| `yarn format` | Biome | Automatically format and fix all files in the monorepo. |
| `yarn format:check` | Biome | Check if files are correctly formatted (used in CI). |
| `yarn lint` | Turbo / ESLint | Run ESLint across all workspaces using Turbo. |
| `yarn typecheck` | Turbo / tsc | Run TypeScript type checking across all workspaces. |

---

## Workspace Commands

If you need to run linting for a specific application or package:

```bash
# Web
yarn workspace web lint

# Native
yarn workspace native lint

# Common Package
yarn workspace @repo/common lint
```

---

## Automation

### Git Hooks (Husky & lint-staged)

We use **Husky** and **lint-staged** to ensure that all committed code follows our standards.

- When you run `git commit`, `lint-staged` triggers `biome check --write` on the staged files.
- If formatting or basic linting fails, the commit will be blocked.

### VS Code Integration

To get the best development experience, it is highly recommended to install the following extensions:

1. **Biome Extension**: Set it as your default formatter for supported file types.
2. **ESLint Extension**: For real-time linting feedback in the editor.

#### Recommended Settings (`.vscode/settings.json`)

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports.biome": "explicit",
    "source.fixAll.eslint": "explicit"
  }
}
```
