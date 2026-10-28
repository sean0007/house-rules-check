"use client";

import { useState } from "react";
import { CardDisclaimer } from "@/components/card-disclaimer";
import { ShareBar } from "@/components/share-bar";
import { CHANNELS, LODGING, type Channel, type Finding, type Jurisdiction, type Lodging } from "@/lib/rules";
import { EXAMPLE_SHARED, MAX_SHARE_CHARS, PUBLIC_URL, resultPath, safeCheck, type Shared } from "@/lib/share";

const field = "mt-2 w-full rounded-xl border border-line bg-black/40 px-3 py-2 text-sm text-foreground focus:border-amber";

const STYLE: Record<Finding, string> = {
  likely_flagged: "border-red-400/40 bg-red-500/10 text-red-200",
  review: "border-amber-300/40 bg-amber-400/10 text-amber-100",
  move_to_section: "border-sky-300/40 bg-sky-400/10 text-sky-100",
  legal_exception: "border-violet-300/40 bg-violet-400/10 text-violet-100",
  use_standard_rule: "border-teal-300/40 bg-teal-400/10 text-teal-100",
  likely_ok: "border-emerald-300/40 bg-emerald-400/10 text-emerald-100",
  no_match: "border-line bg-white/5 text-muted",
};
const VERDICT_STYLE: Record<string, string> = { fix_needed: "text-red-300", review_needed: "text-amber-200", tidy_up: "text-sky-200", looks_ok: "text-teal-200" };
const LODGING_LABEL: Record<Lodging, string> = { unknown: "Not sure / not in Japan", minpaku: "民泊 (住宅宿泊事業法)", ryokan: "旅館業 (hotel, ryokan, 簡易宿所)" };
const CHANNEL_LABEL: Record<Channel, string> = { listing: "Listing: House rules and requests", message: "Message after booking", sign: "Sign / notice in the home", in_person: "Told in person" };

export function Calculator({ initial }: { initial?: Shared }) {
  const start = initial ?? EXAMPLE_SHARED;
  const [text, setText] = useState(start.text);
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>(start.jurisdiction);
  const [lodging, setLodging] = useState<Lodging>(start.lodging);
  const [channel, setChannel] = useState<Channel>(start.channel);

  const shared: Shared = { text, jurisdiction, lodging, channel };
  const r = text.trim() ? safeCheck(shared) : null;
  const shareUrl = `${PUBLIC_URL}${resultPath(shared)}`;
  const shareable = text.length <= MAX_SHARE_CHARS;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.25fr]">
      <div className="rounded-3xl border border-line bg-panel/60 p-5 sm:p-6">
        <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">Your house rules</p>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-foreground">Paste your rules and checkout requests, one per line (English or 日本語)</span>
          <textarea data-testid="rules" rows={12} className={`${field} font-mono leading-relaxed`} value={text} onChange={(e) => setText(e.target.value)} />
          <span className="mt-1 block text-xs text-muted">Runs in your browser. Nothing is uploaded or stored.</span>
        </label>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <button type="button" className="rounded-full border border-line px-3 py-1 text-muted hover:text-foreground" onClick={() => setText("")}>
            Clear
          </button>
        </div>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-foreground">Where is the property?</span>
          <select data-testid="jurisdiction" className={field} value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value as Jurisdiction)}>
            <option value="JP">Japan (adds guest-register / 宿泊者名簿 rules)</option>
            <option value="other">Elsewhere</option>
          </select>
        </label>
        {jurisdiction === "JP" ? (
          <label className="mt-4 block">
            <span className="text-sm font-medium text-foreground">Licence type</span>
            <select data-testid="lodging" className={field} value={lodging} onChange={(e) => setLodging(e.target.value as Lodging)}>
              {LODGING.map((l) => (
                <option key={l} value={l}>
                  {LODGING_LABEL[l]}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="mt-4 block">
          <span className="text-sm font-medium text-foreground">Where do guests see these rules?</span>
          <select data-testid="channel" className={field} value={channel} onChange={(e) => setChannel(e.target.value as Channel)}>
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {CHANNEL_LABEL[c]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-line bg-panel/60">
        <div className="p-5 sm:p-7" data-testid="result">
          {r ? (
            <>
              <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">
                {r.counts.total} rules · {r.counts.likely_flagged} likely not allowed · bookings from {r.policy.appliesToBookingsFrom}
              </p>
              <p className={`mt-2 font-display text-4xl tracking-tight sm:text-5xl ${VERDICT_STYLE[r.verdict]}`}>{r.verdictLabel}</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{r.headline}</p>
              <p className="mt-3 text-sm text-muted">{r.summary}</p>
              <ol className="mt-5 space-y-3">
                {r.items.map((it) => (
                  <li key={it.index} className={`rounded-2xl border p-4 text-sm ${STYLE[it.finding]}`} data-testid="item">
                    <p className="font-mono text-[11px] tracking-[0.18em] uppercase opacity-80">
                      {it.label}
                      {it.moveTo ? ` → ${it.moveTo}` : ""}
                    </p>
                    <p className="mt-1 font-medium text-foreground">{it.text}</p>
                    <p className="mt-1 text-muted">{it.reasons[0]}</p>
                    <p className="mt-1 text-xs text-muted">{it.reasonsJa[0]}</p>
                    {it.rewrite ? (
                      <p className="mt-2 text-foreground">
                        <span className="font-semibold">Try instead:</span> {it.rewrite}
                      </p>
                    ) : null}
                    {it.japanNote ? <p className="mt-2 text-xs text-muted">{it.japanNote}</p> : null}
                  </li>
                ))}
              </ol>
              {r.japanChecklist.length ? (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-foreground">Japan checklist before Nov 20</h3>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
                    {r.japanChecklist.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="mt-6">
                {shareable ? (
                  <ShareBar url={shareUrl} text={`My Airbnb house rules check → ${r.verdictLabel}: ${r.headline}`} />
                ) : (
                  <p className="text-xs text-muted">Too long to share as a link (max {MAX_SHARE_CHARS} characters).</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">Paste at least one rule. Put each rule on its own line (max 8,000 characters, 80 rules).</p>
          )}
        </div>
        <CardDisclaimer />
      </div>
    </div>
  );
}
