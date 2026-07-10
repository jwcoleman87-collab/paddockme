/**
 * Serve the production build for local e2e runs.
 *
 * Next's `output: "standalone"` server does not serve `.next/static` or
 * `public/` on its own — deploy targets copy them in (see Dockerfile lines
 * 70-72; Vercel handles it internally). Without this copy the e2e server
 * returns SSR HTML with no client JS, so nothing that hydrates ever appears
 * and interaction tests silently click dead buttons.
 */
import { cpSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";

const jobs = [
  { from: ".next/static", to: ".next/standalone/.next/static" },
  { from: "public", to: ".next/standalone/public" },
];

for (const { from, to } of jobs) {
  if (!existsSync(from)) {
    console.error(`Missing ${from} — run \`npm run build\` first.`);
    process.exit(1);
  }
  cpSync(from, to, { recursive: true });
}

const server = spawn("node", [".next/standalone/server.js"], {
  stdio: "inherit",
  env: process.env,
});
server.on("exit", (code) => process.exit(code ?? 0));
