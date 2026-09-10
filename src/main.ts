/**
 * main.ts — browser script for the quote form.
 * POSTs a clean JSON payload to the webhook URL baked in at build time
 * (data-webhook attribute on the form). Swap in your Cloudflare Worker
 * URL in site.config.ts when it's ready — no code change needed.
 *
 * Payload shape:
 *   { name, phone, service, message, timestamp }  (timestamp = ISO 8601)
 */

interface QuotePayload {
  name: string;
  phone: string;
  service: string;
  message: string;
  timestamp: string;
}

const form = document.getElementById("quote-form") as HTMLFormElement | null;
const statusEl = document.getElementById("form-status");

if (form && statusEl) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);

    const payload: QuotePayload = {
      name: String(data.get("name") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      service: String(data.get("service") ?? ""),
      message: String(data.get("message") ?? "").trim(),
      timestamp: new Date().toISOString(),
    };

    const webhook = form.dataset.webhook ?? "";
    const button = form.querySelector("button[type=submit]") as HTMLButtonElement;

    button.disabled = true;
    statusEl.textContent = "Sending…";

    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      statusEl.textContent = "Thanks! We'll be in touch shortly.";
      form.reset();
    } catch {
      statusEl.textContent = "Something went wrong — please call us instead.";
    } finally {
      button.disabled = false;
    }
  });
}
