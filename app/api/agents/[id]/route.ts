import { NextResponse } from "next/server";
import {
  deleteAgent,
  getAgentWithSkills,
  updateAgent,
} from "@/lib/agents";
import { requireEditAccess } from "@/lib/require-edit";
import { updateAgentSchema } from "@/lib/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const agent = await getAgentWithSkills(id);

    if (!agent) {
      return NextResponse.json({ error: "Agente não encontrado" }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error("GET /api/agents/[id]:", error);
    return NextResponse.json(
      { error: "Erro ao buscar agente" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const denied = await requireEditAccess(request);
    if (denied) return denied;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateAgentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const agent = await updateAgent(id, parsed.data);

    if (!agent) {
      return NextResponse.json({ error: "Agente não encontrado" }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error("PUT /api/agents/[id]:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar agente" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const denied = await requireEditAccess(request);
    if (denied) return denied;

    const { id } = await params;
    const deleted = await deleteAgent(id);

    if (!deleted) {
      return NextResponse.json({ error: "Agente não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/agents/[id]:", error);
    return NextResponse.json(
      { error: "Erro ao excluir agente" },
      { status: 500 }
    );
  }
}
