import { NextResponse } from "next/server";
import { listAgents } from "@/lib/agents";
import {
  buildAllAgentsMarkdown,
  getAgentSkillsWithContent,
} from "@/lib/export";

export async function GET() {
  try {
    const agents = await listAgents();

    const withSkills = await Promise.all(
      agents.map(async (agent) => ({
        agent,
        skills: await getAgentSkillsWithContent(agent.id),
      }))
    );

    const markdown = buildAllAgentsMarkdown(withSkills);

    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": 'attachment; filename="my-agents.md"',
      },
    });
  } catch (error) {
    console.error("GET /api/agents/export:", error);
    return NextResponse.json(
      { error: "Erro ao exportar agentes" },
      { status: 500 }
    );
  }
}
