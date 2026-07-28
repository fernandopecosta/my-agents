import { NextResponse } from "next/server";
import {
  EDIT_COOKIE_NAME,
  createEditSessionToken,
  editSessionCookieOptions,
  verifyEditPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = typeof body.password === "string" ? body.password : "";

    if (!password) {
      return NextResponse.json(
        { error: "Senha de edição é obrigatória" },
        { status: 400 }
      );
    }

    const valid = await verifyEditPassword(password);
    if (!valid) {
      return NextResponse.json(
        { error: "Senha de edição incorreta" },
        { status: 401 }
      );
    }

    const token = await createEditSessionToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set(EDIT_COOKIE_NAME, token, editSessionCookieOptions());
    return response;
  } catch (error) {
    console.error("POST /api/auth/edit-login:", error);
    return NextResponse.json(
      { error: "Erro ao autenticar edição" },
      { status: 500 }
    );
  }
}
