/**
 * site.config.ts — THE ONLY FILE YOU EDIT PER CLIENT.
 * Every business-specific value lives here. Pages, styles, and the
 * quote form all read from this single source of truth.
 */

export interface Service {
  name: string;
  description: string;
  /** Display price string, e.g. "From $199" or "POA". */
  price: string;
}

export interface GalleryItem {
  /** Paths relative to assets/images/ */
  before: string;
  after: string;
  caption: string;
}

export interface SiteConfig {
  businessName: string;
  tagline: string;
  phone: string;
  email: string;
  serviceArea: string;

  colors: {
    light: { primary: string; accent: string; bg: string; text: string };
    dark: { primary: string; accent: string; bg: string; text: string };
  };

  services: Service[];
  gallery: GalleryItem[];

  quoteForm: {
    /** POST target. Replace with your Cloudflare Worker URL later. */
    webhookUrl: string;
  };

  /** ISO code used for pricing display, e.g. "AUD", "USD", "GBP". */
  currency: string;
}

const config: SiteConfig = {
  businessName: "Example Pressure Cleaning",
  tagline: "Driveways, decks & exteriors — spotless, guaranteed.",
  phone: "+61 400 000 000",
  email: "quotes@example.com",
  serviceArea: "Sydney Metro",

  colors: {
    light: { primary: "#0f766e", accent: "#f59e0b", bg: "#ffffff", text: "#1f2937" },
    dark: { primary: "#2dd4bf", accent: "#fbbf24", bg: "#111827", text: "#f9fafb" },
  },

  services: [
    {
      name: "Driveway Cleaning",
      description: "High-pressure wash removing oil stains, mould and grime.",
      price: "From $199",
    },
    {
      name: "House Exterior Wash",
      description: "Soft-wash treatment safe for render, brick and cladding.",
      price: "From $349",
    },
    {
      name: "Deck & Patio Restoration",
      description: "Deep clean and prep ready for sealing or staining.",
      price: "From $249",
    },
  ],

  gallery: [
    {
      before: "before-1.jpg",
      after: "after-1.jpg",
      caption: "Concrete driveway — 2 hour turnaround",
    },
  ],

  quoteForm: {
    webhookUrl: "https://example.com/REPLACE-WITH-YOUR-WORKER",
  },

  currency: "AUD",
};
export default config;