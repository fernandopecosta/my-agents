import fs from "fs/promises";
import path from "path";
import {
  Agent,
  AgentsData,
  CreateAgentInput,
  SkillInfo,
  UpdateAgentInput,
} from "./types";
import {
  countSkillFiles,
  extractSkillZip,
  findSkillMdPath,
} from "./skill-zip";

const ROOT = process.cwd();
const PERSISTENT_ROOT = process.env.PERSISTENT_DATA_PATH?.trim();
const DATA_FILE = PERSISTENT_ROOT
  ? path.join(PERSISTENT_ROOT, "agents.json")
  : path.join(ROOT, "data", "agents.json");
const STORAGE_DIR = PERSISTENT_ROOT
  ? path.join(PERSISTENT_ROOT, "storage", "agents")
  : path.join(ROOT, "storage", "agents");

export function getAgentDir(id: string): string {
  return path.join(STORAGE_DIR, id);
}

export function getAgentSkillsDir(id: string): string {
  return path.join(getAgentDir(id), "skills");
}

export function getAgentAvatarPath(id: string, ext = "png"): string {
  return path.join(getAgentDir(id), `avatar.${ext}`);
}

export function avatarExtensionFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[mime] ?? "png";
}

export function slugifySkillName(name: string): string {
  return name
    .replace(/\.zip$/i, "")
    .replace(/\.md$/i, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 64);
}

async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify({ agents: [] }, null, 2));
  }
}

export async function readAgentsData(): Promise<AgentsData> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw) as AgentsData;
}

async function writeAgentsData(data: AgentsData): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

function normalizeAgent(agent: Agent): Agent {
  return {
    ...agent,
    cargo: agent.cargo ?? "",
    tags: agent.tags ?? [],
  };
}

export async function listAgents(): Promise<Agent[]> {
  const data = await readAgentsData();
  return data.agents
    .map(normalizeAgent)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

export async function getAgent(id: string): Promise<Agent | null> {
  const data = await readAgentsData();
  const agent = data.agents.find((a) => a.id === id);
  return agent ? normalizeAgent(agent) : null;
}

export async function listAllTags(): Promise<string[]> {
  const agents = await listAgents();
  const tagMap = new Map<string, string>();

  for (const agent of agents) {
    for (const tag of agent.tags) {
      const key = tag.toLowerCase();
      if (!tagMap.has(key)) {
        tagMap.set(key, tag);
      }
    }
  }

  return [...tagMap.values()].sort((a, b) =>
    a.localeCompare(b, "pt-BR", { sensitivity: "base" })
  );
}

export async function createAgent(input: CreateAgentInput): Promise<Agent> {
  const data = await readAgentsData();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const agent: Agent = {
    id,
    name: input.name,
    cargo: input.cargo ?? "",
    description: input.description ?? "",
    prompt: input.prompt,
    tags: input.tags ?? [],
    avatar: null,
    skillsPath: `storage/agents/${id}/skills`,
    createdAt: now,
    updatedAt: now,
  };

  await fs.mkdir(getAgentSkillsDir(id), { recursive: true });
  data.agents.push(agent);
  await writeAgentsData(data);
  return agent;
}

export async function updateAgent(
  id: string,
  input: UpdateAgentInput
): Promise<Agent | null> {
  const data = await readAgentsData();
  const index = data.agents.findIndex((a) => a.id === id);
  if (index === -1) return null;

  const existing = data.agents[index];
  const updated: Agent = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  data.agents[index] = updated;
  await writeAgentsData(data);
  return updated;
}

export async function deleteAgent(id: string): Promise<boolean> {
  const data = await readAgentsData();
  const index = data.agents.findIndex((a) => a.id === id);
  if (index === -1) return false;

  data.agents.splice(index, 1);
  await writeAgentsData(data);

  const agentDir = getAgentDir(id);
  try {
    await fs.rm(agentDir, { recursive: true, force: true });
  } catch {
    // directory may not exist
  }

  return true;
}

export async function setAgentAvatar(id: string, ext = "png"): Promise<string> {
  const relativePath = `storage/agents/${id}/avatar.${ext}`;
  const data = await readAgentsData();
  const index = data.agents.findIndex((a) => a.id === id);
  if (index !== -1) {
    data.agents[index].avatar = relativePath;
    data.agents[index].updatedAt = new Date().toISOString();
    await writeAgentsData(data);
  }
  return relativePath;
}

export async function listAgentSkills(id: string): Promise<SkillInfo[]> {
  const skillsDir = getAgentSkillsDir(id);
  try {
    await fs.access(skillsDir);
  } catch {
    return [];
  }

  const entries = await fs.readdir(skillsDir, { withFileTypes: true });
  const skills: SkillInfo[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillDir = path.join(skillsDir, entry.name);
    const skillMd = await findSkillMdPath(skillDir);
    if (!skillMd) continue;

    try {
      const content = await fs.readFile(skillMd, "utf-8");
      const fileCount = await countSkillFiles(skillDir);
      const preview = content.slice(0, 200).replace(/\n/g, " ").trim();
      skills.push({
        name: entry.name,
        path: `storage/agents/${id}/skills/${entry.name}`,
        preview,
        fileCount,
      });
    } catch {
      // skip invalid skill folders
    }
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveAgentSkillFromZip(
  id: string,
  skillName: string,
  zipBuffer: Buffer
): Promise<SkillInfo> {
  const slug = slugifySkillName(skillName);
  if (!slug) throw new Error("Nome de skill inválido");

  const skillDir = path.join(getAgentSkillsDir(id), slug);
  await fs.rm(skillDir, { recursive: true, force: true });

  const { fileCount } = await extractSkillZip(zipBuffer, skillDir);
  const skillMd = await findSkillMdPath(skillDir);

  if (!skillMd) {
    await fs.rm(skillDir, { recursive: true, force: true });
    throw new Error("ZIP deve conter um arquivo SKILL.md");
  }

  const content = await fs.readFile(skillMd, "utf-8");
  await updateAgent(id, {});

  return {
    name: slug,
    path: `storage/agents/${id}/skills/${slug}`,
    preview: content.slice(0, 200).replace(/\n/g, " ").trim(),
    fileCount,
  };
}

export async function deleteAgentSkill(
  id: string,
  skillName: string
): Promise<boolean> {
  const slug = slugifySkillName(skillName);
  const skillDir = path.join(getAgentSkillsDir(id), slug);

  try {
    await fs.rm(skillDir, { recursive: true, force: true });
    await updateAgent(id, {});
    return true;
  } catch {
    return false;
  }
}

export async function getAgentWithSkills(id: string) {
  const agent = await getAgent(id);
  if (!agent) return null;
  const skills = await listAgentSkills(id);
  return { ...agent, skills };
}

