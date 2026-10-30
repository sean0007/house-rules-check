import assert from "node:assert/strict";
import test from "node:test";
import { apiHandler, openapiDoc } from "./agent-api";
import { API_DISCLAIMER, API_INFO, ENDPOINTS, EXAMPLE_GET, PUBLIC_URL } from "./api";

const e = ENDPOINTS.check;
const handler = apiHandler(e.compute, { disclaimer: API_DISCLAIMER, docs: `${PUBLIC_URL}/openapi.json`, example: `${PUBLIC_URL}${e.example}` });

test(`GET ${EXAMPLE_GET}`, async () => {
  const res = await handler(new Request(`${PUBLIC_URL}${EXAMPLE_GET}&today=2026-10-28`));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
  const body = await res.json();
  assert.equal(body.disclaimer, API_DISCLAIMER);
  assert.equal(body.verdict, "fix_needed");
  assert.equal(body.counts.total, 3);
  assert.equal(body.items[0].finding, "likely_flagged");
  assert.equal(body.items[1].finding, "likely_flagged");
  assert.equal(body.items[2].finding, "use_standard_rule");
  assert.ok(body.sources.length);
});

test("POST JSON body matches GET; rules array + aliases", async () => {
  const url = new URL(`${PUBLIC_URL}${EXAMPLE_GET}&today=2026-10-28`);
  const post = await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(url.searchParams)) }));
  const get = await handler(new Request(url));
  assert.equal(post.status, 200);
  assert.deepEqual(await post.json(), await get.json());
  const arr = await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rules: ["パスポートのコピーを送ってください", "No pets"], country: "日本", lodging: "民泊", today: "2026-10-28" }) }));
  const b = await arr.json();
  assert.equal(arr.status, 200);
  assert.equal(b.lodging, "minpaku");
  assert.equal(b.items[0].finding, "legal_exception");
  assert.equal(b.items[1].finding, "use_standard_rule");
});

test("errors → 400 with example + disclaimer", async () => {
  for (const q of ["", "?text=", "?text=No%20pets&jurisdiction=mars", "?text=No%20pets&bookingDate=2026-13-01", "?text=No%20pets&channel=fax"]) {
    const res = await handler(new Request(`${PUBLIC_URL}${e.path}${q}`));
    assert.equal(res.status, 400, q);
    const b = await res.json();
    assert.equal(b.disclaimer, API_DISCLAIMER);
    assert.ok(b.example);
  }
});

test("openapi lists the check endpoint", () => {
  const doc = openapiDoc(API_INFO, PUBLIC_URL, Object.values(ENDPOINTS)) as { paths: Record<string, unknown> };
  assert.ok(doc.paths["/api/check"]);
});

test("AC temperature limit (EN + JA) → likely_flagged via the API", async () => {
  const res = await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rules: ["Do not set the AC below 24 degrees.", "エアコンは26度以下に設定しないで", "Please turn off the AC when you leave."], today: "2026-10-30" }) }));
  assert.equal(res.status, 200);
  const b = await res.json();
  assert.equal(b.disclaimer, API_DISCLAIMER);
  assert.equal(b.items[0].finding, "likely_flagged");
  assert.ok(b.items[0].categories.includes("amenity_restriction"));
  assert.equal(b.items[1].finding, "likely_flagged");
  assert.equal(b.items[2].finding, "likely_ok");
});
