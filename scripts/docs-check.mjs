import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";

const root = process.cwd();
const markdownFiles = [];
const ignoredDirs = new Set([
  ".agents",
  ".claude",
  ".git",
  ".next",
  "node_modules",
]);

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (ignoredDirs.has(entry)) continue;
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else if (extname(path).toLowerCase() === ".md") markdownFiles.push(path);
  }
}

walk(root);

const linkPattern = /(?<!!)\[[^\]]+\]\(([^)]+)\)/g;
const failures = [];

for (const file of markdownFiles) {
  const text = readFileSync(file, "utf8");
  const baseDir = dirname(file);
  for (const match of text.matchAll(linkPattern)) {
    const rawTarget = match[1].trim();
    if (!rawTarget) continue;
    if (/^(https?:|mailto:|tel:|#)/i.test(rawTarget)) continue;

    const withoutTitle = rawTarget.split(/\s+["'][^"']+["']$/)[0];
    const target = withoutTitle.split("#")[0];
    if (!target) continue;

    const resolved = normalize(resolve(baseDir, decodeURI(target)));
    if (!resolved.startsWith(root)) {
      failures.push(`${relative(file)} links outside repo: ${rawTarget}`);
      continue;
    }
    if (!existsSync(resolved)) {
      failures.push(`${relative(file)} has missing link: ${rawTarget}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Markdown link check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`PASS Markdown link check (${markdownFiles.length} files)`);

function relative(path) {
  return path.slice(root.length + 1).replaceAll("\\", "/");
}
