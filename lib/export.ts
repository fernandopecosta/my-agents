import fs from "fs/promises";
import path from "path";
import { Agent, SkillInfo } from "./types";
import { getAgentSkillsDir } from "./agents";
import { countSkillFiles, findSkillMdPath } from "./skill-zip";

export interface SkillWithContent extends SkillInfo {
  content: string;
}

export function slugifyFilename(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 64) || "agente";
}

export async function getAgentSkillsWithContent(
  id: string
): Promise<SkillWithContent[]> {
  const skillsDir = getAgentSkillsDir(id);
  try {
    await fs.access(skillsDir);
  } catch {
    return [];
  }

  const entries = await fs.readdir(skillsDir, { withFileTypes: true });
  const skills: SkillWithContent[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillDir = path.join(skillsDir, entry.name);
    const skillMd = await findSkillMdPath(skillDir);
    if (!skillMd) continue;

    try {
      const content = await fs.readFile(skillMd, "utf-8");
      const fileCount = await countSkillFiles(skillDir);
      skills.push({
        name: entry.name,
        path: `storage/agents/${id}/skills/${entry.name}`,
        preview: content.slice(0, 200).replace(/\n/g, " ").trim(),
        fileCount,
        content,
      });
    } catch {
      // skip invalid skill folders
    }
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

export function buildAgentMarkdown(
  agent: Agent,
  skills: SkillWithContent[]
): string {
  const lines: string[] = [
    "---",
    `name: ${agent.name}`,
    `cargo: ${agent.cargo ?? ""}`,
    `id: ${agent.id}`,
    `exported_at: ${new Date().toISOString()}`,
    "---",
    "",
    `# ${agent.name}`,
    "",
  ];

  if (agent.cargo) {
    lines.push(`**Cargo:** ${agent.cargo}`, "");
  }

  if (agent.tags?.length) {
    lines.push(`**Tags:** ${agent.tags.join(", ")}`, "");
  }

  if (agent.description) {
    lines.push("## Descrição", "", agent.description, "");
  }

  lines.push("## Prompt de Instruções", "", agent.prompt, "");

  if (skills.length > 0) {
    lines.push("## Skills", "");
    for (const skill of skills) {
      lines.push(
        `### ${skill.name}`,
        "",
        `*${skill.fileCount} arquivo(s) na skill*`,
        "",
        skill.content.trim(),
        ""
      );
    }
  }

  return lines.join("\n").trimEnd() + "\n";
}

export function buildAllAgentsMarkdown(
  agents: Array<{ agent: Agent; skills: SkillWithContent[] }>
): string {
  const parts = agents.map(({ agent, skills }) =>
    buildAgentMarkdown(agent, skills)
  );
  return parts.join("\n\n---\n\n");
}
