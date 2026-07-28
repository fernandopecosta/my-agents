import { z } from "zod";

export const agentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório").max(100),
  cargo: z.string().max(100).default(""),
  description: z.string().max(500).default(""),
  prompt: z.string().min(1, "Prompt é obrigatório"),
  tags: z.array(z.string().max(50)).max(20).default([]),
  avatar: z.string().nullable().default(null),
  skillsPath: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createAgentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  cargo: z.string().max(100).default(""),
  description: z.string().max(500).default(""),
  prompt: z.string().min(1, "Prompt é obrigatório"),
  tags: z.array(z.string().max(50)).max(20).default([]),
});

export const updateAgentSchema = createAgentSchema.partial();

export type Agent = z.infer<typeof agentSchema>;
export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;

export interface AgentsData {
  agents: Agent[];
}

export interface SkillInfo {
  name: string;
  path: string;
  preview: string;
  fileCount: number;
}

export const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 MB
export const MAX_SKILL_ZIP_SIZE = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_AVATAR_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];
