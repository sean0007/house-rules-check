import type { Metadata } from "next";
import { Calculator } from "@/components/calculator";
import { FaqSection, type FaqItem } from "@/components/faq-section";
import { SOURCES } from "@/lib/rules";
import { EXAMPLE_JA, EXAMPLE_SHARED, PUBLIC_URL, resultPath } from "@/lib/share";

export const revalidate = 3600;

const title = "Airbnb house rules checker for the Nov 20, 2026 policy (EN/日本語) · free";
const description =
  "Paste your Airbnb house rules and checkout list: see which are likely not allowed for reservations booked from 2026-11-20 (washing dishes, stripping beds, taking out trash, fines, late-checkout fees, AC limits, contracts, ID, off-platform check-in, rules added after booking), with compliant rewrites, the 7 standard rules to set, and Japan 民泊 guest-register (宿泊者名簿・パスポート写し) notes. Free JSON API. Not affiliated with Airbnb.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description },
  twitter: { card: "summary_large_image", title, description },
};

const webAppLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "House Rules Check",
  alternateName: ["Airbnb house rules checker", "Airbnb checkout tasks checker 2026", "Airbnb ハウスルール チェック", "民泊 ハウスルール 確認ツール"],
  url: PUBLIC_URL,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
  inLanguage: ["en", "ja"],
  description: "Unofficial, free line-by-line checker for short-term-rental house rules under Airbnb's house rules policy for reservations booked on or after 2026-11-20, with Japan minpaku/ryokan guest-register exceptions and a keyless JSON API. Not affiliated with Airbnb.",
};

const faq: FaqItem[] = [
  {
    q: "What changes in Airbnb house rules on November 20, 2026?",
    a: "For reservations booked on or after 2026-11-20, house rules are 7 standard rules (maximum overnight guests, quiet hours, events, pets, smoking, commercial photography, lock up at checkout) plus reasonable requests. Everything must be in the listing's House rules and requests section before booking, and hosts generally can't ask for cleaner tasks, impose fines, restrict advertised amenities, require separate contracts or collect ID except where the law requires it. Airbnb changed the listing editor on 2026-10-20.",
  },
  {
    q: "Can I still ask guests to wash the dishes or strip the beds?",
    a: "Generally no. Airbnb names washing and putting away dishes, stripping the bed and taking trash off-site as examples of tasks a cleaner would do. You can still ask guests to leave dishes in the sink, gather used towels, sort trash into designated indoor bins and switch off lights and AC.",
  },
  {
    q: "Can I charge a fine for smoking or a late checkout fee?",
    a: "No fines or penalties, and that includes charges for breaking a rule. Damage goes through AirCover. If an HOA, building or local government may fine for something, give notice in the Local rules section. Mandatory fees for advertised features must be in the price shown at booking; only optional add-ons like breakfast go in requests.",
  },
  {
    q: "Can I add rules in the house manual, on signs or by message after booking?",
    a: "Not new ones. Rules count only if they were in the House rules and requests section before booking. Signs and manuals can still explain how to use things and give safety information, but they can't add rules that aren't in the listing.",
  },
  {
    q: "I host in Japan. Can I still collect passport copies?",
    a: "Yes, where the law requires it. Minpaku (住宅宿泊事業法 art. 8) and hotels/ryokan/簡易宿所 (旅館業法 art. 6) must keep a guest register, and for foreign guests without a Japan address that includes nationality and passport number with a passport copy. Airbnb allows ID collection required by law: disclose it in Requests before booking and ask only for what the law requires. Never ask for My Number, a selfie or a deposit.",
  },
  {
    q: "Can I ask guests in Japan to take the trash to the collection point?",
    a: "Better not. Airbnb doesn't allow asking guests to take trash off-site, and under the MLIT minpaku guideline the trash from a minpaku is business waste the operator must dispose of. Ask guests to sort it into the designated bins inside the home, which is allowed and which you must explain under 住宅宿泊事業法 art. 9.",
  },
  {
    q: "Does this tool tell me what Airbnb will decide?",
    a: "No. It matches your text against patterns built from Airbnb's public help article and announcement, so results are likely outcomes. Airbnb's own listing editor flags rules when you save them, and Airbnb may grant exceptions for local conditions (bear-proof bins, drought shower limits). It is not affiliated with Airbnb.",
  },
  {
    q: "Is there a free API for AI agents?",
    a: `Yes. GET ${PUBLIC_URL}/api/check?text=Please%20wash%20the%20dishes.%0ANo%20smoking (keyless, CORS open) or POST {"rules":["...","..."],"jurisdiction":"JP","lodging":"minpaku"}. Policy summary at /api/rules, OpenAPI at /openapi.json, llms.txt, and the MCP tool airbnb_house_rules_check on free-agent-tools.vercel.app/mcp. Every response carries rulesAsOf, sources and a disclaimer.`,
  },
  {
    q: "Airbnbのハウスルールは11月20日から何が変わりますか？",
    a: "2026年11月20日以降に確定した予約から、ハウスルールは7つの標準ルール（最大宿泊人数・騒音禁止の時間帯・イベント・ペット・喫煙・商業目的の撮影・チェックアウト時の施錠）と合理的な「リクエスト」になります。予約前にリスティングに書いたものだけが有効で、食器洗い・シーツ外し・ごみの敷地外への持ち出しなど清掃スタッフの作業、罰金、設備の利用制限、別途の契約、法令で必要な場合以外の身分証の収集は認められません。",
  },
  {
    q: "民泊の宿泊者名簿やパスポートの写しはどうなりますか？",
    a: "住宅宿泊事業法第8条・旅館業法第6条で宿泊者名簿は義務で、日本に住所のない外国人宿泊者は国籍・旅券番号の記載と旅券の写しの保存が必要です。Airbnbは法令で必要な個人情報の収集を例外として認めているため、予約前に「リクエスト」で開示し、法令の項目に限れば引き続き収集できます。マイナンバーや自撮り写真などは求めないでください。",
  },
];

const ROWS: [string, string, string][] = [
  ["Wash / put away dishes, run the dishwasher", "Not allowed", "Leave dishes in the sink"],
  ["Strip beds, start laundry, make beds", "Not allowed", "Gather used towels"],
  ["Take trash to the curb / collection point", "Not allowed", "Sort trash into indoor bins"],
  ["Fines, penalties, late-checkout fees", "Not allowed", "State the rule; damage via AirCover"],
  ["Cleaning / extra fees paid on site", "Move to Pricing", "Optional add-ons can stay in requests"],
  ["\"Don't use the AC\", hot tub hours", "Not allowed", "Turn off AC when you leave"],
  ["Rental agreement, waiver, ID copy, app check-in", "Only if required by law", "Japan: guest register + passport copy"],
  ["New rules by message, sign or in person", "Not allowed", "Put every rule in the listing"],
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <section className="max-w-3xl">
        <p className="font-mono text-[11px] tracking-[0.28em] text-amber uppercase">Free · Airbnb hosts · EN / 日本語 · policy for bookings from 2026-11-20</p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">Are my Airbnb house rules still allowed?</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground sm:text-lg">
          From reservations booked on November 20, 2026, Airbnb only accepts 7 standard rules plus reasonable requests written in the listing before booking. Checkout chores, fines, on-site fees, amenity limits, ID and contracts are out, except where the law requires them. Paste your rules to see which ones to fix, with a rewrite for each.
        </p>
        <p className="mt-3 text-sm text-muted">
          Examples:{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_SHARED)}>
            typical checkout list
          </a>
          {" · "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_JA)}>
            日本の民泊のハウスルール
          </a>
        </p>
      </section>

      <section className="mt-8">
        <Calculator />
      </section>

      <section className="mt-16 max-w-5xl">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">What changes for checkout lists</h2>
        <div className="mt-5 overflow-x-auto rounded-3xl border border-line">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="bg-panel/80 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Common rule</th>
                <th className="px-4 py-3 font-medium">From 2026-11-20 bookings</th>
                <th className="px-4 py-3 font-medium">Ask this instead</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              {ROWS.map(([a, b, c]) => (
                <tr key={a} className="border-t border-line">
                  <td className="px-4 py-3 text-foreground">{a}</td>
                  <td className="px-4 py-3">{b}</td>
                  <td className="px-4 py-3">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-muted">
          Based on Airbnb&apos;s house rules help article and its 2026-10-20 announcement (read 2026-10-28). Airbnb may allow requests tied to local conditions, such as animal-proof bins or drought shower limits.
        </p>
        <p className="mt-4 text-sm text-muted">
          Sources:{" "}
          {SOURCES.map((s, i) => (
            <span key={s}>
              {i ? " · " : ""}
              <a className="underline underline-offset-2 hover:text-foreground" href={s} target="_blank" rel="noopener noreferrer">
                {s.replace("https://www.", "").replace("https://", "").slice(0, 60)}
              </a>
            </span>
          ))}
        </p>
      </section>

      <section className="mt-12 max-w-3xl rounded-3xl border border-line bg-panel/40 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">For AI agents and developers</h2>
        <p className="mt-2 text-sm text-muted">
          Keyless JSON, CORS open, GET or POST:{" "}
          <a className="font-mono text-foreground underline underline-offset-2 break-all" href="/api/check?text=Please%20wash%20the%20dishes%20before%20checkout.%0ANo%20smoking%2C%20%24250%20fine.%0AQuiet%20hours%2010pm-8am.">
            /api/check?text=Please wash the dishes…
          </a>
          . Policy: <a className="font-mono text-foreground underline underline-offset-2" href="/api/rules">/api/rules</a>. Docs: <a className="underline underline-offset-2" href="/openapi.json">OpenAPI</a>,{" "}
          <a className="underline underline-offset-2" href="/llms.txt">llms.txt</a>, MCP tool <span className="font-mono text-foreground">airbnb_house_rules_check</span> on{" "}
          <a className="underline underline-offset-2" href="https://free-agent-tools.vercel.app" target="_blank" rel="noopener noreferrer">
            free-agent-tools
          </a>
          .
        </p>
      </section>

      <FaqSection items={faq} heading="House rules: questions" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppLd).replace(/</g, "\\u003c") }} />
    </div>
  );
}
