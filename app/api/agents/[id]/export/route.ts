import { NextResponse } from "next/server";
import {
  buildAgentMarkdown,
  getAgentSkillsWithContent,
  slugifyFilename,
} from "@/lib/export";
import { getAgent } from "@/lib/agents";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const agent = await getAgent(id);

    if (!agent) {
      return NextResponse.json({ error: "Agente não encontrado" }, { status: 404 });
    }

    const skills = await getAgentSkillsWithContent(id);
    const markdown = buildAgentMarkdown(agent, skills);
    const filename = `${slugifyFilename(agent.name)}.md`;

    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("GET /api/agents/[id]/export:", error);
    return NextResponse.json(
      { error: "Erro ao exportar agente" },
      { status: 500 }
    );
  }
}
