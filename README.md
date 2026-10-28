# House Rules Check

Free line-by-line checker for short-term-rental house rules under Airbnb's house rules policy for reservations booked on or after 2026-11-20. Paste your rules (English or Japanese) and see which are likely not allowed (washing/putting away dishes, stripping beds, laundry, taking trash off-site, fines and penalties, mandatory on-site fees, restricting advertised amenities, separate contracts, ID/personal info, off-platform check-in, rules added after booking by message or sign), which belong in the 7 standard rules or other sections, and a compliant rewrite for each. Japan mode adds the legal guest-register exception (住宅宿泊事業法 art. 8 / 旅館業法 art. 6: passport number and copy for foreign guests without a Japan address), the art. 9 explanation duty and the MLIT minpaku trash rule.

Live: https://house-rules-check.vercel.app

- API: `GET /api/check?text=Please%20wash%20the%20dishes.%0ANo%20smoking` or `POST {"rules":[...],"jurisdiction":"JP","lodging":"minpaku"}` (keyless, CORS), `/api/rules`, `/openapi.json`, `/llms.txt`
- MCP: `airbnb_house_rules_check` on https://free-agent-tools.vercel.app/mcp

Sources: Airbnb Help Center article 4168 (EN/JA) and Airbnb Resource Center "Important changes to house rules" (2026-10-20); e-Gov 住宅宿泊事業法 and 旅館業法施行規則; MLIT 住宅宿泊事業法施行要領 (guideline, 最終改正 2024-12-24) and the MLIT guest-identity leaflet. Rules as of 2026-10-28.

**Disclaimer:** educational keyword check, not legal advice. Not affiliated with, endorsed by or sponsored by Airbnb ("Airbnb" is a trademark of its owner). Findings are likely outcomes; Airbnb's listing editor and support decide.

Dev: `npm ci && npm test && npm run build`
