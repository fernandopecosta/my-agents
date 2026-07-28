import Link from "next/link";
import AgentGallery from "@/components/AgentGallery";
import ExportAllButton from "@/components/ExportAllButton";
import { listAgents, listAgentSkills, listAllTags } from "@/lib/agents";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const agents = await listAgents();
  const allTags = await listAllTags();

  const agentsWithSkills = await Promise.all(
    agents.map(async (agent) => ({
      agent,
      skillCount: (await listAgentSkills(agent.id)).length,
    }))
  );

  return (
    <div className="p-6 md:p-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            Galeria de Agentes
          </h1>
          <p className="text-text-muted mt-2">
            {agents.length === 0
              ? "Nenhum agente cadastrado ainda"
              : `${agents.length} agente${agents.length !== 1 ? "s" : ""} ativo${agents.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start">
          {agents.length > 0 && <ExportAllButton />}
          <Link href="/agents/new" className="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8M8 12h8" />
          </svg>
          Novo Agente
          </Link>
        </div>
      </header>

      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 animate-fade-in-up">
          <div className="w-24 h-24 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6 animate-pulse-glow">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-accent"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">
            Seu command deck está vazio
          </h2>
          <p className="text-text-muted text-center max-w-md mb-8">
            Crie seu primeiro agente de IA com prompt personalizado, avatar e skills.
          </p>
          <Link href="/agents/new" className="btn-primary">
            Criar primeiro agente
          </Link>
        </div>
      ) : (
        <AgentGallery agents={agentsWithSkills} allTags={allTags} />
      )}
    </div>
  );
}
