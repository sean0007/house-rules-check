import { CHANNELS, JURISDICTIONS, LODGING, checkHouseRules, type Channel, type Jurisdiction, type Lodging } from "./rules";

export const PUBLIC_URL = "https://house-rules-check.vercel.app";

/** Share links: /r?t=<rules text, newline separated>[&j=other][&l=minpaku|ryokan][&c=message|sign|in_person] */
type Params = URLSearchParams | Record<string, string | string[] | undefined>;
function one(p: Params, key: string): string | undefined {
  if (p instanceof URLSearchParams) return p.get(key) ?? undefined;
  const v = p[key];
  return Array.isArray(v) ? v[0] : v;
}

export const MAX_SHARE_CHARS = 1500;

export type Shared = { text: string; jurisdiction: Jurisdiction; lodging: Lodging; channel: Channel };

export const EXAMPLE_SHARED: Shared = {
  text: "Please wash and put away all dishes before checkout.\nStrip the beds and start a load of laundry.\nTake the trash out to the curb.\nNo smoking. $250 fine if you smoke.\nLate checkout fee of $50 per hour.\nQuiet hours 10pm-8am.\nPlease leave used towels in the bathroom.",
  jurisdiction: "other",
  lodging: "unknown",
  channel: "listing",
};
export const EXAMPLE_JA: Shared = {
  text: "食器は洗って棚に戻してください。\nシーツを外して洗濯機を回してください。\nゴミは分別して所定のゴミ箱に入れてください。\nゴミは近くのゴミ集積所に出してください。\n宿泊者名簿への記入とパスポートの提示をお願いします。\n室内での喫煙は禁止です。違反した場合は罰金3万円を請求します。\n夜22時以降はお静かにお願いします。",
  jurisdiction: "JP",
  lodging: "minpaku",
  channel: "listing",
};
export const EXAMPLES: Shared[] = [EXAMPLE_SHARED, EXAMPLE_JA];

export function parseShared(p: Params): Shared | null {
  const t = one(p, "t");
  if (!t || !t.trim() || t.length > MAX_SHARE_CHARS) return null;
  const j = one(p, "j") ?? "JP";
  const l = one(p, "l") ?? "unknown";
  const c = one(p, "c") ?? "listing";
  return {
    text: t,
    jurisdiction: ((JURISDICTIONS as readonly string[]).includes(j) ? j : "JP") as Jurisdiction,
    lodging: ((LODGING as readonly string[]).includes(l) ? l : "unknown") as Lodging,
    channel: ((CHANNELS as readonly string[]).includes(c) ? c : "listing") as Channel,
  };
}

export function sharedQuery(s: Shared): string {
  const q = new URLSearchParams();
  q.set("t", s.text.slice(0, MAX_SHARE_CHARS));
  if (s.jurisdiction !== "JP") q.set("j", s.jurisdiction);
  if (s.lodging !== "unknown") q.set("l", s.lodging);
  if (s.channel !== "listing") q.set("c", s.channel);
  return q.toString();
}

export function safeCheck(s: Shared, today?: string) {
  try {
    return checkHouseRules({ text: s.text, jurisdiction: s.jurisdiction, lodging: s.lodging, channel: s.channel, today: today ?? null });
  } catch {
    return null;
  }
}
export function resultPath(s: Shared): string {
  return `/r?${sharedQuery(s)}`;
}
export function ogPath(s: Shared): string {
  return `/og?${sharedQuery(s)}`;
}
export function isIndexable(s: Shared): boolean {
  return EXAMPLES.some((e) => resultPath(e) === resultPath(s));
}
