import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import {
  deleteAgentSkill,
  getAgent,
  getAgentSkillsDir,
  slugifySkillName,
} from "@/lib/agents";
import { createSkillZipBuffer } from "@/lib/skill-zip";
import { requireEditAccess } from "@/lib/require-edit";

type RouteParams = { params: Promise<{ id: string; skillName: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id, skillName } = await params;
    const agent = await getAgent(id);

    if (!agent) {
      return NextResponse.json({ error: "Agente não encontrado" }, { status: 404 });
    }

    const slug = slugifySkillName(skillName);
    const skillDir = path.join(getAgentSkillsDir(id), slug);

    try {
      await fs.access(skillDir);
    } catch {
      return NextResponse.json({ error: "Skill não encontrada" }, { status: 404 });
    }

    const buffer = await createSkillZipBuffer(skillDir);
    const filename = `${slug}.zip`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("GET /api/agents/[id]/skills/[skillName]:", error);
    return NextResponse.json(
      { error: "Erro ao baixar skill" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const denied = await requireEditAccess(request);
    if (denied) return denied;

    const { id, skillName } = await params;
    const agent = await getAgent(id);

    if (!agent) {
      return NextResponse.json({ error: "Agente não encontrado" }, { status: 404 });
    }

    const deleted = await deleteAgentSkill(id, skillName);

    if (!deleted) {
      return NextResponse.json({ error: "Skill não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/agents/[id]/skills/[skillName]:", error);
    return NextResponse.json(
      { error: "Erro ao excluir skill" },
      { status: 500 }
    );
  }
}
