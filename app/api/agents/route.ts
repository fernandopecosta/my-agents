import { NextResponse } from "next/server";
import { createAgent, listAgents } from "@/lib/agents";
import { createAgentSchema } from "@/lib/types";

export async function GET() {
  try {
    const agents = await listAgents();
    return NextResponse.json(agents);
  } catch (error) {
    console.error("GET /api/agents:", error);
    return NextResponse.json(
      { error: "Erro ao listar agentes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createAgentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const agent = await createAgent(parsed.data);
    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error("POST /api/agents:", error);
    return NextResponse.json(
      { error: "Erro ao criar agente" },
      { status: 500 }
    );
  }
}
