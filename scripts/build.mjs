/**
 * build.mjs — the entire build pipeline for agency-starter.
 *
 *   1. Type-check everything          (node_modules/typescript/bin/tsc --noEmit)
 *   2. Transpile site.config.ts + src/render.ts in-memory, render dist/index.html
 *   3. Transpile src/main.ts -> dist/main.js  (browser script, verbatim)
 *   4. Copy assets/ -> dist/assets/
 *
 * Usage:
 *   node scripts/build.mjs           # one-shot build
 *   node scripts/build.mjs --watch   # rebuild on changes (dev)
 *
 * No bundler. The TypeScript compiler API (already a devDependency) does the
 * TS->JS transpile, so config typos fail the build with a real error message.
 */
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const BUILD_TMP = path.join(ROOT, ".build"); // intermediate JS — never deployed, gitignored

/** Strip types from a .ts file and return runnable ESM JavaScript. */
function transpile(tsFile) {
  const source = fs.readFileSync(tsFile, "utf8");
  const { outputText, diagnostics } = ts.transpileModule(source, {
    fileName: path.basename(tsFile),
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2020,
    },
    reportDiagnostics: true,
  });
  const errors = (diagnostics ?? []).filter(
    (d) => d.category === ts.DiagnosticCategory.Error
  );
  if (errors.length > 0) {
    for (const d of errors) {
      console.error(`TS error in ${tsFile}: ${ts.flattenDiagnosticMessageText(d.messageText, "\n")}`);
    }
    process.exit(1);
  }
  return outputText;
}

/** Import a TS module by transpiling it to a temp .mjs file first. */
async function importTs(tsFile, outName) {
  fs.mkdirSync(BUILD_TMP, { recursive: true });
  const outFile = path.join(BUILD_TMP, outName);
  fs.writeFileSync(outFile, transpile(tsFile));
  // Cache-busting query so --watch rebuilds re-import fresh code.
  const url = pathToFileURL(outFile).href + `?t=${Date.now()}`;
  return import(url);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name.startsWith(".gitkeep")) continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function typeCheck() {
  console.log("→ type-checking (tsc --noEmit)…");
  execFileSync(
    process.execPath,
    [path.join(ROOT, "node_modules", "typescript", "bin", "tsc"), "--noEmit"],
    { cwd: ROOT, stdio: "inherit" }
  );
}

async function build() {
  console.log("→ building agency-starter…");

  // 1. Config + renderer
  const { default: config } = await importTs(
    path.join(ROOT, "site.config.ts"),
    "site.config.mjs"
  );
  const { renderSite } = await importTs(
    path.join(ROOT, "src", "render.ts"),
    "render.mjs"
  );

  fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, "index.html"), renderSite(config));

  // 2. Browser script
  fs.writeFileSync(path.join(DIST, "main.js"), transpile(path.join(ROOT, "src", "main.ts")));

  // 3. Static assets
  copyDir(path.join(ROOT, "assets"), path.join(DIST, "assets"));

  // 4. GitHub Pages: disable Jekyll so dot-folders/paths serve correctly
  fs.writeFileSync(path.join(DIST, ".nojekyll"), "");

  console.log(`✓ dist/ built for "${config.businessName}"`);
}

async function buildAll() {
  typeCheck();
  await build();
}

const watch = process.argv.includes("--watch");
await buildAll();

if (watch) {
  console.log("Watching for changes… (Ctrl+C to stop)");
  let timer = null;
  const onChange = () => {
    clearTimeout(timer);
    timer = setTimeout(() => buildAll().catch((e) => console.error(e)), 150);
  };
  for (const dir of ["src", "assets"]) {
    fs.watch(path.join(ROOT, dir), { recursive: true }, onChange);
  }
  fs.watchFile(path.join(ROOT, "site.config.ts"), onChange);
}
