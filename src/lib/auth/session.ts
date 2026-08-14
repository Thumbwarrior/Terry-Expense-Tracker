import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, signToken, verifyToken, type JwtPayload } from "./jwt";

const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7;

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SEVEN_DAYS_SECONDS,
    path: "/",
  };
}

export function attachSessionCookie(
  response: NextResponse,
  payload: JwtPayload
): NextResponse {
  const token = signToken(payload);
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return response;
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}

export async function getSessionPayload(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}
