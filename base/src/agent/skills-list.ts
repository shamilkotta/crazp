import type { Workspace } from "@cloudflare/shell";

export type SkillEntry = {
  name: string;
  description: string;
  path: string;
  bytes: number;
  updatedAt: number;
};

const SKILLS_GLOB = "skills/*.md";

export async function listWorkspaceSkills(
  workspace: Workspace
): Promise<SkillEntry[]> {
  const matches = await workspace.glob(SKILLS_GLOB).catch(() => []);
  const entries: SkillEntry[] = [];
  for (const info of matches) {
    const content = await workspace.readFile(info.path).catch(() => null);
    if (content == null) continue;
    const frontmatter = parseFrontmatter(content);
    if (!frontmatter) continue;
    entries.push({
      name: frontmatter.name,
      description: frontmatter.description,
      path: info.path.replace(/^\/+/, ""),
      bytes: info.size,
      updatedAt: info.updatedAt
    });
  }
  entries.sort((a, b) => a.name.localeCompare(b.name, "en"));
  return entries;
}

function parseFrontmatter(
  content: string
): { name: string; description: string } | null {
  const match = /^---\n([\s\S]*?)\n---/.exec(content);
  if (!match) return null;
  const block = match[1];
  const name = /^name:\s*(.+)$/m.exec(block)?.[1]?.trim();
  const description = /^description:\s*(.+)$/m.exec(block)?.[1]?.trim();
  if (!name || !description) return null;
  return { name, description };
}
