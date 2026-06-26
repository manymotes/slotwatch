/**
 * Tesla ownership API client.
 *
 * All requests go through ownership.tesla.com/mobile-app/service/*
 * Headers mimic the official Tesla iOS app.
 */

import fs from "fs";
import path from "path";
import type { WatchConfig, WatchSlot } from "@slotwatch/shared";
import { getAccessToken, invalidateTokenCache } from "./auth.js";

// ── Constants ──────────────────────────────────────────────────────────────

const BASE_URL = "https://ownership.tesla.com/mobile-app/service";

export const TESLA_HEADERS: Record<string, string> = {
  "x-tesla-user-agent": "TeslaApp/4.57.0/b937ef26/ios/26.5.1",
  "User-Agent": "TeslaV4/4306 CFNetwork/3860.600.12 Darwin/25.5.0",
  "Accept-Language": "en",
  Accept: "application/json",
};

// ── Types from the Tesla API ───────────────────────────────────────────────

interface TeslaSlot {
  startTime: string; // ISO-8601
  endTime: string;
  trtId: number;
  available: boolean;
}

interface TeslaLocation {
  id: number;
  name: string;
  trtIds: number[];
  slots?: TeslaSlot[];
}

interface NearestLocationsResponse {
  locations: TeslaLocation[];
}

interface AppointmentsResponse {
  appointments: Array<{
    serviceVisitID: number;
    locationName: string;
    startDateTime: string;
    trtId: number;
    activities: Array<{
      symptomLabel: string;
      symptomKey: string;
      activityType: string;
    }>;
  }>;
}

// ── Shared fetch wrapper ───────────────────────────────────────────────────

async function teslaFetch(
  url: string,
  init: RequestInit,
  token: string
): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...TESLA_HEADERS,
      Authorization: `Bearer ${token}`,
      ...(init.headers as Record<string, string>),
    },
  });

  if (res.status === 401) {
    // Token was rejected — wipe cache and signal the caller to retry with a fresh token
    invalidateTokenCache();
    throw new Error(
      `Tesla API returned 401 Unauthorized. Token cache cleared; will retry on next cycle.`
    );
  }

  return res;
}

// ── Public API functions ───────────────────────────────────────────────────

/**
 * Fetch the current open service appointment for a VIN.
 * Returns null if no appointment is found.
 */
export async function fetchAppointments(
  vin: string,
  token: string
): Promise<AppointmentsResponse["appointments"]> {
  const params = new URLSearchParams({
    deviceLanguage: "en",
    deviceCountry: "US",
    ttpLocale: "en_US",
    vin,
  });

  const url = `${BASE_URL}/appointments?${params}`;
  const res = await teslaFetch(url, { method: "GET" }, token);

  if (!res.ok) {
    const text = await res.text().catch(() => "(no body)");
    throw new Error(
      `fetchAppointments failed: ${res.status} ${res.statusText} — ${text}`
    );
  }

  const json = (await res.json()) as AppointmentsResponse;
  return json.appointments ?? [];
}

/**
 * POST to the nearest-locations endpoint to retrieve available slots.
 */
export async function fetchNearestLocations(params: {
  vin: string;
  lat: number;
  lon: number;
  activities: string[];
  serviceVisitId: number;
  fetchSlots: boolean;
  token: string;
}): Promise<TeslaLocation[]> {
  const { vin, lat, lon, activities, serviceVisitId, fetchSlots, token } =
    params;

  const queryParams = new URLSearchParams({
    deviceLanguage: "en",
    deviceCountry: "US",
    ttpLocale: "en_US",
    vin,
  });

  const url = `${BASE_URL}/locations/nearest?${queryParams}`;

  const body = JSON.stringify({
    vin,
    latitude: lat,
    longitude: lon,
    activities,
    serviceVisitId,
    isRescheduleOnly: true,
    fetchSlots,
  });

  const res = await teslaFetch(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    },
    token
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "(no body)");
    throw new Error(
      `fetchNearestLocations failed: ${res.status} ${res.statusText} — ${text}`
    );
  }

  const json = (await res.json()) as NearestLocationsResponse;
  return json.locations ?? [];
}

// ── Config shape expected by fetchSlotsForConfig ───────────────────────────

export interface SlotsQueryConfig extends WatchConfig {
  vin: string;
  activities: string[];
  lat: number;
  lon: number;
  serviceVisitId: number;
}

/**
 * High-level helper: fetch slots for the given watcher config, filter by
 * trtIds + date range, and return a flat WatchSlot[].
 */
export async function fetchSlotsForConfig(
  cfg: SlotsQueryConfig
): Promise<WatchSlot[]> {
  const token = await getAccessToken();

  const locations = await fetchNearestLocations({
    vin: cfg.vin,
    lat: cfg.lat,
    lon: cfg.lon,
    activities: cfg.activities,
    serviceVisitId: cfg.serviceVisitId,
    fetchSlots: true,
    token,
  });

  const dateFrom = new Date(cfg.dateFrom);
  const dateTo = new Date(cfg.dateTo);
  // Set dateTo to end-of-day so inclusive filtering works
  dateTo.setHours(23, 59, 59, 999);

  const slots: WatchSlot[] = [];

  for (const loc of locations) {
    // Only consider locations that serve at least one of our target trtIds
    const relevantTrtIds = (loc.trtIds ?? []).filter((id) =>
      cfg.trtIds.includes(id)
    );
    if (relevantTrtIds.length === 0) continue;

    const locationName =
      cfg.locationNames[loc.id] ?? loc.name ?? String(loc.id);

    for (const slot of loc.slots ?? []) {
      if (!slot.available) continue;
      if (!cfg.trtIds.includes(slot.trtId)) continue;

      const slotDate = new Date(slot.startTime);
      if (slotDate < dateFrom || slotDate > dateTo) continue;

      slots.push({
        trtId: slot.trtId,
        date: slotDate.toISOString().slice(0, 10),
        time: slotDate.toISOString().slice(11, 16),
        iso: slot.startTime,
        locationName,
      });
    }
  }

  // Sort chronologically
  slots.sort((a, b) => a.iso.localeCompare(b.iso));

  return slots;
}
