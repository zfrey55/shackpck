import type { DailyChecklistResponse, AvailableDatesResponse } from "./types";

const API_BASE_URL = "https://us-central1-coin-inventory-8b79d.cloudfunctions.net";

export async function fetchDailyChecklist(
  displayDate?: string
): Promise<DailyChecklistResponse> {
  const url = new URL(`${API_BASE_URL}/getDailyChecklist`);
  url.searchParams.set("orgId", "coin-shack");
  
  if (displayDate) {
    url.searchParams.set("displayDate", displayDate);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const json = (await response.json()) as DailyChecklistResponse;
  if (!json.success) {
    throw new Error("API returned success: false");
  }
  
  return json;
}

export async function fetchAvailableDates(
  limit?: number
): Promise<AvailableDatesResponse> {
  const url = new URL(`${API_BASE_URL}/getAvailableDates`);
  url.searchParams.set("orgId", "coin-shack");
  
  if (limit) {
    url.searchParams.set("limit", limit.toString());
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const json = (await response.json()) as AvailableDatesResponse;
  if (!json.success) {
    throw new Error("API returned success: false");
  }
  
  return json;
}
