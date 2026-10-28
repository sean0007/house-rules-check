import { openapiDoc, preflight, staticJson } from "@/lib/agent-api";
import { API_INFO, ENDPOINTS, PUBLIC_URL } from "@/lib/api";

export function GET() {
  const base = openapiDoc(API_INFO, PUBLIC_URL, Object.values(ENDPOINTS)) as {
    paths: Record<string, unknown>;
    [k: string]: unknown;
  };
  base.paths["/api/rules"] = {
    get: {
      operationId: "houseRulesPolicy",
      summary: "Airbnb house rules policy summary (bookings from 2026-11-20): 7 standard rules, requirements, generally-not-allowed requests, allowed examples, Japan guest-register / explanation-duty / trash rules, sources",
      description: "Returns the rules the checker applies, with Airbnb, e-Gov and MLIT sources and the disclaimer. No inputs.",
      responses: {
        "200": {
          description: "Rules JSON with rulesAsOf and sources.",
          content: { "application/json": { schema: { type: "object", additionalProperties: true } } },
        },
      },
    },
  };
  return staticJson(base);
}
export const OPTIONS = preflight;
