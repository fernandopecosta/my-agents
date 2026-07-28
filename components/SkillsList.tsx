"use client";

import { useState } from "react";
import { SkillInfo } from "@/lib/types";

interface SkillsListProps {
  skills: SkillInfo[];
  agentId?: string;
  onDelete?: (name: string) => Promise<void>;
  readOnly?: boolean;
}

export default function SkillsList({
  skills,
  agentId,
  onDelete,
  readOnly = false,
}: SkillsListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (skill: SkillInfo) => {
    if (!agentId) return;

    setDownloading(skill.name);
    try {
      const res = await fetch(
        `/api/agents/${agentId}/skills/${encodeURIComponent(skill.name)}`
      );

      if (!res.ok) {
        throw new Error("Erro ao baixar skill");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${skill.name}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Não foi possível baixar a skill. Tente novamente.");
    } finally {
      setDownloading(null);
    }
  };

  if (skills.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted text-sm">
        Nenhuma skill cadastrada
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {skills.map((skill) => {
        const isDownloading = downloading === skill.name;
        const canDownload = Boolean(agentId);

        return (
          <div
            key={skill.name}
            className="flex items-start gap-3 p-4 rounded-xl bg-bg border border-border group"
          >
            <button
              type="button"
              disabled={!canDownload || isDownloading}
              onClick={() => handleDownload(skill)}
              className={`flex flex-1 items-start gap-3 min-w-0 text-left transition-colors ${
                canDownload
                  ? "cursor-pointer hover:opacity-90"
                  : "cursor-default"
              }`}
              title={canDownload ? "Baixar skill (.zip)" : undefined}
            >
              <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center shrink-0 mt-0.5">
                {isDownloading ? (
                  <div className="w-4 h-4 border-2 border-success border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-success"
                  >
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm group-hover:text-accent transition-colors">
                    {skill.name}
                  </p>
                  {skill.fileCount > 0 && (
                    <span className="badge-success text-xs py-0.5">
                      {skill.fileCount} arquivo{skill.fileCount !== 1 ? "s" : ""}
                    </span>
                  )}
                  {canDownload && !isDownloading && (
                    <span className="text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                      Clique para baixar
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-1 line-clamp-2">
                  {skill.preview}
                </p>
              </div>
            </button>

            {!readOnly && onDelete && (
              <button
                type="button"
                disabled={deleting === skill.name}
                onClick={async (e) => {
                  e.stopPropagation();
                  setDeleting(skill.name);
                  try {
                    await onDelete(skill.name);
                  } finally {
                    setDeleting(null);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-danger hover:bg-danger/10 transition-all shrink-0"
                title="Excluir skill"
              >
                {deleting === skill.name ? (
                  <div className="w-4 h-4 border-2 border-danger border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  </svg>
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
