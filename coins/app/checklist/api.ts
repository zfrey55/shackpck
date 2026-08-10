import type {
  DailyChecklistResponse,
  AvailableDatesResponse,
  CardChecklistDatesResponse,
  CardChecklistSeriesResponse,
} from "./types";

const API_BASE_URL = "https://us-central1-coin-inventory-8b79d.cloudfunctions.net";

/**
 * Our tenant in ShackHQ. Every endpoint in this file is scoped by it, so it
 * lives here once rather than being repeated per call.
 *
 * Both of these are still literals on purpose. Moving them to env vars needs a
 * NEXT_PUBLIC_ variable plus a Netlify config change, which is its own task.
 */
const ORG_ID = "coin-shack";

export async function fetchDailyChecklist(
  displayDate?: string,
  caseType?: string
): Promise<DailyChecklistResponse> {
  const url = new URL(`${API_BASE_URL}/getDailyChecklist`);
  url.searchParams.set("orgId", ORG_ID);
  
  if (displayDate) {
    url.searchParams.set("displayDate", displayDate);
  }

  if (caseType) {
    url.searchParams.set("caseType", caseType);
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
  limit?: number,
  caseType?: string
): Promise<AvailableDatesResponse> {
  const url = new URL(`${API_BASE_URL}/getAvailableDates`);
  url.searchParams.set("orgId", ORG_ID);
  
  if (limit) {
    url.searchParams.set("limit", limit.toString());
  }

  if (caseType) {
    url.searchParams.set("caseType", caseType);
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

export async function fetchCardChecklistDates(): Promise<CardChecklistDatesResponse> {
  const url = new URL(`${API_BASE_URL}/getCardChecklistDates`);
  url.searchParams.set("orgId", ORG_ID);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const json = (await response.json()) as CardChecklistDatesResponse;
  if (!json.success) {
    throw new Error("API returned success: false");
  }

  return json;
}

/**
 * Fetch one card series by id.
 *
 * Returns null on 404. That is NOT an error and must not be turned into a
 * throw: during the open submission week a series can be hard-deleted between
 * the moment getCardChecklistDates listed it and the moment we ask for it, so
 * a caller holding a still-warm series id will legitimately miss. Callers are
 * expected to drop the series and carry on. It is also deliberately not
 * logged — this race is routine, and logging it trains people to ignore the
 * console.
 *
 * Every other non-OK status still throws, matching the fetchers above. The
 * response body of a failure is treated as opaque and is never parsed or
 * surfaced.
 */
export async function fetchCardChecklistSeries(
  seriesId: string
): Promise<CardChecklistSeriesResponse | null> {
  const url = new URL(`${API_BASE_URL}/getCardChecklistSeries`);
  url.searchParams.set("orgId", ORG_ID);
  url.searchParams.set("seriesId", seriesId);

  const response = await fetch(url.toString());
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const json = (await response.json()) as CardChecklistSeriesResponse;
  if (!json.success) {
    throw new Error("API returned success: false");
  }

  return json;
}
