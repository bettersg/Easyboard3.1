# EasyBoard: Expo consolidation migration plan

Oct 2, 2026 · @zy

## Summary

EasyBoard moves from two apps (Next.js for web, Expo for native) joined by a shared package to one Expo app serving iOS, Android and web. Cloud Functions stays as the only other workspace. All work happens on a new branch, so commit `920a66c` is never modified and can be restored at any point.

| Step | Outcome | Ends with | Status |
| --- | --- | --- | --- |
| 0. Safety net | Tag, new branch, backup of untracked files | Tag `pre-expo-consolidation` exists | Done |
| 1. Remove Next.js and Solito | Expo web is the default `dev` and `build` path; `apps/web` is gone | One commit, app runs on web and Android | Done, `a84287e`, tag `step-1-done` |
| 2. Restructure | `runtimes/app` and `runtimes/functions`; `packages/common` folded into the app | One commit, no behaviour change | Done, `3259b14`, tag `step-2-done` |
| 3. Verify | Web, Android, iOS and functions run and build cleanly | Checklist signed off | Signed off by the owner on 2 Oct 2026 |
| 4. Assess SDK 58 beta | Written list of changes needed to adopt SDK 58 and its Rust transformer | Assessment done; the upgrade is follow-on work | Assessment done; upgrade in progress |

### Starting state

- Branch `feat/monorepo-migration` at `920a66c`. It does not track a remote branch.
- 27 paths have uncommitted changes. They include the Solito to `expo-router` replacement in `packages/common`, `react-dom` 19.0.0 added to `apps/native`, and the Firebase env fallback in `firebase.web.ts`.
- The uncommitted Turbopack changes to `apps/web` become irrelevant once step 1 deletes that app.
- Expo web already runs through onboarding (tested by the owner). Typecheck passes in `@repo/common` and `native`. The Android bundle builds.
- Three known gaps carry into step 1: the browser Maps key is missing from `apps/native/.env`, the route guard exists only in the Next layout, and one Solito import remains in `apps/web`.

## Step 0: Safety net

The migration runs in a second git worktree, so the current folder stays at `920a66c` with its env files, native build folders and installed packages untouched. Reverting then means going back to the original folder; nothing has to be reconstructed.

### What git alone does not protect

| Item | Why it matters | Protection |
| --- | --- | --- |
| `apps/native/.env`, `apps/web/.env`, `apps/functions/.env` | Untracked; hold the Firebase and Maps keys | Copied to a backup folder outside the repo |
| The 27 uncommitted paths | Not in any commit yet | Committed as the first commit on the new branch |
| `apps/native/android` (7.8 GB) and `ios` | Ignored build output; slow to regenerate | Left in the original folder, never moved |
| `node_modules` | Already altered by the `react-dom` install | Re-synced with `yarn install` after switching back |
| Firebase Hosting, Functions, EAS | Deploys cannot be undone by git | No deploys from the new branch until step 3 passes |

Do not use `git stash` for any of this. The repo already holds 11 stashes, and a stash is easy to lose track of.

### Set-up

Done on 2 Oct 2026. The worktree is `../Easyboard3.1-expo`; the first commit on the branch is `daedf36`; the backup folder is `~/Documents/repos/Easyboard3.1-env-backup/`. `.rules` turned out to be gitignored, so it was backed up and copied into the worktree too. `yarn install` in the original folder reformatted two `package.json` files; those edits were reverted so `git status` stayed clean.

1. Tag the restore point: `git tag pre-expo-consolidation 920a66c`.
2. Back up the three `.env` files to a folder outside the repo, keeping their relative paths.
3. Create the working branch from the current tree: `git switch -c feat/expo-consolidation`. The uncommitted changes come along.
4. Commit them as `wip: solito removal and expo web prerequisites`. The pre-commit hook's typecheck is expected to fail on apps/web, which still imports Solito and is deleted in step 1. The owner has agreed that --no-verify is acceptable on intermediate commits, provided the final state passes every check.
5. Return the original folder to the restore point: `git switch feat/monorepo-migration`, then `yarn install`.
6. Confirm the original folder is clean: `git status` shows nothing and `git rev-parse HEAD` matches the tag.
7. Create the worktree: `git worktree add ../Easyboard3.1-expo feat/expo-consolidation`.
8. In the worktree, run `yarn install` and copy the `.env` files in from the backup.

### Rules while the migration runs

- Every step ends in one commit and a tag (`step-1-done`, `step-2-done`). Rolling back one step is `git reset --hard <previous tag>` followed by `yarn install`.
- Nothing is pushed with `--force`. The original branch is never rebased or reset.
- Google Cloud key restrictions are only added to, never narrowed, so the Next app keeps working from the original folder.
- Stop any dev server running from the original folder before starting one in the worktree; both use ports 8081 and 3001.

### How to revert

| Situation | Action |
| --- | --- |
| Abandon the whole migration | `git worktree remove ../Easyboard3.1-expo`, then `git branch -D feat/expo-consolidation`. The original folder is already at `920a66c`. |
| Undo the latest step only | In the worktree: `git reset --hard step-N-done`, `yarn install`. |
| Recover an env file | Copy it back from the backup folder. |
| A deploy went out by mistake | Redeploy from the original folder; git cannot undo it. |

## Step 1: Remove Next.js and Solito; make Expo web the default

At the end of this step `apps/web` no longer exists, `yarn dev` starts the Expo server with web open, and `yarn build` produces a static web export. The folder layout does not change yet; that is step 2.

### 1a. Port what only the Next shell provides

Three behaviours live in `apps/web` and would be lost by deleting it.

- [x] Route guard: mount `AuthRouteGuard` in `apps/native/app/_layout.tsx`, on web only, so native behaviour does not change.
- [x] Page scrolling and background: copy the `html` and `body` rules from `apps/web/global.css` into the Expo app's `global.css`, targeting `#root` instead of `#__next`. Expo's default sets `overflow: hidden` on the body.
- [x] Font: nothing to port. PT Sans is loaded through `next/font`, but React Native Web's `Text` sets its own system font and no component applies PT Sans, so text already renders in the system font on both platforms. Adopting PT Sans everywhere would be a design change, done later with `expo-font`.

### 1b. Environment and keys

- [x] Add `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` to the app's `.env` with the browser key the Next app uses. It was already there when step 1 started. Its absence causes the "For development purposes only" watermark and empty address lookups.
- [ ] Owner: in Google Cloud, add `localhost:8081` and the production web domain to that key's allowed referrers.
- [x] Remove the `NEXT_PUBLIC_*` fallbacks from the six shared files that read them, leaving only `EXPO_PUBLIC_*`.
- [x] Update `apps/native/.env.example` to match.

### 1c. Delete the Next app and its dependencies

- [x] Delete `apps/web`. This also removes the last Solito import.
- [x] Remove from all `package.json` files: `next`, `@expo/next-adapter`, `webpack`, `raf`, `serve`, `moti`, `react-native-worklets`, `@react-native/assets-registry`, `@googlemaps/js-api-loader`. None is imported by the Expo app.
- [x] `react-native-worklets` must not be carried into the app: it targets Reanimated 4 and the app runs Reanimated 3.
- [x] Add to the Expo app the web libraries it now owns: `firebase` and `@react-google-maps/api`.
- [x] Replace the single `react-icons/md` import (`MdGpsFixed`) with an inline SVG, then drop `react-icons`. Without tree shaking that one import adds the whole Material icon set, about 28% of the web bundle by raw size.
- [x] Delete `packages/eslint-config/next.js` and `packages/typescript-config/nextjs.json`.
- [x] Storybook lives in `apps/web` and goes with it. Keep the story files; re-homing Storybook is a follow-up after step 3.

### 1d. Make Expo web the default

- [x] In `app.config.ts`, set `web.bundler` to `metro` and `web.output` to `single`.
- [x] App scripts: `dev` runs `expo start --web`; `build` runs `expo export --platform web`, which writes to `dist`.
- [x] Root scripts: remove `web:dev`; `yarn dev` and `yarn build` keep going through Turborepo.
- [x] `turbo.json`: change the build outputs from `.next/**` to `dist/**`.
- [x] `firebase.json`: replace the Next hosting integration (`source` plus `frameworksBackend`) with static hosting of `dist` and a rewrite of every path to `/index.html`. Prepare the change; do not deploy.

### 1e. Documentation

- [x] Rewrite the README sections that describe Next.js and Solito.
- [x] Update `.rules`, which still instructs agents to follow Solito and the Next App Router. It is gitignored, so the change lives only in each checkout's copy.

### Changes beyond the checklist

- [x] Root `package.json` declared `expo` 52, `react` 19.2, `react-dom` 19.2, `react-native` 0.78, `clsx` and `tailwind-merge` for the Next app's hoisting. They are removed; the install now has one React (19.0.0), one React Native (0.79.6) and one Expo (53).
- [x] `@types/react-native-web` depends on `react-native: *`, which pulled in React Native 0.83 and hoisted Metro 0.83 over Expo 53's Metro 0.82, breaking `expo export`. A root resolution pins it to 0.79.6.
- [x] `yarn.config.cjs` constraints pinned `next` and React 18.3.1; they now pin `react` and `react-dom` to 19.0.0.
- [x] Web Firebase code imported the internal `@firebase/*` packages; it now imports `firebase/*`, the package the app declares.
- [x] `storybook` and `@storybook/react` became dev dependencies so the parked story files still typecheck.
- [x] `.env.example` gained `EXPO_PUBLIC_FIREBASE_VAPID_KEY`, which the web notification service reads.
- [x] Cloud Functions CORS allowed `http://localhost:3001`, the Next dev port; it now allows `http://localhost:8081`. `wiki/RUNNING_AND_DEPLOYING_FUNCTIONS.md` updated to match.

### Done when

- [x] `grep` finds no `next` or `solito` import outside `node_modules`. Three attribution comments linking to Solito's examples remain.
- [x] Typecheck and Biome pass.
- [x] `yarn dev` serves the web app; landing, login, onboarding and the map address picker work in a browser.
- [x] `yarn build` produces `dist` without errors.
- [x] Commit and tag `step-1-done`.

## Step 2: Restructure into `runtimes/app` and `runtimes/functions`

This step only moves files and rewrites import paths; the app must behave exactly as it did at `step-1-done`. The repo stays a Yarn workspace with two members, and `packages/` disappears.

### Target layout

```text
repo root
├── runtimes/
│   ├── app/                  Expo app: iOS, Android, web
│   │   ├── src/
│   │   │   ├── app/          routes only (expo-router)
│   │   │   ├── screens/      was packages/common/src/pages
│   │   │   ├── components/
│   │   │   ├── contexts/
│   │   │   ├── hooks/
│   │   │   ├── provider/
│   │   │   ├── services/     .native.ts and .web.ts pairs stay together
│   │   │   ├── stores/
│   │   │   ├── helpers/
│   │   │   └── types/
│   │   ├── assets/
│   │   ├── plugins/
│   │   ├── public/           static web files
│   │   └── app.config.ts, metro.config.js, babel.config.js,
│   │       tailwind.config.ts, global.css, tsconfig.json, package.json
│   └── functions/            Firebase Cloud Functions, own workspace
├── wiki/
└── package.json, firebase.json, eas.json, turbo.json
```

This follows Expo's guidance: `src/app` holds routes only, other code sits in sibling folders under `src`, and config files plus `public` stay at the app root ([core concepts](https://docs.expo.dev/router/basics/core-concepts), [src directory](https://docs.expo.dev/router/reference/src-directory)). `pages` is renamed `screens` so it is not mistaken for a routing folder.

### 2a. Move files

Use `git mv` so history follows the files.

- [x] `apps/native` to `runtimes/app`, then its `app` folder to `runtimes/app/src/app`.
- [x] Each folder in `packages/common/src` to `runtimes/app/src`, with `pages` becoming `screens`.
- [x] `apps/functions` to `runtimes/functions`.
- [x] Story files move with their components.

Moving the routes also means updating `index.js`, which loads them with `require.context('./app')`. Done: `index.js` is deleted, `main` is `expo-router/entry`, and the root layout imports `global.css`.

### 2b. Rewrite imports

- [x] Point the `@/*` path alias in `tsconfig.json` at `./src/*` (it currently points at `./*`).
- [x] Replace `@repo/common/<area>` with `@/<area>` in the 16 route files that use it; `@repo/common/pages` becomes `@/screens`.
- [x] Imports inside the moved shared code are relative and need no change.

### 2c. Merge `package.json`

This is the riskiest part of the step.

- [x] Where `apps/native` and `packages/common` both declare a package, keep the `apps/native` version. `packages/common` declares newer ranges for `expo-location`, `expo-image-picker`, `react-native-device-info`, `react-native-maps` and `react-native-reanimated` that do not match SDK 53's native modules.
- [x] Add packages only `packages/common` declared and the code uses: `react-native-actions-sheet`, `zustand`, `clsx`, `tailwind-merge`.
- [x] Treat packages nothing imports as removal candidates, and confirm each with a build before dropping it: `@gorhom/bottom-sheet`, `expo-linear-gradient`, `react-native-dots-pagination`, `react-responsive`, `use-debounce`, `class-variance-authority`, `react-native-reanimated-carousel`, `@expo/react-native-action-sheet`. All dropped; the web, Android and iOS bundles build without them.
- [x] Rename the workspace from `native` to `app` and set root `workspaces` to `runtimes/*`.
- [x] Run `npx expo install --check`. Today it flags `expo-image` 3.0.11 (SDK 53 expects ~2.4.1), `react-native-svg` and `jest-expo` 52. After the merge it lists exactly the same mismatches as before.

### 2d. Update config that encodes the old layout

- [x] `metro.config.js`: delete the manual monorepo settings (`watchFolders`, `nodeModulesPaths`, `extraNodeModules`, `disableHierarchicalLookup`) and the custom resolver for `@repo/common`. Expo configures monorepos automatically since SDK 52 ([monorepo guide](https://docs.expo.dev/guides/monorepos)). Keep the NativeWind wrapper.
- [x] `tailwind.config.ts`: content globs point at `./src/**`.
- [x] `app.config.ts`: the notifee Maven path and the dotenv path are relative to the repo root. `runtimes/app` sits at the same depth as `apps/native`, so they should still resolve; verify with a prebuild. Verified: an Android prebuild's Maven path resolves to the notifee libs.
- [x] `firebase.json`: hosting directory becomes `runtimes/app/dist`; the functions predeploy still runs `turbo prune functions`, so confirm its output path. `turbo prune` keeps the workspace path, so `function-predeploy.js` now sets `main` to `runtimes/functions/src/index.js`.
- [x] Root scripts: `native:*` become `app:*`.
- [x] Inline `packages/eslint-config` and `packages/typescript-config` into the two runtimes, then delete `packages/`.
- [x] Lint-staged files and the Husky hook: confirm they still match the new paths.
- [x] README, wiki and `.rules`: update every path.

### Changes beyond the checklist

- [x] Removing `disableHierarchicalLookup` let `@nandorojo/iconic` bundle its own nested `react-native-svg` 12.5.1, a second copy of a native module. A root resolution points it at the app's 15.15.1.
- [x] `apps/native/node_modules` moved with `git mv` and went stale; it duplicated Reanimated and Gesture Handler in the bundle until it was deleted and reinstalled. Anyone moving workspaces should delete their `node_modules` first.
- [x] The app's ESLint config now covers `src/` (the old native config ignored it, and `@repo/common` was linted separately). That surfaced duplicate re-exports of `fcmService` and `notificationService` in `services/index.ts`; the duplicates are removed (same objects).
- [x] The app keeps `eslint-config-expo` 10, the version the shared config actually resolved, and `typescript` 5.7.3 to match the root.
- [x] Biome now formats `package.json` files fully expanded, the way Yarn writes them; before, every `yarn install` left `biome check` failing.
- [x] `.husky/_` is generated and gitignored, so hooks do not run in a new worktree until `yarn prepare` runs there.

### Done when

- [x] Typecheck and Biome pass.
- [x] Web and Android bundles build with the same module count, within a few modules, as at `step-1-done`. Android 1,864 vs 1,842 and web 1,345 vs 1,321; the extra modules are `expo-router/entry`'s runtime and a few nested helpers.
- [x] No file references `apps/`, `packages/` or `@repo/`.
- [x] Commit and tag `step-2-done`.

## Step 3: Verify the app runs and builds cleanly

Nothing is deployed and nothing merges to `develop` until every item here passes. Any failure is fixed on the branch, or the step that caused it is rolled back to its tag.

### Static checks

- [x] `yarn install --immutable` succeeds from a clean clone of the branch.
- [x] Typecheck, Biome and ESLint pass in both workspaces.
- [x] `npx expo install --check` and `npx expo-doctor` report nothing new compared with `920a66c`. `expo-doctor` fails 3 checks, down from 6; `clsx` is newly flagged as unmaintained only because the app now declares it directly.
- [x] The Husky pre-commit hook passes without `--no-verify`.

### Web

- [x] `yarn dev` starts and the browser console shows no errors on the landing page. On this machine `functions:dev` needs a global `firebase` CLI that is not installed, so Turbo aborts `yarn dev`; `yarn app:dev` was used, and `npx firebase-tools` runs the emulator.
- [x] Unauthenticated visits to `/home`, `/map` and `/directions` redirect to `/login`.
- [x] Log in with a real phone number and walk through onboarding 1 to 4.
- [x] On onboarding step 4 and the map screen: no watermark, and tapping the map fills in an address.
- [x] Directions: open a destination, pick a route, reload the page. The query parameters (`lat`, `lng`, `name`, `photoUri`, `routeIndex`) must survive the reload.
- [x] Back button: after landing, login, home, directions, the browser back button returns one screen at a time. This checks the change from `router.push` to `router.navigate`.
- [x] Long screens scroll.
- [x] Images render at the right size (the shared `Image` now wraps `expo-image`).
- [x] `yarn build` succeeds; serve `dist` locally and reload a deep link such as `/directions?...` to prove the rewrite rule works.
- [x] Record the compressed size of the web bundle. Before this work it was 1.15 MB; Next shipped about 480 to 500 kB. Now 708 kB gzipped.

### Native

- [x] Metro builds the Android and iOS bundles without errors.
- [x] `npx expo-modules-autolinking verify -v` lists the expected native modules. SDK 53's CLI has no `-v`; `verify` passes and the same 39 modules link as at the baseline.

Found during verification, not caused by this work: the login screen nests two `accessibilityRole='form'` views, which logs a nested `<form>` error in the browser. The same code exists at `920a66c`.

Device builds are outside this effort by the owner's decision. That leaves push notifications, background location sharing, the phone call and the image picker untested until the owner builds; they are the main unverified area.

### Functions and hosting

- [x] `yarn workspace functions build` succeeds and the emulator starts.
- [x] Run the functions predeploy commands by hand and check that `turbo prune functions` still produces the `out` folder `firebase.json` expects.
- [x] Serve the web export through the Firebase Hosting emulator with the new static config. Deep links return `index.html`. The functions emulator reflects any CORS origin, so the allow-list can only be checked in code.

### Sign-off

- [x] Owner confirms the checklist (2 Oct 2026).
- [ ] Only then: deploy web, and open a pull request into `develop`.
- [ ] Keep the restore point until the pull request merges: the original folder and the `pre-expo-consolidation` tag stay until then.

## Step 4: Assess the move to SDK 58 beta and its Rust transformer

The Rust transformer cannot switch on for this project as configured: NativeWind 4 needs a Babel preset, and a non-default Babel config makes the transformer fall back to Babel for every file. The assessment below was done on 2 Oct 2026 from Expo's changelogs and the npm registry. Nothing was upgraded or built.

### Assessment: what each hop changes for this repo

All five hops are feasible while staying on NativeWind 4, so the SDK upgrade and the Rust transformer are two separate pieces of work. The first hop (53 to 54) is the largest. Three third-party items carry most of the risk: notifee, React Native Firebase, and gesture-handler 3 at SDK 58.

Expected versions per SDK, read from each release's `bundledNativeModules.json` on 2 Oct 2026:

| SDK | React Native | React | expo-router | Reanimated | Gesture Handler | Minimum Xcode |
| --- | --- | --- | --- | --- | --- | --- |
| 53 (today) | 0.79.6 | 19.0.0 | 5.1 | 3.17 | 2.24 | |
| 54 | 0.81.5 | 19.1.0 | 6.0 | 4.1, with worklets 0.5 | 2.28 | 16.1 |
| 55 | 0.83.10 | 19.2.0 | 55.0 | 4.2 | 2.30 | 26 |
| 56 | 0.85.3 | 19.2.3 | 56.2 | 4.3 | 2.31 | 26.4 |
| 57 | 0.86.3 | 19.2.3 | 57.0 | 4.5 | 2.32 | |
| 58 beta | 0.88.0-rc.3 | 19.3.0 | 58.0 | 4.7, with worklets 0.13 | 3.2 | 26.6 |

#### Hop 1: SDK 53 to 54 ([changelog](https://expo.dev/changelog/sdk-54))

- [ ] Reanimated 3 to 4, adding `react-native-worklets`. Remove `react-native-reanimated/plugin` from `babel.config.js`; the Expo preset now handles it.
- [ ] NativeWind 4.1.23 to 4.2.7 and `react-native-css-interop` to 0.2.7, the releases that accept Reanimated 4. Tailwind stays on 3.
- [ ] `metro.config.js` requires `metro-config/src/defaults/exclusionList`. Metro 0.83 no longer allows imports from `metro/src`; remove it.
- [ ] `metro.config.js` sets `experimentalImportSupport: false`. It is now on by default and the override is slated for removal; delete the line. This is what unlocks tree shaking on web.
- [ ] `app.config.ts` pins `compileSdkVersion` 35, `targetSdkVersion` 35 and `buildToolsVersion` 34.0.0. React Native 0.81 targets Android 16 (API 36); remove the pins.
- [ ] `enableProguardInReleaseBuilds` is deprecated in favour of `enableMinifyInReleaseBuilds`.
- [ ] Edge-to-edge becomes mandatory on Android. `GoogleMapView.native.tsx` positions a control from `StatusBar.currentHeight`; check it and every screen's top and bottom edges.
- [ ] `components/Page.tsx` imports `SafeAreaView` from `react-native`, now deprecated. Use `react-native-safe-area-context`.
- [ ] `expo-router` 5 to 6, React Native Web 0.20 to 0.21, `@expo/vector-icons` 14 to 15 (re-run typecheck).
- [ ] Autolinking now follows declared dependencies. Run `npx expo-modules-autolinking verify -v` after the step 2 dependency merge.

- The `expo-image` 3.0.11 mismatch resolves itself: SDK 54 expects that version.
- React Native's precompiled iOS frameworks will not apply: they are "not compatible with `use_frameworks!`", which Firebase requires here. iOS keeps building from source.

#### Hop 2: SDK 54 to 55 ([changelog](https://expo.dev/changelog/sdk-55))

- [ ] Remove both `newArchEnabled` entries from `app.config.ts`; the option no longer exists. The app is already on the New Architecture.
- [ ] Expo packages switch to SDK-numbered versions (`expo-location` becomes `^55`). `expo install --fix` handles it.
- [ ] `react-native-maps` moves for the first time, 1.20.1 to 1.27.2. Retest every map screen on device.
- [ ] Minimum Xcode becomes 26. This machine has no Xcode, so iOS builds go through EAS.

#### Hop 3: SDK 55 to 56 ([changelog](https://expo.dev/changelog/sdk-56))

- [ ] iOS minimum rises to 16.4. Change `deploymentTarget` from `15.1`. This drops iPhone 6s, 7 and first-generation SE, which the owner accepts.
- [ ] `expo-router` stops depending on React Navigation. Run `npx expo-codemod sdk-56-expo-router-react-navigation-replace src` ([guide](https://docs.expo.dev/router/migrate/sdk-55-to-56)). App code has no `@react-navigation` imports, so it should change nothing.
- [ ] `expo` no longer brings `@expo/vector-icons`, which is now deprecated. Two native map files use it; keep it as a direct dependency or move to `@react-native-vector-icons`.
- [ ] `expo/fetch` becomes the global `fetch`. Retest the native Google Places calls and Firebase callables.
- [ ] Precompiled Expo modules are on by default. If the iOS build fails with static frameworks, set `EXPO_USE_PRECOMPILED_MODULES=0`.

- Hermes V1 becomes the default engine. SDK 56 has a known memory regression with Reanimated and worklets, fixed in SDK 57. Do not release from SDK 56.
- Metro switches to an on-demand file system and a Node watcher; Watchman is no longer recommended. Expo claims a 6x faster crawl. Re-measure the warm start here.

#### Hop 4: SDK 56 to 57 ([changelog](https://expo.dev/changelog/sdk-57))

- [ ] Land on `expo` 57.0.17 or later; that release fixes the Hermes V1 memory and development start-up regressions.

- No breaking changes are listed. It is the last stable SDK before the beta.

#### Hop 5: SDK 57 to 58 beta ([changelog](https://expo.dev/changelog/sdk-58-beta))

- [ ] Gesture Handler 2.32 to 3.2, a major version. The app uses only `GestureHandlerRootView` directly; `react-native-actions-sheet` depends on it more deeply and must be retested.
- [ ] React Native removes the `Touchable` root export and some `StatusBar` props. `GoogleMapView.native.tsx` uses `TouchableOpacity`; switch to `Pressable`.
- [ ] `expo-router` changes its navigation core ([guide](https://docs.expo.dev/router/migrate/sdk-57-to-58)). `app/_layout.tsx` reads navigation state through `useNavigation`, `addListener('state')` and `getState()` for a debug log; remove it or use `usePathname`.
- [ ] The same layout passes the module-level `router.navigate` to the notification service. SDK 58 prefers the router from `useRouter()`.
- [ ] Per-route code splitting turns on for web by default.
- [ ] iOS moves to the scene-based life cycle; prebuild regenerates the project. Confirm Firebase still initialises.
- [ ] Android enables R8 minification in release builds by default. The owner accepts the default, so remove the Proguard opt-out from the app config.

- Node 24.3 or later is required; this machine runs 24.18.
- SDK 58 stable ships after React Native 0.88 does.

### Assessment: third-party dependencies

Two libraries need work before or during the hops regardless of Expo: notifee is archived, and React Native Firebase is three major versions behind. Versions are from the npm registry on 2 Oct 2026.

| Library | In the app | Finding | Action |
| --- | --- | --- | --- |
| [`@notifee/react-native`](https://github.com/invertase/notifee) | 9.1.8 | Repository archived on 7 Apr 2026: "no longer actively maintained". Last npm release Dec 2024. | Replace with expo-notifications (decided 2 Oct 2026; checklist under Phase A). The app makes four calls (`requestPermission`, `getNotificationSettings`, `displayNotification`, `createChannel`). The maintainers point to `expo-notifications` or `react-native-notify-kit`, described as a drop-in. |
| `@react-native-firebase/*` | 23.8 | Latest is 26.4.0. The app uses the namespaced API throughout: about 30 calls such as `database().ref`, `auth().signOut`, `functions().httpsCallable`. The [v22 migration guide](https://rnfirebase.io/migrating-to-v22) says that API is being removed. | Migrate the `.native` services to the modular API first, on the current version. Setting `globalThis.RNFB_MODULAR_DEPRECATION_STRICT_MODE = true` makes every remaining call throw. Then raise the version. |
| `react-native-reanimated` | 3.17 | SDK 54 expects 4.1. App code does not import it. | Upgrade at hop 1. |
| `nativewind`, `react-native-css-interop` | 4.1.23, 0.1.22 | 4.2.7 and 0.2.7 (Sep 2026) accept Reanimated 3.6 and later, on Tailwind 3. | Upgrade at hop 1. Whether 4.2.7 works on SDK 58 is unconfirmed. |
| `react-native-actions-sheet` | 10.1.1 | 10.1.2; accepts any Reanimated and Gesture Handler version by declaration. | Retest the sheet on Reanimated 4 (hop 1) and Gesture Handler 3 (hop 5). |
| `react-native-maps` | 1.20.1 | SDK 55 expects 1.27.2; SDK 58 expects 1.29.0. | Retest at hop 2. |
| `react-native-device-info` | 14.1 | Latest 15.0.2, a major version. | Upgrade and check the calls used. |
| `react-native-phone-call`, `react-native-autocomplete-input`, `@nandorojo/iconic` | 1.2.0, 5.5.6, 0.0.1 | Small libraries with no recent releases. | Retest on each hop; replace if one breaks. |
| `jest-expo` | 52 | Must match the SDK. `react-test-renderer` 18 does not match React 19. | Align at each hop. |

Not checked: the minimum React Native version each React Native Firebase major requires, and whether `expo-notifications` and React Native Firebase messaging build together without extra configuration. Both need a build to confirm.

### Upgrade plan

Run all five hops back to back and land on the SDK 58 beta, as the owner chose. Do not release from an intermediate SDK. The Rust transformer follows as phase C.

#### Phase A: before any hop, on SDK 53

Do these after step 3 signs off, so they are not tangled with SDK changes.

1. [x] Replace notifee with expo-notifications, using the checklist below.
2. [x] Move the React Native Firebase calls in the `.native` services to the modular API. Done in `authService`, `firebase`, `googleRouteService`, `notificationService`, `storageService` and `userService` (`.native.ts`); a grep finds no namespaced call left. Strict mode was not switched on, because it only shows on a device.

##### Replacing notifee with expo-notifications

React Native Firebase messaging stays. It supplies the FCM tokens the backend stores for both platforms and receives the pushes; `expo-notifications` takes over only what notifee did: permission, the Android channel, and showing a banner in the foreground.

| Notifee call | `expo-notifications` equivalent |
| --- | --- |
| `requestPermission` | `requestPermissionsAsync` |
| `getNotificationSettings` | `getPermissionsAsync` |
| `createChannel` (the `default` channel, high importance) | `setNotificationChannelAsync` |
| `displayNotification` on a foreground push | `scheduleNotificationAsync`, trigger `{ channelId: 'default' }` on Android (presents immediately on that channel) and `null` on iOS |

- [x] Install with `npx expo install expo-notifications` (SDK 53 expects ~0.31.5) and add its config plugin to `app.config.ts`. The plugin takes no options, so it writes no notification meta-data into the app manifest.
- [x] Rewrite the four calls in `services/notificationService.native.ts`.
- [x] Call `setNotificationHandler` so banners show while the app is open. From SDK 58 foreground display is the default.
- [x] `LocationSharingContext.native.tsx` imports notifee only for `AndroidColor.RED`, the colour of the location-sharing foreground notification. Replace it with a hex colour string (`#FF0000`; notifee's value was `red`).
- [x] Remove `@notifee/react-native` and the notifee `extraMavenRepos` line in `app.config.ts`.
- [ ] Owner: build Android. Checked without a build: a prebuild's app manifest declares neither meta-data key, and `expo-notifications` registers its Firebase messaging service at priority -1, so React Native Firebase's service still receives pushes. The two libraries are known to clash in the manifest over `com.google.firebase.messaging.default_notification_color` ([issue 8165](https://github.com/invertase/react-native-firebase/issues/8165), closed without a fix). If the merge fails, add `tools:replace="android:resource"` through a small config plugin.
- [ ] Owner: test on a device: the Android 13 permission prompt, a push with the app open, a push with the app closed, and a tap that opens the app.

Taps on a foreground banner only open the app today; no handler routes them to a screen. This plan keeps that behaviour.

#### Phase B: SDK 53 to 58 beta

Each hop follows the same routine, on the migration branch:

1. `npx expo install expo@^5X.0.0 --fix`; for the last hop, `expo@next`.
2. Work through that hop's checklist above.
3. `npx expo-doctor@latest`
4. Check that Metro builds the web, Android and iOS bundles, and that the web app runs.
5. Commit and tag `sdk-5X`.

Native device builds are outside this effort, so each hop is checked through Metro bundles and the web app only. Do not release from SDK 55 or 56: 56 carries Hermes V1 regressions fixed in 57. At SDK 58, re-take the measurements in the table below.

#### Phase C: the Rust transformer

1. Replace NativeWind 4 with Uniwind, the owner's choice.
2. Reduce `babel.config.js` to the Expo preset alone, or delete it.
3. Set `experiments.noxcturnalTransformWorker` in the app config.
4. Measure cold bundling and count the files that still fall back to Babel.

The styling replacement is the bulk of phase C. It touches 41 files that use `className` and 14 `cssInterop` calls in 10 files; the Tailwind config has a single customisation.

| Option | Status | Requires |
| --- | --- | --- |
| NativeWind 5 | Release candidate (5.0.0-rc.0); its docs say not for production | Tailwind 4, Expo 57, Reanimated 4.5.1 or later |
| Uniwind | 1.12.1, stable line since Nov 2025 | Tailwind 4, React Native 0.81 or later |

Decision: Uniwind. It is on a stable release line, needs no Babel configuration, and supports Metro on web and native. NativeWind 5 is still a release candidate whose own docs advise against production use. Uniwind's requirements are met from SDK 54, so the switch can happen at any hop. Expo's SDK 58 source falls back to Babel only for a custom Babel transformer, a non-default Babel config, or files containing worklets. Uniwind's Metro wrapper hands JavaScript files to Expo's own worker, so it should not block the transformer. That conclusion comes from reading the code, not from a build.

#### What to expect

- **Web bundle:** about 1.15 MB down to about 650 kB at hop 1, from tree shaking. Measured on SDK 53 with the flags forced on.
- **Warm start:** the 4 s file crawl is the target of SDK 56's Metro changes. Unmeasured here.
- **Cold bundle:** the Rust transformer can save at most the 2 to 3 s Babel costs today, and only after phase C.

#### Still unverified

- Nothing in this assessment was built. Every hop needs a real Android and iOS build to confirm.
- NativeWind 4.2.7 on SDK 58 with Gesture Handler 3.
- Whether Firebase's static frameworks break the precompiled iOS modules from SDK 56.

### The Rust transformer: what is known

| Fact | Source |
| --- | --- |
| SDK 58 is in beta (since 15 Sep 2026) on React Native 0.88 RC. Stable ships after React Native 0.88 does. | [SDK 58 beta changelog](https://expo.dev/changelog/sdk-58-beta) |
| The transformer ("Noxcturnal", built on oxc) is enabled with `experiments.noxcturnalTransformWorker` in the app config. | Same |
| It "only activates when your project has no custom transform worker or Babel plugins and presets", and skips files that need the Reanimated or Worklets transforms. | Same |
| Expo measured about 2x faster cold bundling (5.26 s to 2.46 s on about 5,500 files) and calls it "early work". | Same |
| Expo recommends upgrading one SDK at a time. From SDK 53 that is five hops. | [Upgrade walkthrough](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/) |
| NativeWind 5 drops the Babel preset but is a release candidate; it needs Tailwind 4, Expo 57 and Reanimated 4. | [NativeWind v5 migration guide](https://www.nativewind.dev/v5/guides/migrate-from-v4) |

### What blocks the transformer in this repo today

- `babel.config.js` lists the `nativewind/babel` preset, `jsxImportSource: 'nativewind'` and `react-native-reanimated/plugin`. In Expo's SDK 58 source (`@expo/metro-config` 58.0.7), a non-default Babel config sends every file back to Babel.
- NativeWind 4 cannot run without that preset, so it has to be replaced, not just reconfigured.
- A custom Metro `transformerPath` is not itself the gate. NativeWind and Uniwind both set one, and both pass JavaScript files on to Expo's worker.
- `metro.config.js` sets `experimentalImportSupport: false`, which also turns off the ES module support that tree shaking depends on.

### Baselines to re-measure

| Measure | Baseline on SDK 53 |
| --- | --- |
| Cold Android bundle | 4.0 s for 2,022 modules |
| Warm restart to first bundle | 5 to 7 s, about 4 s of it file crawl |
| Files that fall back to Babel | All of them |
| Web bundle, compressed | 1.15 MB; 650 kB with tree shaking forced on |

Baselines were taken on an 18-core M5 Pro. On that machine Babel costs about 2 to 3 s per cold start, so that is the most the transformer can save there. The warm-start gain would come from SDK 56's faster file crawl, not from the transformer.

## Decisions and risks

Settled with the owner on 2 Oct 2026. Nothing is left open.

| Decision | Outcome |
| --- | --- |
| Where the work happens | New worktree and new branch. Uncommitted work moves over; the original folder and branch stay clean. |
| Hook bypass | Allowed on intermediate commits. The final state must pass every check. |
| Web hosting | Firebase Hosting, static. Only the config changes, because it points at the deleted `apps/web`. |
| Web font | No port. Text already renders in the system font. |
| Storybook | Parked until after step 3. |
| Shared lint and TypeScript config | Inlined into each runtime; `packages/` is deleted. |
| Turborepo | Kept. |
| `router.push` to `router.navigate` | Kept unless the back button misbehaves. |
| iOS minimum 16.4 at SDK 56 | Accepted. |
| Native device builds | Out of scope for this effort. |
| Web push | Follow-up after the migration. |
| SDK target | 58 beta. |
| Android release minification | The SDK 58 default (on) is accepted. |
| NativeWind replacement | Uniwind. |

### Risks

- **Web load size.** The Expo web bundle is 1.15 MB compressed against about 480 to 500 kB under Next. Removing the `react-icons` import helps; tree shaking, on by default from SDK 54, brought it to 650 kB in a test.
- **No prerendered HTML.** With `single` output the page is blank until the bundle loads. Expo's `static` output can prerender but is not part of this plan.
- **Screens behind login.** Automated checks cannot pass the phone OTP, so those screens depend on the manual walkthrough in step 3.
- **iOS.** Native device builds are out of scope here, so native regressions will only show when the owner builds.
- **Dependency merge.** Taking the wrong version range in step 2c would mismatch native modules and may only show at build or run time.
- **Deploys.** Hosting, Functions and EAS releases are outside git's reach; the plan forbids them until sign-off.
- **Pre-existing issues, not caused by this work.** `expo-image` 3.0.11 does not match SDK 53. No service worker file for web push exists in the repo, so web push likely does not work today either.
