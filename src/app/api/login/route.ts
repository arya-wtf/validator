import { NextRequest, NextResponse } from "next/server";
import {
  ALLOWED_USERS,
  SESSION_COOKIE_NAME,
  SESSION_LIFETIME_MS,
  signSession,
  timingSafeStringEqual,
  type Username,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  const expectedPassword = process.env.AUTH_PASSWORD;
  if (!secret || !expectedPassword) {
    return new NextResponse("AUTH_SECRET or AUTH_PASSWORD not configured on server", {
      status: 500,
    });
  }

  const form = await req.formData();
  const username = String(form.get("username") || "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") || "");
  const fromRaw = String(form.get("from") || "/");
  const from = fromRaw.startsWith("/") && !fromRaw.startsWith("//") ? fromRaw : "/";

  // Run both checks unconditionally to keep timing flat.
  const passOk = timingSafeStringEqual(password, expectedPassword);
  const userOk = (ALLOWED_USERS as readonly string[]).includes(username);

  if (!userOk || !passOk) {
    const url = new URL("/login", req.url);
    url.searchParams.set("error", "1");
    if (from !== "/") url.searchParams.set("from", from);
    return NextResponse.redirect(url, { status: 303 });
  }

  const token = await signSession(username as Username, secret);
  const res = NextResponse.redirect(new URL(from, req.url), { status: 303 });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_LIFETIME_MS / 1000),
  });
  return res;
}
