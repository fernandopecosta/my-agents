import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  createSessionToken,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = typeof body.password === "string" ? body.password : "";

    if (!password) {
      return NextResponse.json(
        { error: "Senha é obrigatória" },
        { status: 400 }
      );
    }

    const valid = await verifyPassword(password);
    if (!valid) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
    }

    const token = await createSessionToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("POST /api/auth/login:", error);
    return NextResponse.json(
      { error: "Erro ao autenticar" },
      { status: 500 }
    );
  }
}
