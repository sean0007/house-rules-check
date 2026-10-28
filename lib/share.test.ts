import assert from "node:assert/strict";
import test from "node:test";
import { EXAMPLES, EXAMPLE_JA, EXAMPLE_SHARED, isIndexable, parseShared, safeCheck, sharedQuery } from "./share";

test("share link round-trips", () => {
  for (const ex of EXAMPLES) {
    assert.deepEqual(parseShared(new URLSearchParams(sharedQuery(ex))), ex);
    assert.ok(isIndexable(ex));
    assert.ok(safeCheck(ex, "2026-10-28"));
  }
  assert.equal(isIndexable({ ...EXAMPLE_SHARED, text: "No pets" }), false);
});

test("example results", () => {
  const a = safeCheck(EXAMPLE_SHARED, "2026-10-28")!;
  assert.equal(a.verdict, "fix_needed");
  assert.equal(a.counts.likely_flagged, 5);
  const b = safeCheck(EXAMPLE_JA, "2026-10-28")!;
  assert.equal(b.verdict, "fix_needed");
  assert.equal(b.counts.legal_exception, 1);
});

test("bad share params → null or defaults", () => {
  assert.equal(parseShared(new URLSearchParams("")), null);
  assert.equal(parseShared(new URLSearchParams(`t=${"a".repeat(2000)}`)), null);
  assert.equal(parseShared(new URLSearchParams("t=No%20pets&j=mars"))?.jurisdiction, "JP");
});
