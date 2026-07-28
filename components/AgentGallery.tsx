"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AgentCard from "@/components/AgentCard";
import TagFilter from "@/components/TagFilter";
import { Agent } from "@/lib/types";
import { agentMatchesTags, parseTagsParam } from "@/lib/tags";

interface AgentWithSkills {
  agent: Agent;
  skillCount: number;
}

interface AgentGalleryProps {
  agents: AgentWithSkills[];
  allTags: string[];
}

function matchesQuery(agent: Agent, query: string): boolean {
  const term = query.toLowerCase().trim();
  if (!term) return true;

  const haystack = [
    agent.name,
    agent.cargo ?? "",
    agent.description,
    ...(agent.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(term);
}

function AgentGalleryContent({ agents, allTags }: AgentGalleryProps) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  const selectedTags = useMemo(
    () => parseTagsParam(searchParams.get("tags")),
    [searchParams]
  );

  const filtered = useMemo(
    () =>
      agents.filter(
        ({ agent }) =>
          matchesQuery(agent, query) &&
          agentMatchesTags(agent.tags, selectedTags)
      ),
    [agents, query, selectedTags]
  );

  const hasFilters = query.length > 0 || selectedTags.length > 0;

  return (
    <div className="space-y-6">
      {allTags.length > 0 && (
        <Suspense fallback={null}>
          <TagFilter tags={allTags} variant="inline" />
        </Suspense>
      )}

      <div className="relative max-w-md">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome, cargo, descrição ou tag..."
          className="input-field search-field"
          aria-label="Buscar agentes"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-text-muted hover:text-text hover:bg-bg-hover transition-colors"
            aria-label="Limpar busca"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {hasFilters && (
        <p className="text-sm text-text-muted">
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          {query && <> para &ldquo;{query}&rdquo;</>}
          {selectedTags.length > 0 && (
            <> com tag{selectedTags.length !== 1 ? "s" : ""}: {selectedTags.join(", ")}</>
          )}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 card">
          <p className="text-text-muted">
            {hasFilters
              ? "Nenhum agente encontrado com os filtros aplicados"
              : "Nenhum agente encontrado"}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="btn-secondary mt-4"
            >
              Limpar busca
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {filtered.map(({ agent, skillCount }, index) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              featured={!hasFilters && index === 0}
              index={index}
              skillCount={skillCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AgentGallery(props: AgentGalleryProps) {
  return (
    <Suspense fallback={<div className="text-sm text-text-muted">Carregando galeria...</div>}>
      <AgentGalleryContent {...props} />
    </Suspense>
  );
}
