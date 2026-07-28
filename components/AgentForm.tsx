"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import AvatarUpload from "@/components/AvatarUpload";
import SkillsList from "@/components/SkillsList";
import SkillsUploader from "@/components/SkillsUploader";
import { Agent, SkillInfo } from "@/lib/types";
import { parseTagsInput, tagsToInput } from "@/lib/tags";

interface AgentFormProps {
  mode: "create" | "edit";
  initialData?: Agent;
  initialSkills?: SkillInfo[];
}

export default function AgentForm({
  mode,
  initialData,
  initialSkills = [],
}: AgentFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name ?? "");
  const [cargo, setCargo] = useState(initialData?.cargo ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [tagsInput, setTagsInput] = useState(tagsToInput(initialData?.tags));
  const [prompt, setPrompt] = useState(initialData?.prompt ?? "");
  const [skills, setSkills] = useState<SkillInfo[]>(initialSkills);
  const [agentId, setAgentIdState] = useState<string | null>(initialData?.id ?? null);
  const [avatar, setAvatar] = useState<string | null>(initialData?.avatar ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const agentIdRef = useRef<string | null>(initialData?.id ?? null);
  const ensureAgentRef = useRef<Promise<string> | null>(null);
  const avatarUploadRef = useRef<Promise<string> | null>(null);
  const pendingAvatarRef = useRef<File | null>(null);

  const setAgentId = (id: string) => {
    agentIdRef.current = id;
    setAgentIdState(id);
  };

  const modeHeader =
    mode === "create" ? { "X-Agent-Mode": "create" } : undefined;

  const ensureAgent = useCallback(async (): Promise<string> => {
    if (agentIdRef.current) return agentIdRef.current;
    if (ensureAgentRef.current) return ensureAgentRef.current;

    ensureAgentRef.current = (async () => {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          cargo,
          description,
          prompt,
          tags: parseTagsInput(tagsInput),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar agente");
      }

      const agent: Agent = await res.json();
      setAgentId(agent.id);
      return agent.id;
    })();

    try {
      return await ensureAgentRef.current;
    } finally {
      ensureAgentRef.current = null;
    }
  }, [name, cargo, description, prompt, tagsInput]);

  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
    const id = agentIdRef.current ?? (await ensureAgent());
    const formData = new FormData();
    formData.append("avatar", file);

    const res = await fetch(`/api/agents/${id}/avatar`, {
      method: "POST",
      headers: modeHeader,
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Erro no upload");
    }

    const data = await res.json();
    setAvatar(data.avatar);
    setAgentId(id);
    pendingAvatarRef.current = null;
    return id;
  }, [ensureAgent, mode]);

  const handleAvatarUpload = useCallback(async (file: File) => {
    if (avatarUploadRef.current) {
      await avatarUploadRef.current;
    }

    const uploadPromise = uploadAvatar(file);
    avatarUploadRef.current = uploadPromise;

    try {
      await uploadPromise;
    } finally {
      if (avatarUploadRef.current === uploadPromise) {
        avatarUploadRef.current = null;
      }
    }
  }, [uploadAvatar]);

  const handleAvatarSelected = useCallback((file: File) => {
    pendingAvatarRef.current = file;
  }, []);

  const handleSave = async () => {
    setError(null);
    setSaving(true);

    try {
      if (!name.trim() || !prompt.trim()) {
        throw new Error("Nome e prompt são obrigatórios");
      }

      if (avatarUploadRef.current) {
        await avatarUploadRef.current;
      } else if (pendingAvatarRef.current && !avatar) {
        await uploadAvatar(pendingAvatarRef.current);
      }

      const id = agentIdRef.current ?? (await ensureAgent());

      const res = await fetch(`/api/agents/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...modeHeader,
        },
        body: JSON.stringify({
          name,
          cargo,
          description,
          prompt,
          tags: parseTagsInput(tagsInput),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar");
      }

      router.push(`/agents/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setSaving(false);
    }
  };

  const handleSkillUpload = async (file: File) => {
    const id = agentIdRef.current ?? (await ensureAgent());
    const formData = new FormData();
    formData.append("skill", file);
    formData.append("name", file.name);

    const res = await fetch(`/api/agents/${id}/skills`, {
      method: "POST",
      headers: modeHeader,
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Erro no upload");
    }

    const skill: SkillInfo = await res.json();
    setSkills((prev) => {
      const filtered = prev.filter((s) => s.name !== skill.name);
      return [...filtered, skill].sort((a, b) => a.name.localeCompare(b.name));
    });
    setAgentId(id);
  };

  const handleSkillDelete = async (skillName: string) => {
    if (!agentId) return;

    const res = await fetch(`/api/agents/${agentId}/skills/${skillName}`, {
      method: "DELETE",
      headers: modeHeader,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Erro ao excluir");
    }

    setSkills((prev) => prev.filter((s) => s.name !== skillName));
  };

  return (
    <div className="max-w-2xl space-y-8">
      {error && (
        <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-[auto_1fr] gap-8">
        <AvatarUpload
          currentAvatar={avatar}
          onUpload={handleAvatarUpload}
          onFileSelected={handleAvatarSelected}
          disabled={saving}
        />

        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="name">
                Nome
              </label>
              <input
                id="name"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Lily"
              />
            </div>

            <div>
              <label className="label" htmlFor="cargo">
                Cargo
              </label>
              <input
                id="cargo"
                className="input-field"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ex: Consultora de Growth"
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="description">
              Descrição
            </label>
            <input
              id="description"
              className="input-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição do agente"
            />
          </div>

          <div>
            <label className="label" htmlFor="tags">
              Tags
            </label>
            <input
              id="tags"
              className="input-field"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Ex: marketing, growth, e-commerce"
            />
            <p className="text-xs text-text-muted mt-1.5">
              Separe várias tags por vírgula
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="prompt">
          Prompt de instruções
        </label>
        <textarea
          id="prompt"
          className="textarea-field"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Você é um agente especializado em..."
          rows={8}
        />
      </div>

      <div className="space-y-4">
        <SkillsUploader onUpload={handleSkillUpload} disabled={saving} />
        <SkillsList skills={skills} onDelete={handleSkillDelete} agentId={agentId ?? undefined} />
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <button
          type="button"
          className="btn-primary"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? "Salvando..." : mode === "create" ? "Criar Agente" : "Salvar Alterações"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => router.back()}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
