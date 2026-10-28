import assert from "node:assert/strict";
import test from "node:test";
import { POLICY_START, RULES_SUMMARY, checkHouseRules, splitRules } from "./rules";

const one = (text: string, extra: Parameters<typeof checkHouseRules>[0] = {}) => checkHouseRules({ text, today: "2026-10-28", ...extra }).items[0];

test("cleaner tasks are likely flagged (EN + JA)", () => {
  for (const t of [
    "Please wash the dishes before checkout.",
    "Load and run the dishwasher.",
    "Strip the beds.",
    "Start a load of laundry.",
    "Vacuum the floors.",
    "Take the trash out to the curb.",
    "食器は洗って棚に戻してください。",
    "シーツを外してください。",
    "ゴミはゴミ集積所に出してください。",
    "ごみはお持ち帰りください。",
  ]) {
    assert.equal(one(t).finding, "likely_flagged", t);
    assert.ok(one(t).rewrite, t);
  }
});

test("light checkout requests are likely ok", () => {
  for (const t of ["Please leave used dishes in the sink.", "Gather used towels in the bathroom.", "Sort the trash into the labelled bins in the kitchen.", "Please turn off the AC when you leave.", "使った食器はシンクに置いてください。", "ゴミは分別して所定のゴミ箱に入れてください。", "靴を脱いでください。"]) {
    assert.equal(one(t).finding, "likely_ok", t);
  }
});

test("fines, fees and penalties", () => {
  assert.equal(one("A $250 fine applies for smoking.").finding, "likely_flagged");
  assert.equal(one("Late check-out fee of $50 per hour.").finding, "likely_flagged");
  assert.equal(one("違反した場合は罰金3万円を請求します。").finding, "likely_flagged");
  assert.equal(one("Security deposit will be deducted for lost keys.").finding, "likely_flagged");
  const fee = one("Cleaning fee of ¥5,000 payable in cash on arrival.");
  assert.equal(fee.finding, "move_to_section");
  assert.match(fee.moveTo!, /Pricing/);
  assert.equal(one("Breakfast is available on request for ¥1,500 per person.").finding, "likely_ok");
  const hoa = one("The HOA may fine for noise after 10pm.");
  assert.equal(hoa.finding, "move_to_section");
  assert.match(hoa.moveTo!, /Local rules/);
});

test("amenities, contracts, off-platform, after-booking", () => {
  assert.equal(one("Do not use the AC between 10pm and 6am.").finding, "likely_flagged");
  assert.equal(one("エアコンの使用は禁止です。").finding, "likely_flagged");
  assert.equal(one("Please sign our rental agreement.").finding, "likely_flagged");
  assert.equal(one("Please register on our website before check-in.").finding, "likely_flagged");
  assert.equal(one("Additional house rules will be sent after booking.").finding, "likely_flagged");
  assert.equal(one("Please follow the rules posted inside the apartment.").finding, "likely_flagged");
  assert.equal(one("Please take your shoes off.", { channel: "sign" }).finding, "likely_flagged");
});

test("Japan guest register is a legal exception; other places and My Number aren't", () => {
  const jp = one("All guests must send a copy of their passport before arrival.");
  assert.equal(jp.finding, "legal_exception");
  assert.match(jp.japanNote!, /guest register/);
  assert.equal(one("宿泊者名簿への記入とパスポートの提示をお願いします。", { lodging: "minpaku" }).finding, "legal_exception");
  assert.equal(one("All guests must send a copy of their passport before arrival.", { jurisdiction: "other" }).finding, "likely_flagged");
  assert.equal(one("マイナンバーカードの写しを送ってください。").finding, "likely_flagged");
  assert.equal(one("Please complete online check-in for the guest register (passport) required by Japanese law.").finding, "review");
});

test("standard rules and local exceptions", () => {
  assert.match(one("No parties or events.").moveTo!, /events/);
  assert.match(one("Quiet hours 10pm-8am.").moveTo!, /quiet hours/);
  assert.match(one("Maximum 4 guests.").moveTo!, /maximum overnight guests/);
  assert.match(one("室内での喫煙は禁止です。").moveTo!, /smoking/);
  assert.equal(one("Bears: please use the animal-proof bin.").finding, "likely_ok");
  assert.equal(one("Due to drought water restrictions, please keep showers under 5 minutes.").finding, "review");
  assert.equal(one("Enjoy your stay!").finding, "no_match");
});

test("verdict, policy dates and counts", () => {
  const r = checkHouseRules({ text: "Wash the dishes.\nNo smoking.\nLeave towels in the bathroom.", today: "2026-10-28", bookingDate: "2026-11-25" });
  assert.equal(r.verdict, "fix_needed");
  assert.equal(r.counts.total, 3);
  assert.equal(r.counts.likely_flagged, 1);
  assert.equal(r.policy.appliesToThisBooking, true);
  assert.equal(r.policy.daysUntilPolicy, 23);
  assert.equal(r.policy.appliesToBookingsFrom, POLICY_START);
  const early = checkHouseRules({ text: "No smoking.", today: "2026-10-28", bookingDate: "2026-11-01" });
  assert.equal(early.policy.appliesToThisBooking, false);
  assert.equal(early.verdict, "tidy_up");
  assert.ok(checkHouseRules({ text: "Leave dishes in the sink.", jurisdiction: "other" }).verdict === "looks_ok");
  assert.equal(checkHouseRules({ rules: ["Wash dishes", "No pets"] }).counts.total, 2);
});

test("splitting and input errors", () => {
  assert.deepEqual(splitRules("- No smoking. No pets.\n2) Quiet after 10pm\n・禁煙です。ペット不可。"), ["No smoking.", "No pets.", "Quiet after 10pm", "禁煙です。", "ペット不可。"]);
  assert.throws(() => checkHouseRules({ text: "" }), /Missing text/);
  assert.throws(() => checkHouseRules({ text: "x".repeat(9000) }), /too long/);
  assert.throws(() => checkHouseRules({ text: "No pets", bookingDate: "2026-13-01" }), /bookingDate/);
  assert.ok(RULES_SUMMARY.policy.standardRules.length === 7);
});
