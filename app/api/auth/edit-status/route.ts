import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { EDIT_COOKIE_NAME, hasEditAccess } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(EDIT_COOKIE_NAME)?.value;
  const unlocked = await hasEditAccess(token);
  return NextResponse.json({ unlocked });
}
