/**
 * SlotWatch Watcher — main entry point.
 *
 * Poll cycle (sleep-resilient):
 *   - A tight inner loop runs every 60 s
 *   - Each iteration checks if POLL_MIN minutes have elapsed since the last real poll
 *   - This survives host sleep/suspend: a laptop that wakes after 45 min will
 *     immediately see that the interval has passed and run a cycle, rather than
 *     waiting another full POLL_MIN window.
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import type { WatchConfig, WatchSlot, WatcherStatus } from "@slotwatch/shared";
import { fetchSlotsForConfig, type SlotsQueryConfig } from "./tesla.js";
import { notify } from "./notify.js";

// ── Config ─────────────────────────────────────────────────────────────────

const DATA_DIR = process.env.DATA_DIR ?? "./state";
const POLL_MIN = parseInt(process.env.POLL_MIN ?? "30", 10);
const INNER_LOOP_MS = 60_000; // check every 60 s whether POLL_MIN has elapsed

// ── File paths ─────────────────────────────────────────────────────────────

const WATCH_CONFIG_PATH = path.join(DATA_DIR, "watch-config.json");
const TESLA_CONFIG_PATH = path.join(DATA_DIR, "tesla-config.json");
const SEEN_SLOTS_PATH = path.join(DATA_DIR, "seen-slots.json");
const STATUS_PATH = path.join(DATA_DIR, "watcher-status.json");

// ── Tesla config (stored separately from watch config) ─────────────────────

interface TeslaConfig {
  vin: string;
  activities: string[];
  lat: number;
  lon: number;
  serviceVisitId: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readJsonFile<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return null;
  }
}

function writeJsonFile(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

/** Stable unique key for a slot — used for diffing. */
function slotKey(slot: WatchSlot): string {
  return `${slot.trtId}|${slot.iso}|${slot.locationName}`;
}

/** Load the set of seen slot keys from disk. */
function loadSeenSlots(): Set<string> {
  const data = readJsonFile<string[]>(SEEN_SLOTS_PATH);
  return new Set(data ?? []);
}

/** Persist the seen-slots set to disk. */
function saveSeenSlots(keys: Set<string>): void {
  writeJsonFile(SEEN_SLOTS_PATH, Array.from(keys));
}

/** Write status to disk. */
function writeStatus(status: WatcherStatus): void {
  writeJsonFile(STATUS_PATH, status);
}

/** Format a list of slots as a human-readable string for notifications. */
function formatSlotsForNotification(slots: WatchSlot[]): string {
  const lines = slots.map(
    (s) => `• ${s.date} ${s.time} — ${s.locationName} (repair type ${s.trtId})`
  );
  return lines.join("\n");
}

// ── Core poll cycle ────────────────────────────────────────────────────────

async function runCycle(
  watchConfig: WatchConfig,
  teslaConfig: TeslaConfig
): Promise<void> {
  const now = new Date().toISOString();
  console.log(`\n[watcher] Running poll cycle at ${now}`);

  const cfg: SlotsQueryConfig = {
    ...watchConfig,
    ...teslaConfig,
  };

  // Fetch available slots from Tesla
  const slots = await fetchSlotsForConfig(cfg);
  console.log(`[watcher] Found ${slots.length} slot(s) in date window`);

  // Diff against previously seen slots
  const seen = loadSeenSlots();
  const newSlots = slots.filter((s) => !seen.has(slotKey(s)));

  console.log(`[watcher] ${newSlots.length} new slot(s) since last check`);

  if (newSlots.length > 0) {
    const subject =
      newSlots.length === 1
        ? "New Tesla service slot available!"
        : `${newSlots.length} new Tesla service slots available!`;

    const body =
      `New appointment slot(s) found:\n\n` +
      formatSlotsForNotification(newSlots) +
      `\n\nTotal slots in window: ${slots.length}`;

    console.log(`[watcher] Sending notifications...\n${body}`);
    await notify(body, subject);

    // Mark all current slots as seen (not just the new ones) so we don't
    // re-alert on slots that were already notified in a prior cycle if they
    // temporarily disappeared and came back.
    for (const s of slots) {
      seen.add(slotKey(s));
    }
    saveSeenSlots(seen);
  } else {
    // Still update seen to remove stale keys that have fallen outside the window
    const currentKeys = new Set(slots.map(slotKey));
    // Prune: keep only keys still in current results (avoids unbounded growth)
    const pruned = new Set([...seen].filter((k) => currentKeys.has(k)));
    // Also add any new ones
    for (const s of slots) pruned.add(slotKey(s));
    saveSeenSlots(pruned);
  }

  const nextCheckTime = new Date(Date.now() + POLL_MIN * 60 * 1000);

  const status: WatcherStatus = {
    configured: true,
    lastCheck: now,
    nextCheck: nextCheckTime.toISOString(),
    trtIds: watchConfig.trtIds,
    dateFrom: watchConfig.dateFrom,
    dateTo: watchConfig.dateTo,
    totalInWindow: slots.length,
    newFound: newSlots.length,
    updatedAt: now,
  };
  writeStatus(status);
}

// ── Main loop ──────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`[watcher] SlotWatch starting up. DATA_DIR=${DATA_DIR}`);
  fs.mkdirSync(DATA_DIR, { recursive: true });

  let lastPollAt = 0; // epoch ms; 0 forces an immediate first cycle

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Read configs fresh on every iteration so dashboard changes take effect
    const watchConfig = readJsonFile<WatchConfig>(WATCH_CONFIG_PATH);
    const teslaConfig = readJsonFile<TeslaConfig>(TESLA_CONFIG_PATH);

    if (!watchConfig || !teslaConfig) {
      const msg =
        "[watcher] watch-config.json or tesla-config.json not found. " +
        "Configure via the dashboard, checking again in 60 s...";
      console.log(msg);

      const unconfiguredStatus: WatcherStatus = {
        configured: false,
        lastCheck: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      writeStatus(unconfiguredStatus);

      await sleep(INNER_LOOP_MS);
      continue;
    }

    const elapsedMs = Date.now() - lastPollAt;
    const pollIntervalMs = POLL_MIN * 60 * 1000;

    if (elapsedMs >= pollIntervalMs) {
      lastPollAt = Date.now();
      try {
        await runCycle(watchConfig, teslaConfig);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error(`[watcher] Cycle error: ${errMsg}`);

        const errorStatus: WatcherStatus = {
          configured: true,
          lastCheck: new Date().toISOString(),
          error: errMsg,
          updatedAt: new Date().toISOString(),
        };
        writeStatus(errorStatus);
      }
    } else {
      const remainingSec = Math.round((pollIntervalMs - elapsedMs) / 1000);
      console.log(
        `[watcher] Next poll in ${remainingSec}s (${Math.round(remainingSec / 60)}m). Sleeping 60s...`
      );
    }

    await sleep(INNER_LOOP_MS);
  }
}

main().catch((err) => {
  console.error("[watcher] Fatal error:", err);
  process.exit(1);
});
