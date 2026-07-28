import Link from "next/link";
import AgentForm from "@/components/AgentForm";

export default function NewAgentPage() {
  return (
    <div className="p-6 md:p-10">
      <header className="mb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors mb-4"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Voltar
        </Link>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Novo Agente
        </h1>
        <p className="text-text-muted mt-2">
          Configure nome, prompt, avatar e skills do seu agente
        </p>
      </header>

      <AgentForm mode="create" />
    </div>
  );
}
