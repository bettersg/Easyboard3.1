# Migrating an old checkout to the runtimes layout

The monorepo moved from `apps/{native,web,functions}` and a shared `packages/ui` to `runtimes/{app,functions}`. The Next.js app is gone, Expo web is the only web target, NativeWind is replaced by uniwind, and Yarn 4.18.1 is pinned through `.yarn/releases`.

`git pull` rewrites tracked files only. Files that are ignored at a path the new tree no longer has stay on disk. A pre-move checkout keeps a complete `apps/` tree with its `node_modules`, `.env` files and build output, so the working directory holds two layouts at once and Yarn resolves workspace globs that no longer exist. The steps below take that checkout to the new layout with nothing stale left behind.

## 1. Confirm nothing is local only

`git status` prints no ahead/behind line when the branch has no upstream configured, which hides unpublished commits. Check the branches themselves:

```bash
git fetch origin && git fetch upstream
git log --oneline <branch> --not --remotes
git stash list
```

An empty result means every commit on that branch exists on some remote. Push or tag anything that appears before moving on. Being `2 ahead` of `origin/<branch>` is not proof of unpublished work either: the commits may have reached upstream through a different branch that was cut from the same tip.

```bash
git for-each-ref --contains <sha> --format='%(refname)'
```

lists the refs that carry a commit, so a suspicious commit can be traced to the branch that published it.

## 2. Fast-forward `develop` to upstream

```bash
git switch develop
git merge --ff-only upstream/develop
```

`--ff-only` stops instead of creating a merge commit when local `develop` holds commits upstream lacks, which is the case worth interrupting.

## 3. Salvage the env files

The move collapsed the three `apps/*` env files into two. Copy them before deleting anything, because they are ignored and unrecoverable from git.

| Old | New |
| --- | --- |
| `apps/native/.env` | `runtimes/app/.env` |
| `apps/web/.env` | `runtimes/app/.env` (values already present, prefix changes to `EXPO_PUBLIC_*`) |
| `apps/functions/.env` | `runtimes/functions/.env` |

```bash
cp apps/native/.env runtimes/app/.env
cp apps/functions/.env runtimes/functions/.env
```

Compare the two app env files key by key before merging them. If every shared value matches, the native file is sufficient and the web file can be dropped. Where a value differs, the web value belongs under the same `EXPO_PUBLIC_*` name, since one app now serves both targets.

`runtimes/app/.env.example` lists one key that no old file contains: `EXPO_PUBLIC_FIREBASE_VAPID_KEY`. Web push registration in `runtimes/app/src/services/notificationService.web.ts` reads it as `vapidKey`, so `getToken` returns nothing until the Web Push certificate key from the Firebase console is pasted in.

Confirm the copies are ignored and not staged:

```bash
git status --porcelain
```

## 4. Delete the ghost trees

```bash
du -sh apps
rm -rf apps packages
```

Both directories are stale. `apps/` keeps the old workspaces; `packages/` keeps the retired `eslint-config` and its dependencies. Git will not remove either, because everything inside them is ignored.

To find leftovers by name instead of memory, compare each top-level entry against the new tree:

```bash
for d in */; do d=${d%/}; [ "$d" = node_modules ] && continue; git cat-file -e "HEAD:$d" 2>/dev/null || echo "STALE: $d"; done
```

## 5. Clear the build caches

These artifacts belong to the old layout and regenerate on the next build:

```bash
rm -rf .next .expo .firebase .turbo
rm -f .DS_Store
```

`.firebase/` holds the hosting deploy cache for the removed Next.js app (`.firebase/easyboard-sg/hosting/_next/`, plus a cache file keyed on the base64 of `apps/web/out`), and `.turbo/cache` was hashed against the old workspace globs. `.next/` is the last trace of a framework that is no longer installed.

`.rules` is worth reading before deleting. On an old checkout it instructs contributors and agents to build primitives in `/packages/ui`, compose pages there, add routes under `/apps/web` and `/apps/native`, use expo-router and NativeWind, and prefer the Next.js app router. Every one of those paths and libraries is gone, so the file actively sends new work to the wrong layout. It is untracked, so copy it somewhere first if the wording matters:

```bash
mkdir -p /tmp/backup && cp .rules /tmp/backup/
rm .rules
```

Same treatment for any untracked data snapshots sitting in the repo root. Git cannot restore them.

Keep `.husky/_/`: `yarn install` generates it, and removing it disables the pre-commit hook without any error.

## 6. Reinstall dependencies

Workspace globs changed from `apps/*` to `runtimes/*`, so node_modules built for the old layout resolves the wrong tree. Remove every install, then reinstall:

```bash
rm -rf node_modules runtimes/*/node_modules
rm -rf .yarn/unplugged .yarn/install-state.gz
yarn install
```

`yarn install` fetches through the global Yarn cache, so a reinstall of the full lockfile takes seconds rather than minutes.

## 7. Verify the install

```bash
yarn workspaces list
ls -ld node_modules/app node_modules/functions
yarn workspace functions typecheck
yarn workspace app typecheck
git status --porcelain
```

Expect three workspaces (`.`, `runtimes/app`, `runtimes/functions`), symlinks pointing at `../runtimes/app` and `../runtimes/functions`, exit code 0 from both typechecks, and no changes in `git status`.

## Known warnings after a clean install

These come from the lockfile and predate the layout move:

- `firebase-admin@14.5.0` falls outside the `^11 || ^12 || ^13` range that `firebase-functions-test` requests. Functions tests using that package fail on the peer.
- `jest` is not installed for `runtimes/functions`, `@react-native/jest-preset` is missing for `jest-expo`, and `metro`, `metro-cache` and `@react-native/metro-config` are not installed for `uniwind` and `react-native-worklets`. `yarn workspace app test` and Metro bundling break until those are added.

## 8. Local dev after the move

`firebase.json` deploys functions from the pruned `out/` tree, while local emulation reads `runtimes/functions/firebase.emulators.json` and serves `runtimes/functions` from `lib/`. `yarn dev` starts both workspaces through turbo. `wiki/RUNNING_AND_DEPLOYING_FUNCTIONS.md` covers the emulator in detail.
