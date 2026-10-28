import { ImageResponse } from "next/og";
import { EXAMPLE_SHARED, parseShared, safeCheck } from "@/lib/share";

export async function GET(req: Request) {
  const shared = parseShared(new URL(req.url).searchParams) ?? EXAMPLE_SHARED;
  const r = safeCheck(shared) ?? safeCheck(EXAMPLE_SHARED)!;
  const color = { fix_needed: "#fca5a5", review_needed: "#fde68a", tidy_up: "#bae6fd", looks_ok: "#99f6e4" }[r.verdict];
  const stats = [
    { label: "rules checked", value: String(r.counts.total) },
    { label: "likely not allowed", value: String(r.counts.likely_flagged) },
    { label: "move / standard rule", value: String(r.counts.move_to_section + r.counts.use_standard_rule) },
    { label: "likely fine", value: String(r.counts.likely_ok + r.counts.legal_exception) },
  ];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#07080c", color: "#f3efe4", padding: "56px 64px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: "0.24em", textTransform: "uppercase", color: "#f0b429" }}>House Rules Check</div>
          <div style={{ display: "flex", fontSize: 22, color: "#9b9588" }}>bookings from {r.policy.appliesToBookingsFrom}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 34, color: "#c9c3b6" }}>Are my Airbnb house rules still allowed?</div>
          <div style={{ display: "flex", marginTop: 10, fontSize: 92, fontWeight: 800, letterSpacing: "-0.03em", color, lineHeight: 1.05 }}>{r.verdictLabel}</div>
          <div style={{ display: "flex", marginTop: 8, fontSize: 30, color: "#f0b429", maxWidth: 1070 }}>{r.headline}</div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", flex: 1, border: "2px solid #23252c", borderRadius: 24, padding: "14px 20px", background: "#101218" }}>
              <span style={{ fontSize: 40, fontWeight: 700, color: "#f3efe4" }}>{s.value}</span>
              <span style={{ fontSize: 20, color: "#9b9588" }}>{s.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: "#6f6a60" }}>
          <span>house-rules-check.vercel.app · free, no login</span>
          <span>Educational keyword check. Not affiliated with Airbnb.</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" } },
  );
}
