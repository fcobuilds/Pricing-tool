import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  const adminPassword = process.env.ADMIN_PASSWORD;
  const authSecret = process.env.AUTH_SECRET;

  if (!adminPassword || !authSecret) {
    return NextResponse.json(
      { error: "Server not configured. Set ADMIN_PASSWORD and AUTH_SECRET." },
      { status: 503 }
    );
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const from = req.nextUrl.searchParams.get("from") || "/";
  const res = NextResponse.json({ ok: true, redirect: from });

  res.cookies.set("fs_session", authSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return res;
}
