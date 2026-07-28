import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getStorageRoot } from "@/lib/agents";

type RouteParams = { params: Promise<{ path: string[] }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { path: segments } = await params;
    const storageRoot = path.resolve(getStorageRoot());

    const relativeSegments =
      segments[0] === "storage" ? segments.slice(1) : segments;

    const filePath = path.join(storageRoot, ...relativeSegments);
    const resolved = path.resolve(filePath);

    if (!resolved.startsWith(storageRoot)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const content = await fs.readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();

    const contentTypes: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".md": "text/markdown",
    };

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentTypes[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
  }
}
