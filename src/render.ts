/**
 * render.ts — the ONE page template. Runs at build time (in Node), not in
 * the browser. All client content is injected from site.config.ts, so no
 * HTML is ever duplicated per client.
 *
 * To add a section for all future clients, add it here and extend
 * SiteConfig in site.config.ts — the type-checker will then force every
 * client config to supply the new field.
 */
import type { SiteConfig } from "../site.config";

/** Escape client-supplied text before injecting into HTML. */
function esc(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function serviceCard(s: SiteConfig["services"][number]): string {
  return `
      <article class="card">
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.description)}</p>
        <p class="price">${esc(s.price)}</p>
      </article>`;
}

function galleryItem(g: SiteConfig["gallery"][number]): string {
  return `
      <figure class="ba-pair">
        <div class="ba-images">
          <img src="assets/images/${esc(g.before)}" alt="Before — ${esc(g.caption)}" loading="lazy">
          <img src="assets/images/${esc(g.after)}" alt="After — ${esc(g.caption)}" loading="lazy">
        </div>
        <figcaption>${esc(g.caption)}</figcaption>
      </figure>`;
}

function serviceOption(s: SiteConfig["services"][number]): string {
  return `<option value="${esc(s.name)}">${esc(s.name)}</option>`;
}

export function renderSite(c: SiteConfig): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(c.businessName)} — ${esc(c.tagline)}</title>
  <meta name="description" content="${esc(c.tagline)} Serving ${esc(c.serviceArea)}. Call ${esc(c.phone)} for a free quote.">
  <link rel="stylesheet" href="assets/css/style.css">
  <style>
    /* Color tokens injected from site.config.ts — dark-ready via media query */
    :root {
      --color-primary: ${c.colors.light.primary};
      --color-accent: ${c.colors.light.accent};
      --color-bg: ${c.colors.light.bg};
      --color-text: ${c.colors.light.text};
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --color-primary: ${c.colors.dark.primary};
        --color-accent: ${c.colors.dark.accent};
        --color-bg: ${c.colors.dark.bg};
        --color-text: ${c.colors.dark.text};
      }
    }
  </style>
</head>
<body>

  <a class="demo-banner" href="https://paulsunnydev.com" target="_blank" rel="noopener">
    Demo site — built from my agency-starter template. Want one like this? paulsunnydev.com
  </a>

  <header class="site-header">
    <a class="brand" href="#top">${esc(c.businessName)}</a>
    <a class="call-cta" href="tel:${esc(c.phone.replaceAll(" ", ""))}">Call ${esc(c.phone)}</a>
  </header>

  <main id="top">

    <section class="hero">
      <h1>${esc(c.tagline)}</h1>
      <p>Serving ${esc(c.serviceArea)}</p>
      <a class="btn" href="#quote">Get a free quote</a>
    </section>

    <section class="services" id="services">
      <h2>Our services</h2>
      <div class="card-grid">${c.services.map(serviceCard).join("")}
      </div>
    </section>

    <section class="gallery" id="gallery">
      <h2>Before &amp; after</h2>
      ${c.gallery.map(galleryItem).join("")}
    </section>

    <section class="quote" id="quote">
      <h2>Get a free quote</h2>
      <form id="quote-form" data-webhook="${esc(c.quoteForm.webhookUrl)}">
        <label>Name
          <input type="text" name="name" required autocomplete="name">
        </label>
        <label>Phone
          <input type="tel" name="phone" required autocomplete="tel">
        </label>
        <label>Service
          <select name="service" required>
            <option value="" disabled selected>Choose a service…</option>
            ${c.services.map(serviceOption).join("\n            ")}
          </select>
        </label>
        <label>Message
          <textarea name="message" rows="4" placeholder="Tell us about the job…"></textarea>
        </label>
        <button type="submit" class="btn">Request quote</button>
        <p id="form-status" role="status" aria-live="polite"></p>
      </form>
    </section>

  </main>

  <footer class="site-footer">
    <p>${esc(c.businessName)} · ${esc(c.serviceArea)}</p>
    <p><a href="tel:${esc(c.phone.replaceAll(" ", ""))}">${esc(c.phone)}</a> ·
       <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>
  </footer>

  <script src="main.js" type="module"></script>
</body>
</html>
`;
}
