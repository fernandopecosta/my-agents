import { NextResponse } from "next/server";
import {
  getAgent,
  listAgentSkills,
  saveAgentSkillFromZip,
} from "@/lib/agents";
import { requireEditAccess } from "@/lib/require-edit";
import { MAX_SKILL_ZIP_SIZE } from "@/lib/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const agent = await getAgent(id);

    if (!agent) {
      return NextResponse.json({ error: "Agente não encontrado" }, { status: 404 });
    }

    const skills = await listAgentSkills(id);
    return NextResponse.json(skills);
  } catch (error) {
    console.error("GET /api/agents/[id]/skills:", error);
    return NextResponse.json(
      { error: "Erro ao listar skills" },
      { status: 500 }
    );
  }
}

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
    const file = formData.get("skill") as File | null;
    const skillName = (formData.get("name") as string) || file?.name || "";

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".zip")) {
      return NextResponse.json(
        { error: "Apenas arquivos .zip são permitidos" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SKILL_ZIP_SIZE) {
      return NextResponse.json(
        { error: "ZIP muito grande. Máximo 10 MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const skill = await saveAgentSkillFromZip(id, skillName, buffer);

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error("POST /api/agents/[id]/skills:", error);
    const message =
      error instanceof Error ? error.message : "Erro ao fazer upload da skill";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
