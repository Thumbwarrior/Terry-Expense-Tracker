import { NextResponse } from "next/server";
import { getSessionPayload } from "./session";
import type { JwtPayload } from "./jwt";

export async function requireAuth(): Promise<JwtPayload | NextResponse> {
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

export function isAuthError(
  result: JwtPayload | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}
