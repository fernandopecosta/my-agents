import Link from "next/link";
import { notFound } from "next/navigation";
import SkillsList from "@/components/SkillsList";
import DeleteAgentButton from "@/components/DeleteAgentButton";
import EditAgentLink from "@/components/EditAgentLink";
import ExportAgentButton from "@/components/ExportAgentButton";
import { getAgentWithSkills } from "@/lib/agents";
import { avatarUrl, getInitials } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function AgentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const agent = await getAgentWithSkills(id);

  if (!agent) notFound();

  const url = avatarUrl(agent.avatar);

  return (
    <div className="p-6 md:p-10">
      <header className="mb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Galeria
        </Link>

        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="avatar-ring w-24 h-24 shrink-0">
            <div className="w-full h-full rounded-full bg-bg-elevated flex items-center justify-center overflow-hidden text-3xl font-display font-bold text-accent">
              {url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt={agent.name} className="w-full h-full object-cover" />
              ) : (
                getInitials(agent.name)
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                    {agent.name}
                  </h1>
                  {(agent.cargo ?? "") && (
                    <span className="text-lg md:text-xl text-accent font-medium">
                      {agent.cargo}
                    </span>
                  )}
                </div>
                {agent.description && (
                  <p className="text-text-muted mt-2 text-lg">{agent.description}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <ExportAgentButton agentId={id} agentName={agent.name} />
                <EditAgentLink agentId={id} />
                <DeleteAgentButton agentId={id} agentName={agent.name} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="badge-success">
                {agent.skills.length} skill{agent.skills.length !== 1 ? "s" : ""}
              </span>
              <span className="badge">
                Criado {new Date(agent.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </div>

            {(agent.tags ?? []).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {agent.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/?tags=${encodeURIComponent(tag)}`}
                    className="tag-chip tag-chip-active"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="card p-6">
          <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            Prompt de Instruções
          </h2>
          <pre className="text-sm text-text-muted whitespace-pre-wrap font-body leading-relaxed bg-bg rounded-xl p-4 border border-border">
            {agent.prompt}
          </pre>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
            Skills
          </h2>
          <SkillsList skills={agent.skills} readOnly agentId={id} />
        </section>
      </div>
    </div>
  );
}
