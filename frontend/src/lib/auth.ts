import { parseCookies, setCookie, destroyCookie } from "nookies";

export const AUTH_COOKIE = "nourishnow_token";

export function saveAuthToken(token: string) {
  setCookie(null, AUTH_COOKIE, token, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: false
  });
}

export function getAuthToken(ctx?: any) {
  const cookies = parseCookies(ctx);
  return cookies[AUTH_COOKIE];
}

export function clearAuthToken() {
  destroyCookie(null, AUTH_COOKIE);
}


export interface NourishJwtPayload {
  sub?: string;
  userId?: number;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

export function decodeJwt(token: string): NourishJwtPayload {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload); // browser-safe base64 decode
    return JSON.parse(decoded);
  } catch (err) {
    console.error("JWT decode error:", err);
    return {};
  }
}

export function getJwtUserId(token?: string): number | null {
  const payload = decodeJwt(token || getAuthToken() || "");
  return payload.userId ?? null;
}

export function getJwtUsername(token?: string): string | null {
  const payload = decodeJwt(token || getAuthToken() || "");
  return payload.sub ?? null;
}

export function getJwtRole(token?: string): string | null {
  const payload = decodeJwt(token || getAuthToken() || "");
  return payload.role ?? null;
}

export function isTokenExpired(token?: string): boolean {
  const payload = decodeJwt(token || getAuthToken() || "");
  if (!payload.exp) return true;

  // JWT exp is in seconds; convert to ms
  return Date.now() >= payload.exp * 1000;
}

export function isTokenValid(token?: string): boolean {
  const raw = token || getAuthToken();

  if (!raw) return false;

  const payload = decodeJwt(raw);

  // Must have required fields
  if (!payload || typeof payload !== "object") return false;
  if (!payload.sub || !payload.userId || !payload.role) return false;

  // Must not be expired
  if (!payload.exp) return false;

  const expired = Date.now() >= payload.exp * 1000;
  if (expired) return false;

  return true;
}
