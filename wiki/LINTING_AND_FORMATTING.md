# Linting and Formatting

This document outlines the linting and formatting standards for the EasyBoard monorepo. We use a combination of **Biome** for high-performance formatting and basic linting, and **oxlint** for lint rules (TypeScript, React, React Hooks and the React Compiler, imports, Expo).

## Tools

### Biome

[Biome](https://biomejs.dev/) is our primary tool for formatting and static analysis. It is configured at the root of the repository.

- **Purpose**: Fast formatting of TypeScript, JSON, CSS, and Markdown files.
- **Config**: `biome.json` in the root directory.
- **Scope**: Entire monorepo.

### oxlint

We use [oxlint](https://oxc.rs/docs/guide/usage/linter) for lint rules. It replaced ESLint and typescript-eslint, which cannot run on TypeScript 7.

- **Purpose**: Rules for the Expo app (iOS, Android and web) and Cloud Functions.
- **Config**: Each workspace has its own `.oxlintrc.json`, migrated from the old ESLint configs with `@oxlint/migrate`. The app's config loads `eslint-plugin-expo` as a JS plugin for Expo's environment-variable rules.
- **Type-aware rules**: none are enabled. If wanted, install `oxlint-tsgolint` (built on typescript-go, the TypeScript 7 compiler) and run `oxlint --type-aware`.
- **Scope**: Workspace-specific.

---

## Root Commands

You can run the following commands from the root of the monorepo:

| Command | Tool | Description |
|---------|------|-------------|
| `yarn format` | Biome | Automatically format and fix all files in the monorepo. |
| `yarn format:check` | Biome | Check if files are correctly formatted (used in CI). |
| `yarn lint` | Turbo / oxlint | Run oxlint across all workspaces using Turbo. |
| `yarn typecheck` | Turbo / tsc | Run TypeScript 7 type checking across all workspaces. |

---

## Workspace Commands

If you need to run linting for a specific application or package:

```bash
# Expo app (iOS, Android, web)
yarn workspace app lint

# Cloud Functions
yarn workspace functions lint
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
2. **oxc Extension** (`oxc.oxc-vscode`): For real-time oxlint feedback in the editor.

#### Recommended Settings (`.vscode/settings.json`)

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports.biome": "explicit",
    "source.fixAll.oxc": "explicit"
  }
}
```
