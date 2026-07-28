import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { EDIT_COOKIE_NAME, hasEditAccess } from "@/lib/auth";

export async function requireEditAccess(
  request?: Request
): Promise<NextResponse | null> {
  if (request?.headers.get("X-Agent-Mode") === "create") {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(EDIT_COOKIE_NAME)?.value;
  const allowed = await hasEditAccess(token);

  if (!allowed) {
    return NextResponse.json(
      {
        error: "Senha de edição necessária",
        code: "EDIT_AUTH_REQUIRED",
      },
      { status: 403 }
    );
  }

  return null;
}

export async function getEditAccessFromCookies(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(EDIT_COOKIE_NAME)?.value;
  return hasEditAccess(token);
}
