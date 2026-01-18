# EasyBoard Monorepo

Cross-platform monorepo for EasyBoard, based on Solito, Expo and Next.js

## Repository Structure

```text
├── apps/
│   ├── web/             # Next.js web application
│   ├── native/          # Expo/React Native app
│   └── functions/       # Firebase Cloud Functions
├── packages/
│   ├── common/          # Core business logic, shared UI, and services
│   │   ├── src/
│   │   │   ├── components/ # Core UI components (NativeWind)
│   │   │   ├── contexts/   # React Contexts for global state
│   │   │   ├── helpers/    # Utility functions
│   │   │   ├── hooks/      # Shared React Hooks
│   │   │   ├── pages/      # Shared pages (platform agnostic)
│   │   │   ├── provider/   # App level providers (Theme, Auth, etc.)
│   │   │   ├── services/   # Firebase and Google API abstractions
│   │   │   ├── stores/     # State management stores
│   │   │   └── types/      # Shared TypeScript interfaces
│   ├── eslint-config/   # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
└── package.json         # Root package.json with workspaces
```

## Getting Started

### Prerequisites

- Node.js >= 20
- Yarn 4.11.0

```bash
# this should be sufficient to enable yarn in most Node.js installations
corepack enable
```

### Installation

Clone the repository and install dependencies:
    ```bash
    yarn install
    ```

### Add Environment Variables
Refer to the `.env.example` files and create corresponding `.env` files with the required values.

### Local Development Setup (Native)

If you are developing for Android or iOS locally, ensure you have the following prerequisites installed (refer to the most updated instructions [here](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build&buildEnv=local)):

#### macOS Setup

Install Watchman and JDK
```bash
brew install watchman
brew install openjdk@17
```

For `openjdk@17`, you may need to add it to your `PATH` and `JAVA_HOME`. Add the following to your shell config file (e.g., `~/.zshrc` or `~/.bash_profile`):
```bash
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
```

Install Xcode Command Line Tools
```bash
xcode-select --install
```

#### Windows Setup

If you are on Windows, follow these steps to set up the Android development environment:

- **Install OpenJDK 17**: You can use [Chocolatey](https://chocolatey.org/): `choco install openjdk17`.
- **Install Android Studio**: Download and install from [official site](https://developer.android.com/studio).
- **Configure SDK**: Ensure "Android SDK Platform" and "Android Virtual Device" are installed.
- **Environment Variables**: Set `JAVA_HOME` to your JDK path and `ANDROID_HOME` to your Android SDK location. Add the `platform-tools` and `emulator` directories to your `PATH`.

#### Development Builds
Run the following to create a development build. Typically you would only need to run these commands once unless you are making changes to the native configs (note that MacOS is required for iOS build/development):
```bash
# in the monorepo root
yarn native:prebuild

yarn native:android # For Android
# and/or
yarn native:ios     # For iOS (macOS only)
```

If you are running the above commands for the first time, the dev server will automatically start after the build is completed. For subsequent runs, you can simply run `yarn dev`

For more detailed instructions (Android Studio, iOS Simulator, etc.), refer to the official [Expo Environment Setup Guide](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build&buildEnv=local).

### Development

To run all services (Functions, Native dev server, and Web dev server):
```bash
yarn dev
```

#### Running specific applications (from the monorepo root)

- **Web only**: `yarn web:dev`
- **Native iOS**: `yarn native:ios`
- **Native Android**: `yarn native:android`
- **Native Dev Server**: `yarn native:dev`

### Building

- **Build all**: `yarn build`
- **Build specific**: `yarn turbo build --filter=<app-name>`

### Linting and Formatting

- **Lint**: `yarn lint`
- **Format**: `yarn format`

## Troubleshooting
Many errors (especially Typescript/import errors) an be resolved by deleting `node_modules` and running `yarn install`. There is a convenience script to delete the various `node_modules` folder:

```bash
yarn clean
```
For React Native/Expo specific errors, it might be worth doing the above and then generating a new build
```bash
yarn native:prebuild

yarn native:android # For Android
# and/or
yarn native:ios     # For iOS (macOS only)
```

## Repo conventions
- Gneneral workflow:
    1. Create primitive UI in `packages/common/src/components`.
    2. Compose pages in `packages/common/src/pages`.
    3. Register routes in `apps/native/app` and `apps/web/app` (Next.js App Router).
- Business logic should reside in `packages/common/src/services`.
- Use **NativeWind** for styling across both platforms.

## Key Features

- **Shared UI/UX**: Over 90% code sharing between Web and Native using Solito.
- **NativeWind**: Tailwind CSS for universal styling.
- **Firebase Integration**: Unified services for Auth, Database, and Functions.
- **Type Safety**: Full-stack TypeScript support.
