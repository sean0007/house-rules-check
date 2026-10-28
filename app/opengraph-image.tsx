import { ImageResponse } from "next/og";

export const alt = "House Rules Check: are my Airbnb house rules still allowed after Nov 20, 2026?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#07080c", color: "#f3efe4", padding: "64px", fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
        <div style={{ display: "flex", fontSize: 22, letterSpacing: "0.28em", textTransform: "uppercase", color: "#f0b429" }}>Free · Airbnb hosts · bookings from 2026-11-20</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 68, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: 1050 }}>Are my Airbnb house rules still allowed?</div>
          <div style={{ display: "flex", fontSize: 30, color: "#9b9588", maxWidth: 1050, lineHeight: 1.35 }}>Dishes · stripping beds · trash · fines · fees · AC limits · ID · signs after booking</div>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 22, color: "#9b9588" }}>
          <span style={{ color: "#99f6e4" }}>Line-by-line + rewrites</span>
          <span>EN / 日本語 · 民泊 guest register</span>
          <span>Free JSON API · no login</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
