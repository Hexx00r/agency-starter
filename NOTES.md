# NOTES — agency-starter (for the operator)

## Tooling decision (Marcus's recommendation)

**Build = TypeScript for type-checking only (`tsc --noEmit`) + a small Node
script (`scripts/build.mjs`) that strips types, renders HTML from the config,
and copies assets.** One devDependency (`typescript`). No bundler.

Why not esbuild? It would work fine, but our TS uses no imports between
browser modules — a 30-line Node script does the strip/copy with zero extra
deps and is trivially debuggable. Why not vanilla JS + JSDoc? You'd lose
`SiteConfig` interface enforcement — the interface is what stops a client
config typo from silently shipping a broken site. `tsc --noEmit` in CI is the
safety net.

Rule: browser TypeScript must not use cross-file runtime imports (type-only
`import type` from site.config.ts is fine — it erases at compile time). That
keeps the type-strip step safe.

## Directory map

- `site.config.ts` — only file edited per client
- `src/` — page renderer (Node-side), browser scripts, HTML shell
- `assets/` — css + images, copied verbatim to `dist/`
- `scripts/build.mjs` — the whole build pipeline
- `dist/` — generated output, gitignored, deployed by CI

## Per-client onboarding flow

1. `git clone` the starter → rename folder
2. Edit `site.config.ts`, drop images into `assets/images/`
3. `npm install && npm run build` to verify locally (`dist/index.html`)
4. New GitHub repo → push to `main` → GitHub Actions builds + deploys to Pages
5. Flip repo Settings → Pages → source: GitHub Actions (one-time)

## Environment quirk (Paul's Windows machine)

npm is not on Git Bash's PATH. In PowerShell it works as-is; in Git Bash run
`export PATH="/c/Program Files/nodejs:$PATH"` first (Node 24 / npm 11 live there).

## CI notes

- Workflow: `.github/workflows/deploy.yml` — first-party actions only, no secrets.
- `npm ci` requires `package-lock.json` — always commit it (not gitignored).
- `concurrency: pages / cancel-in-progress` means rapid pushes won't queue
  stale deploys; the newest commit wins.
- Live site URL appears in the workflow run output and under
  Settings → Pages after the first deploy.
