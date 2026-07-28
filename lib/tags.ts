export function parseTagsInput(input: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const part of input.split(",")) {
    const tag = part.trim();
    if (!tag) continue;

    const key = tag.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(tag.slice(0, 50));
  }

  return result.slice(0, 20);
}

export function tagsToInput(tags: string[] | undefined): string {
  return (tags ?? []).join(", ");
}

export function agentMatchesTags(
  agentTags: string[] | undefined,
  selectedTags: string[]
): boolean {
  if (selectedTags.length === 0) return true;

  const normalized = new Set(
    (agentTags ?? []).map((tag) => tag.toLowerCase())
  );

  return selectedTags.some((tag) => normalized.has(tag.toLowerCase()));
}

export function parseTagsParam(param: string | null): string[] {
  if (!param) return [];
  return parseTagsInput(param.replace(/\+/g, " "));
}

export function buildTagsQuery(selectedTags: string[]): string {
  if (selectedTags.length === 0) return "";
  return `?tags=${encodeURIComponent(selectedTags.join(","))}`;
}
