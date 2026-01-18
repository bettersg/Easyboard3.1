/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const pkgPath = path.join(__dirname, "../../out/package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

// 1. Set or update the "main" field
pkg.main = "apps/functions/src/index.js"; // Change this value if your entry point is different

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log('Added/updated "entry" field in package.json');

// 2. Copy .env to out/apps/functions/.env
const srcEnvPath = path.join(__dirname, '.env');
const destEnvDir = path.join(__dirname, '../../out');
const destEnvPath = path.join(destEnvDir, '.env');

if (fs.existsSync(srcEnvPath)) {
  fs.mkdirSync(destEnvDir, { recursive: true });
  fs.copyFileSync(srcEnvPath, destEnvPath);
  console.log(`Copied .env to ${destEnvPath}`);
} else {
  console.warn('.env file not found in apps/functions, skipping copy.');
}
