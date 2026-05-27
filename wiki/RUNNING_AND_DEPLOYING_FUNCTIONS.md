# Deploying Functions

## Dev setup

By default, functions are set up for local development with the emulator via `yarn dev`. This compiles TypeScript to `lib/` and starts the Firebase emulator for functions only.

From the repo root:

```bash
yarn dev
```

This runs `turbo dev`, which starts all workspace `dev` scripts including the functions emulator.

To run the functions emulator in isolation:

```bash
yarn workspace functions dev
# or
cd apps/functions && yarn dev
```

The emulator runs on `http://localhost:5001` by default.

### Prerequisites for local dev

1. Install the Firebase CLI globally:

   ```bash
   npm install -g firebase-tools
   ```

2. Log in to Firebase:

   ```bash
   firebase login
   ```

3. Copy `.env` from the example:

   ```bash
   cp apps/functions/.env.example apps/functions/.env
   ```

4. Fill in the required environment variable:

   ```
   GOOGLE_MAPS_API_KEY=<your-key>
   ```

## Environment variables

| Variable             | Description                          | Applies to             |
| -------------------- | ------------------------------------ | ---------------------- |
| `GOOGLE_MAPS_API_KEY` | API key for Google Routes API       | `getGoogleRoute`       |

### Local development

Environment variables are loaded from `apps/functions/.env` via `dotenv`. The `.env` file is git-ignored — use `apps/functions/.env.example` as a template.


## Functions overview

| Function           | Type       | Purpose                                      |
| ------------------ | ---------- | -------------------------------------------- |
| `sendNotification` | onRequest  | Sends push notifications via FCM (HTTPS POST) |
| `getGoogleRoute`   | onCall     | Fetches transit routes from Google Routes API |

Both functions enforce CORS for:
- `https://easyboard-sg.web.app` (old firebase deployment)
- `http://localhost:3001` (local web dev)
- `https://easyboard3.vercel.app` (current vercel deployments)

`getGoogleRoute` also requires Firebase Authentication (rejects unauthenticated calls).

## Project configuration

- **Firebase project**: `easyboard-sg`
- **Runtime**: Node.js 24
- **Region**: `asia-east1` (set in `firebase.json` hosting)
- **Source directory**: `./apps/functions`

## Deployment steps

### Prerequisites

1. Ensure you have access to the `easyboard-sg` Firebase project (check `firebase projects:list`)
2. The Firebase CLI must be logged into the correct account
3. Ensure all environment variables are configured in the Firebase environment (see above)

### Deploy

From the repo root:

```bash
firebase deploy --only functions
# or
yarn workspace functions deploy
```

### What happens during deployment

1. **`yarn workspace functions build`** — Compiles TypeScript (`src/index.ts` → `src/index.js`)
2. **`yarn turbo prune functions`** — Creates a pruned monorepo in `out/` containing only the functions workspace and its dependencies
3. **`yarn workspace functions predeploy`** — Runs `function-predeploy.js`, which:
   - Updates `out/package.json` with the correct `main` entry point
   - Copies `apps/functions/.env` to `out/.env`
4. Firebase deploys the functions source directory
5. **Postdeploy cleanup** — `function-postdeploy.js` runs to clean up build artifacts:
   - Removes `src/index.js` and `src/index.js.map`
   - Removes the `out/` directory
   - Can be skipped by setting `FUNCTIONS_SKIP_CLEANUP=1`

### Deploying specific functions

```bash
firebase deploy --only functions:sendNotification
firebase deploy --only functions:getGoogleRoute
```

## Verifying deployment

```bash
# Check deployed functions
firebase functions:list

# View recent logs
yarn workspace functions logs
# or
firebase functions:log
```

## CORS

The CORS origins are hardcoded in `apps/functions/src/index.ts`. If you deploy the web app to a new domain, add it to both functions' `cors` arrays before deploying.

## Troubleshooting

- **CORS errors**: Verify the request origin matches one of the allowed CORS origins. For local testing, use `http://localhost:3001`.
- **`getGoogleRoute` returns 401**: Ensure the caller includes a valid Firebase Auth token. The function rejects requests without authentication.
- **`sendNotification` requires POST**: The function only accepts `POST` requests. Using GET will return `405 Method Not Allowed`.
- **Deployment fails**: Check that `firebase-tools` is up to date (`npm install -g firebase-tools@latest`). Ensure your Firebase account has the `Firebase Admin` or `Editor` role on the project.
- **`GOOGLE_MAPS_API_KEY` not found in production**: Verify the secret or config is set in Firebase using `firebase functions:config:get` or `firebase functions:secrets:list`.
