import fs from "fs/promises";
import { NextResponse } from "next/server";
import {
  getAgent,
  getAgentAvatarPath,
  getAgentDir,
  setAgentAvatar,
  avatarExtensionFromMime,
} from "@/lib/agents";
import { requireEditAccess } from "@/lib/require-edit";
import { ALLOWED_AVATAR_TYPES, MAX_AVATAR_SIZE } from "@/lib/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const denied = await requireEditAccess(request);
    if (denied) return denied;

    const { id } = await params;
    const agent = await getAgent(id);

    if (!agent) {
      return NextResponse.json({ error: "Agente não encontrado" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato inválido. Use PNG, JPEG, WebP ou GIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_AVATAR_SIZE) {
      return NextResponse.json(
        { error: "Avatar muito grande. Máximo 2 MB." },
        { status: 400 }
      );
    }

    await fs.mkdir(getAgentDir(id), { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = avatarExtensionFromMime(file.type);
    const avatarPath = getAgentAvatarPath(id, ext);
    await fs.writeFile(avatarPath, buffer);

    const relativePath = await setAgentAvatar(id, ext);
    return NextResponse.json({ avatar: relativePath });
  } catch (error) {
    console.error("POST /api/agents/[id]/avatar:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload do avatar" },
      { status: 500 }
    );
  }
}
