import type { Metadata } from "next";
import { RULES_AS_OF, SOURCES } from "@/lib/rules";
import { DISCLAIMER_SHORT, HONESTY } from "@/lib/site";

export const metadata: Metadata = { title: "Disclaimer", description: DISCLAIMER_SHORT };

export default function DisclaimerPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <p className="font-mono text-[11px] tracking-[0.28em] text-amber uppercase">Read this</p>
      <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">Disclaimer</h1>
      <p className="mt-4 text-lg text-foreground">{DISCLAIMER_SHORT}</p>
      <p className="mt-2 text-muted">{HONESTY}</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-base font-semibold text-foreground">What this is</h2>
          <p className="mt-2">
            A free educational checker. It splits pasted house rules into items and matches each against keyword patterns built from a dated reading (as of {RULES_AS_OF}) of Airbnb&apos;s public house rules help article (article 4168) and its 2026-10-20 announcement about house rules for reservations booked on or after 2026-11-20. For Japan it adds notes from the 住宅宿泊事業法 (arts. 8 and 9), the 旅館業法 (art. 6 and the enforcement rules) and the MLIT minpaku guideline (最終改正 2024-12-24).
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">What it is not</h2>
          <p className="mt-2">
            It is not legal advice and is not affiliated with, endorsed by or sponsored by Airbnb. &quot;Airbnb&quot; is a trademark of its owner and is used only to describe the policy discussed. Results are likely outcomes from text patterns: they can miss problems, flag allowed requests, and can&apos;t see your listing, your amenities or the local context Airbnb considers when granting exceptions. Airbnb&apos;s listing editor, support and policies decide. Japanese rules vary by prefecture and city ordinance; confirm guest-register and waste rules with your local health centre (保健所), municipality or a professional.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Sources</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {SOURCES.map((s) => (
              <li key={s}>
                <a href={s} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Your data</h2>
          <p className="mt-2">The rules you paste are checked in your browser. The API processes text you send and doesn&apos;t store it. Share links contain the text you chose to share. No login, no database.</p>
        </section>
      </div>
    </div>
  );
}
