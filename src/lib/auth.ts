import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

export const SESSION_COOKIE_NAME = "socksful-session";

export type UserRole = "user" | "admin";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface SessionPayload extends SessionUser {
  exp: number;
}

const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

const getSessionSecret = () => {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.MONGODB_URI ||
    (process.env.NODE_ENV !== "production" ? "socksful-dev-session-secret" : "");

  if (!secret) {
    throw new Error(
      "Missing AUTH_SECRET, SESSION_SECRET, NEXTAUTH_SECRET, or MONGODB_URI for session signing",
    );
  }

  return secret;
};

const toBase64Url = (value: string | Buffer) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const fromBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf8");
};

const sign = (payload: string) =>
  toBase64Url(createHmac("sha256", getSessionSecret()).update(payload).digest());

const isSafeEqual = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
};

const normalizeRole = (role: unknown): UserRole =>
  role === "admin" ? "admin" : "user";

const isSessionPayload = (value: unknown): value is SessionPayload => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<SessionPayload>;

  return (
    typeof payload.id === "string" &&
    typeof payload.name === "string" &&
    typeof payload.email === "string" &&
    (payload.role === "user" || payload.role === "admin") &&
    typeof payload.exp === "number"
  );
};

export const createSessionCookieValue = (user: SessionUser) => {
  const payload: SessionPayload = {
    id: String(user.id),
    name: user.name,
    email: user.email.toLowerCase().trim(),
    role: normalizeRole(user.role),
    exp: Math.floor(Date.now() / 1000) + ONE_WEEK_SECONDS,
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
};

export const verifySessionCookieValue = (
  cookieValue: string | undefined,
): SessionUser | null => {
  if (!cookieValue) {
    return null;
  }

  const [encodedPayload, signature, extra] = cookieValue.split(".");

  if (!encodedPayload || !signature || extra) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);

  if (!isSafeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload));

    if (!isSessionPayload(payload)) {
      return null;
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      id: payload.id,
      name: payload.name,
      email: payload.email.toLowerCase().trim(),
      role: payload.role,
    };
  } catch {
    return null;
  }
};

const getCookieFromHeader = (cookieHeader: string | null, name: string) => {
  if (!cookieHeader) {
    return undefined;
  }

  return cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
};

export const getSessionFromRequest = (request: Request): SessionUser | null =>
  verifySessionCookieValue(
    getCookieFromHeader(request.headers.get("cookie"), SESSION_COOKIE_NAME),
  );

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: ONE_WEEK_SECONDS,
  path: "/",
};

export const setSessionCookie = (response: NextResponse, user: SessionUser) => {
  response.cookies.set(
    SESSION_COOKIE_NAME,
    createSessionCookieValue(user),
    sessionCookieOptions,
  );
};

export const clearSessionCookie = (response: NextResponse) => {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });
};

export const unauthorized = (message = "Authentication required") =>
  NextResponse.json({ success: false, error: message }, { status: 401 });

export const forbidden = (message = "Admin access required") =>
  NextResponse.json({ success: false, error: message }, { status: 403 });

export const badRequest = (message: string) =>
  NextResponse.json({ success: false, error: message }, { status: 400 });
