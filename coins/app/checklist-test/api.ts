import type { ChecklistResponse } from "./types";

const API_BASE_URL = "https://us-central1-coin-inventory-8b79d.cloudfunctions.net/getChecklist";

export async function fetchChecklist(params: {
  caseType: string;
  startDate: string;
  endDate: string;
}): Promise<ChecklistResponse> {
  const url = new URL(API_BASE_URL);
  url.searchParams.set("orgId", "coin-shack");
  url.searchParams.set("filter", "shackpack");
  url.searchParams.set("caseType", params.caseType);
  url.searchParams.set("startDate", params.startDate);
  url.searchParams.set("endDate", params.endDate);
  // API uses weekly aggregation: coins from cases created in previous week + current premium inventory
  // Weeks are Monday→Sunday (Eastern Time), regenerated every Monday at 1:00 AM Eastern

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const json = (await response.json()) as ChecklistResponse;
  if (!json.success) {
    throw new Error("Checklist API returned success: false");
  }
  return json;
}

