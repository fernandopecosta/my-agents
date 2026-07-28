import Link from "next/link";
import { notFound } from "next/navigation";
import AgentForm from "@/components/AgentForm";
import EditPasswordForm from "@/components/EditPasswordForm";
import { getAgentWithSkills } from "@/lib/agents";
import { getEditAccessFromCookies } from "@/lib/require-edit";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditAgentPage({ params }: PageProps) {
  const { id } = await params;
  const agent = await getAgentWithSkills(id);

  if (!agent) notFound();

  const hasEditAccess = await getEditAccessFromCookies();
  const { skills, ...agentData } = agent;

  if (!hasEditAccess) {
    return (
      <div className="p-6 md:p-10">
        <header className="mb-10 text-center">
          <Link
            href={`/agents/${id}`}
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors mb-4"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Voltar ao agente
          </Link>
        </header>
        <EditPasswordForm
          title="Desbloquear edição"
          description={`Informe a senha de edição para alterar ${agent.name}`}
        />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <header className="mb-10">
        <Link
          href={`/agents/${id}`}
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors mb-4"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Voltar ao agente
        </Link>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Editar {agent.name}
        </h1>
        <p className="text-text-muted mt-2">
          Atualize as informações, avatar e skills
        </p>
      </header>

      <AgentForm mode="edit" initialData={agentData} initialSkills={skills} />
    </div>
  );
}
