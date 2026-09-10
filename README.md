# agency-starter

Reusable static site template for trade-service clients (pressure cleaning, etc.).
**One config file in, live website out.**

## Stack

- TypeScript → static HTML/CSS/JS (no frameworks, no bundler)
- Build: `tsc` (type-check) + small Node script (transpile + render)
- Deploy: GitHub Actions → GitHub Pages on every push to `main`

## New client in 5 minutes

```powershell
git clone <this-repo-url> client-business-name
cd client-business-name
npm install
```

1. Edit **`site.config.ts`** — business name, phone, colors, services,
   prices, gallery, webhook URL. That's the only file with client data.
2. Replace images in `assets/images/` (`before-1.jpg`, `after-1.jpg`, …).
3. `npm run build` → open `dist/index.html` to check.
4. Push to a new GitHub repo (`main` branch).
5. In the repo: **Settings → Pages → Source: GitHub Actions** (once).
   Every subsequent `git push` deploys automatically.

## Commands

| Command         | What it does                                      |
| --------------- | ------------------------------------------------- |
| `npm run build` | Type-check + build `dist/`                        |
| `npm run dev`   | Same, but rebuilds on file changes                |

## How it works

- `site.config.ts` defines the `SiteConfig` interface — a missing or
  mistyped client field fails the build, not the live site.
- `src/render.ts` is the single page template (header, hero, services,
  before/after gallery, quote form, footer). Content and color tokens
  (light + dark) are injected from the config at build time.
- `src/main.ts` handles the quote form: POSTs
  `{ name, phone, service, message, timestamp }` as JSON to
  `quoteForm.webhookUrl` from the config. Point it at your backend
  (e.g. a Cloudflare Worker) when ready — no code change needed.
- `scripts/build.mjs` is the entire build pipeline (~100 lines, commented).

See `NOTES.md` for design decisions and environment notes.
