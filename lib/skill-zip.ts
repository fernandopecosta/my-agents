import AdmZip from "adm-zip";
import fs from "fs/promises";
import path from "path";

const MAX_FILES = 300;
const MAX_TOTAL_BYTES = 10 * 1024 * 1024; // 10 MB extracted

function normalizeEntryName(name: string): string {
  return name.replace(/\\/g, "/").replace(/^\/+/, "");
}

function isPathTraversal(relativePath: string): boolean {
  const normalized = path.posix.normalize(relativePath);
  return (
    normalized.startsWith("..") ||
    normalized.includes("/../") ||
    path.isAbsolute(normalized)
  );
}

function detectRootPrefix(entryNames: string[]): string {
  const files = entryNames.filter((n) => !n.endsWith("/"));
  if (files.length === 0) return "";

  const firstSegments = files.map((n) => n.split("/")[0]);
  const uniqueRoots = new Set(firstSegments);

  if (uniqueRoots.size === 1 && files.every((n) => n.includes("/"))) {
    return `${firstSegments[0]}/`;
  }

  return "";
}

function resolveWithinRoot(root: string, relativePath: string): string {
  const resolved = path.resolve(root, relativePath);
  const rootResolved = path.resolve(root);
  if (resolved !== rootResolved && !resolved.startsWith(`${rootResolved}${path.sep}`)) {
    throw new Error("Caminho inválido detectado no ZIP");
  }
  return resolved;
}

export interface ExtractSkillZipResult {
  fileCount: number;
  skillMdRelative: string;
}

export async function extractSkillZip(
  buffer: Buffer,
  targetDir: string
): Promise<ExtractSkillZipResult> {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();

  if (entries.length === 0) {
    throw new Error("ZIP vazio");
  }

  const entryNames = entries
    .map((e) => normalizeEntryName(e.entryName))
    .filter(Boolean);

  let totalBytes = 0;
  let fileCount = 0;

  for (const entry of entries) {
    if (entry.isDirectory) continue;
    const name = normalizeEntryName(entry.entryName);
    if (!name || isPathTraversal(name)) {
      throw new Error("ZIP contém caminhos inválidos");
    }
    fileCount += 1;
    totalBytes += entry.header.size;
  }

  if (fileCount === 0) {
    throw new Error("ZIP não contém arquivos");
  }

  if (fileCount > MAX_FILES) {
    throw new Error(`ZIP excede o limite de ${MAX_FILES} arquivos`);
  }

  if (totalBytes > MAX_TOTAL_BYTES) {
    throw new Error("Conteúdo extraído excede 10 MB");
  }

  const rootPrefix = detectRootPrefix(entryNames);
  let hasSkillMd = false;
  let skillMdRelative = "SKILL.md";

  await fs.mkdir(targetDir, { recursive: true });

  for (const entry of entries) {
    if (entry.isDirectory) continue;

    let relative = normalizeEntryName(entry.entryName);
    if (rootPrefix && relative.startsWith(rootPrefix)) {
      relative = relative.slice(rootPrefix.length);
    }
    relative = relative.replace(/^\/+/, "");
    if (!relative || isPathTraversal(relative)) {
      throw new Error("ZIP contém caminhos inválidos");
    }

    const dest = resolveWithinRoot(targetDir, relative);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, entry.getData());

    if (relative === "SKILL.md" || relative.endsWith("/SKILL.md")) {
      hasSkillMd = true;
      skillMdRelative = relative;
    }
  }

  if (!hasSkillMd) {
    await fs.rm(targetDir, { recursive: true, force: true });
    throw new Error("ZIP deve conter um arquivo SKILL.md");
  }

  return { fileCount, skillMdRelative };
}

export async function countSkillFiles(skillDir: string): Promise<number> {
  let count = 0;

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else {
        count += 1;
      }
    }
  }

  try {
    await walk(skillDir);
  } catch {
    return 0;
  }

  return count;
}

export async function findSkillMdPath(skillDir: string): Promise<string | null> {
  const direct = path.join(skillDir, "SKILL.md");
  try {
    await fs.access(direct);
    return direct;
  } catch {
    // search one level deep
  }

  const entries = await fs.readdir(skillDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const nested = path.join(skillDir, entry.name, "SKILL.md");
      try {
        await fs.access(nested);
        return nested;
      } catch {
        // continue
      }
    }
  }

  return null;
}

export async function createSkillZipBuffer(skillDir: string): Promise<Buffer> {
  const zip = new AdmZip();

  async function addDirectory(dir: string, zipPrefix: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const zipPath = zipPrefix ? `${zipPrefix}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        await addDirectory(fullPath, zipPath);
      } else {
        const data = await fs.readFile(fullPath);
        zip.addFile(zipPath.replace(/\\/g, "/"), data);
      }
    }
  }

  await addDirectory(skillDir, "");
  return zip.toBuffer();
}
