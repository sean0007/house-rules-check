export const SITE_NAME = "House Rules Check";

export const SITE_TAGLINE =
  "Paste your Airbnb house rules (English or Japanese) and see which ones are likely not allowed under Airbnb's new house rules policy for reservations booked from 2026-11-20 (dishes, stripping beds, trash off-site, fines, fees, ID, contracts, off-platform check-in, rules added after booking), with compliant rewrites and Japan minpaku guest-register notes.";

export const DISCLAIMER_SHORT =
  "Educational keyword check, not legal advice. Not affiliated with or endorsed by Airbnb. Findings are likely outcomes, not Airbnb's decision; Airbnb's listing editor and support decide.";

export const HONESTY =
  "Based on Airbnb's public house rules help article and its 2026-10-20 announcement (read 2026-10-28), plus 住宅宿泊事業法 arts. 8–9, 旅館業法 art. 6 and the MLIT minpaku guideline. It matches phrases; it can't see your listing or how Airbnb will judge local context.";

export const SIBLING_TOOLS = [
  { href: "https://hotel-ota-calculator.vercel.app", label: "Hotel OTA Calculator" },
  { href: "https://japan-trip-brain.vercel.app", label: "Japan Trip Brain" },
  { href: "https://kyushu-travel-discount.vercel.app", label: "Kyushu Travel Discount" },
  { href: "https://japan-tax-free-refund.vercel.app", label: "Japan Tax-Free Refund" },
  { href: "https://japan-luggage.vercel.app", label: "Japan Luggage Check" },
  { href: "https://japan-driving-check.vercel.app", label: "Japan Driving Check" },
  { href: "https://japan-mynumber-card-check.vercel.app", label: "Japan My Number Card Check" },
  { href: "https://japan-hsp-points.vercel.app", label: "Japan HSP Points Calculator" },
  { href: "https://japan-customs-allowance.vercel.app", label: "Japan Customs Allowance" },
  { href: "https://japan-alert-decoder.vercel.app", label: "Japan Alert Decoder" },
  { href: "https://japan-visa-fee.vercel.app", label: "Japan Visa Fee Calculator" },
  { href: "https://free-agent-tools.vercel.app", label: "Free Agent Tools MCP" },
] as const;

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production.replace(/^https?:\/\//, "")}`;
  return "https://house-rules-check.vercel.app";
}
