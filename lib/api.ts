import { InputError, type Endpoint, type Input } from "./agent-api";
import { CHANNELS, DISCLAIMER, JURISDICTIONS, LODGING, RuleInputError, checkHouseRules, type Channel, type Jurisdiction, type Lodging } from "./rules";
import { SITE_NAME, SITE_TAGLINE } from "./site";

export const PUBLIC_URL = "https://house-rules-check.vercel.app";
export const API_DISCLAIMER = DISCLAIMER;
export const API_INFO = { title: `${SITE_NAME} API`, description: SITE_TAGLINE, version: "1.0.0" };

export const EXAMPLE_GET = "/api/check?text=Please%20wash%20the%20dishes%20before%20checkout.%0ANo%20smoking%2C%20%24250%20fine.%0AQuiet%20hours%2010pm-8am.";

function first(v: unknown): unknown {
  return Array.isArray(v) ? v[0] : v;
}
function s(v: unknown): string | null {
  const f = first(v);
  return f === undefined || f === null || String(f).trim() === "" ? null : String(f).trim();
}
const J_ALIASES: Record<string, Jurisdiction> = { jp: "JP", japan: "JP", 日本: "JP", ja: "JP", other: "other", none: "other", us: "other", global: "other", world: "other" };
const L_ALIASES: Record<string, Lodging> = { minpaku: "minpaku", 民泊: "minpaku", 住宅宿泊事業: "minpaku", str: "minpaku", ryokan: "ryokan", hotel: "ryokan", 旅館業: "ryokan", 簡易宿所: "ryokan", 旅館: "ryokan", unknown: "unknown", "?": "unknown" };
const C_ALIASES: Record<string, Channel> = { listing: "listing", message: "message", messages: "message", chat: "message", sign: "sign", signs: "sign", poster: "sign", in_person: "in_person", verbal: "in_person", "in-person": "in_person" };

function pick<T extends string>(raw: string | null, allowed: readonly T[], aliases: Record<string, T>, name: string, fallback: T): T {
  if (!raw) return fallback;
  const v = aliases[raw.toLowerCase()] ?? aliases[raw] ?? (raw as T);
  if (!(allowed as readonly string[]).includes(v)) throw new InputError(`Invalid ${name} "${raw}". Allowed: ${allowed.join(", ")}`);
  return v;
}

export function computeCheck(input: Input) {
  try {
    const rulesRaw = input.rules;
    const rules = Array.isArray(rulesRaw) && rulesRaw.length > 1 ? rulesRaw.map(String) : null;
    return checkHouseRules({
      text: s(input.text ?? input.houseRules ?? input.rules ?? input.q),
      rules,
      jurisdiction: pick(s(input.jurisdiction ?? input.country), JURISDICTIONS, J_ALIASES, "jurisdiction", "JP"),
      lodging: pick(s(input.lodging ?? input.license ?? input.type), LODGING, L_ALIASES, "lodging", "unknown"),
      channel: pick(s(input.channel ?? input.where), CHANNELS, C_ALIASES, "channel", "listing"),
      bookingDate: s(input.bookingDate ?? input.booked),
      today: s(input.today ?? input.date),
    });
  } catch (e) {
    if (e instanceof RuleInputError) throw new InputError(e.message);
    throw e;
  }
}

export const ENDPOINTS: Record<"check", Endpoint> = {
  check: {
    path: "/api/check",
    operationId: "houseRulesCheck",
    summary: "Which of these Airbnb house rules / requests are likely not allowed under Airbnb's house rules policy for reservations booked on or after 2026-11-20, and how to rewrite them (EN/JA, with Japan 民泊 guest-register notes)?",
    description:
      "Splits pasted house rules (English or Japanese) into items and classifies each with keyword patterns based on Airbnb's help article 4168 and its 2026-10-20 announcement: likely_flagged (cleaner tasks such as washing/putting away dishes, stripping beds, laundry, taking trash off-site; fines or penalties; restricting advertised amenities; separate contracts; ID or personal info; off-platform registration; rules added after booking by message/sign), review, move_to_section (mandatory fees → Pricing, HOA/local fines → Local rules, check-in times), legal_exception (Japan: guest register and passport copy under 住宅宿泊事業法 art. 8 / 旅館業法 art. 6 if disclosed in Requests before booking), use_standard_rule (max guests, quiet hours, events, pets, smoking, commercial photography, lock up), likely_ok (dishes in the sink, gather towels, sort trash into indoor bins, turn off AC, optional add-ons, safety info, local exceptions) or no_match. Returns verdict (fix_needed | review_needed | tidy_up | looks_ok), headline, summary, policy {appliesToBookingsFrom, appliesToThisBooking, daysUntilPolicy}, counts, items [{text, finding, reasons, reasonsJa, rewrite, moveTo, japanNote}], standardRulesToSet, japanChecklist, sources, rulesAsOf and disclaimer. Likely outcomes only; Airbnb decides.",
    params: [
      { name: "text", type: "string", required: true, description: "House rules / requests to check, one per line (English or Japanese). Max 8000 chars, 80 items. POST may send `rules` as an array instead." },
      { name: "rules", type: "array", items: { type: "string" }, postOnly: true, description: "POST only: rules as an array of strings (alternative to text)." },
      { name: "jurisdiction", type: "string", enum: JURISDICTIONS, default: "JP", description: "JP adds Japan legal exceptions (guest register, passport copy) and notes; other = generic." },
      { name: "lodging", type: "string", enum: LODGING, default: "unknown", description: "Japan licence type: minpaku (住宅宿泊事業法) | ryokan (旅館業法: hotel, ryokan, 簡易宿所) | unknown." },
      { name: "channel", type: "string", enum: CHANNELS, default: "listing", description: "Where the rules are communicated: listing (House rules and requests section) | message | sign | in_person. Anything outside the listing can't add new rules." },
      { name: "bookingDate", type: "string", description: "YYYY-MM-DD date the reservation was booked (policy covers bookings on or after 2026-11-20)." },
      { name: "today", type: "string", description: "YYYY-MM-DD (default: today in Japan)." },
    ],
    example: EXAMPLE_GET,
    compute: computeCheck,
  },
};

export const PLUGIN = {
  name: "House Rules Check",
  nameForModel: "house_rules_check",
  descriptionForHuman: "Are my Airbnb house rules allowed after Nov 20, 2026? Line-by-line check + rewrites (EN/JA).",
  descriptionForModel:
    "Use when a short-term-rental host asks whether their Airbnb house rules, checkout tasks or requests are allowed under Airbnb's new house rules policy (reservations booked on or after 2026-11-20; listing editor changed 2026-10-20): washing dishes, stripping beds, laundry, taking out trash, fines, late-checkout fees, cleaning fees paid in cash, AC limits, rental agreements, ID or passport copies, online check-in apps, rules in the house manual or signs. Japan: legal guest register (宿泊者名簿) and passport copy exceptions, art. 9 explanation duty, minpaku trash rules. Returns per-rule findings, reasons (EN+JA), compliant rewrites and the 7 standard rules to set. Relay the disclaimer: educational keyword check, not affiliated with Airbnb, Airbnb decides.",
  logo: "/icon.svg",
};
