/**
 * Tesla authentication — pure file-based, no macOS Keychain dependency.
 * Compatible with Docker and Linux containers.
 *
 * Token lifecycle:
 *  1. Read refresh token from DATA_DIR/.refresh_token
 *  2. If a valid cached access token exists in DATA_DIR/token-cache.json, use it
 *  3. Otherwise call Tesla's token endpoint, persist the new tokens, return access token
 *
 * Tesla rotates refresh tokens on every use, so we always write the new one back.
 */

import fs from "fs";
import path from "path";

const TESLA_TOKEN_URL = "https://auth.tesla.com/oauth2/v3/token";
const TOKEN_CLIENT_ID = "ownerapi";

interface TokenCache {
  accessToken: string;
  expiresAt: number; // Unix ms
  refreshToken: string;
}

function dataDir(): string {
  return process.env.DATA_DIR ?? "./state";
}

function refreshTokenPath(): string {
  return path.join(dataDir(), ".refresh_token");
}

function accessTokenPath(): string {
  return path.join(dataDir(), ".access_token");
}

function tokenCachePath(): string {
  return path.join(dataDir(), "token-cache.json");
}

/** Read the stored refresh token or throw a clear error. */
function readRefreshToken(): string {
  const p = refreshTokenPath();
  if (!fs.existsSync(p)) {
    throw new Error(
      `No refresh token found at ${p}. ` +
        `Sign in via the dashboard and your token will be stored there.`
    );
  }
  const token = fs.readFileSync(p, "utf-8").trim();
  if (!token) {
    throw new Error(`Refresh token file at ${p} is empty.`);
  }
  return token;
}

/** Load a cached token-cache.json if it exists and hasn't expired (with 5-min buffer). */
function loadTokenCache(): TokenCache | null {
  const p = tokenCachePath();
  if (!fs.existsSync(p)) return null;
  try {
    const raw = fs.readFileSync(p, "utf-8");
    const cache: TokenCache = JSON.parse(raw);
    const bufferMs = 5 * 60 * 1000;
    if (
      cache.accessToken &&
      cache.expiresAt &&
      Date.now() < cache.expiresAt - bufferMs
    ) {
      return cache;
    }
  } catch {
    // Corrupt cache — ignore and refresh
  }
  return null;
}

/** Persist the new tokens to disk. */
function saveTokens(cache: TokenCache): void {
  const dir = dataDir();
  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(tokenCachePath(), JSON.stringify(cache, null, 2), "utf-8");

  // Keep the flat files in sync for other consumers
  fs.writeFileSync(accessTokenPath(), cache.accessToken, "utf-8");
  fs.writeFileSync(refreshTokenPath(), cache.refreshToken, "utf-8");
}

/** Delete the token cache so the next call forces a full refresh. */
export function invalidateTokenCache(): void {
  const p = tokenCachePath();
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
  }
}

/**
 * Return a valid Tesla access token, refreshing if necessary.
 * Throws if no refresh token is found or the Tesla endpoint rejects the request.
 */
export async function getAccessToken(): Promise<string> {
  // 1. Try the cache first
  const cached = loadTokenCache();
  if (cached) {
    return cached.accessToken;
  }

  // 2. Read the persisted refresh token
  const refreshToken = readRefreshToken();

  // 3. Exchange for new tokens
  console.log("[auth] Access token expired or missing — refreshing...");

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: TOKEN_CLIENT_ID,
    refresh_token: refreshToken,
  });

  const res = await fetch(TESLA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "(no body)");
    throw new Error(
      `Tesla token refresh failed: ${res.status} ${res.statusText} — ${text}`
    );
  }

  const json = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number; // seconds
  };

  if (!json.access_token) {
    throw new Error("Tesla token response missing access_token field.");
  }

  const cache: TokenCache = {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? refreshToken,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  };

  saveTokens(cache);
  console.log(
    `[auth] Token refreshed. Expires in ~${Math.round((json.expires_in ?? 3600) / 60)} minutes.`
  );

  return cache.accessToken;
}
