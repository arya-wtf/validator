import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Run, Analysis } from "@/types/analysis";

const RUNS_DIR = path.join(process.cwd(), "content", "runs");

/**
 * Reads all .md files in /content/runs/ and parses them into Run objects.
 * Each .md file has frontmatter with metadata + a JSON code block with the analysis.
 *
 * Format:
 *   ---
 *   slug: my-run
 *   timestamp: 1730000000000
 *   created_at_iso: 2026-04-27T10:00:00Z
 *   title: 4 SaaS ideas
 *   ---
 *
 *   ## Ideas Input
 *   1. Idea one
 *   2. Idea two
 *
 *   ## Operator Context
 *   ...
 *
 *   ## Analysis JSON
 *   ```json
 *   { ...full Analysis object... }
 *   ```
 */
export function getAllRuns(): Run[] {
  if (!fs.existsSync(RUNS_DIR)) {
    return [];
  }

  const files = fs
    .readdirSync(RUNS_DIR)
    .filter((f) => f.endsWith(".md"));

  const runs: Run[] = [];

  for (const file of files) {
    try {
      const filepath = path.join(RUNS_DIR, file);
      const raw = fs.readFileSync(filepath, "utf8");
      const { data, content } = matter(raw);

      // Extract JSON block
      const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
      if (!jsonMatch) {
        console.warn(`Run ${file}: missing JSON block, skipping`);
        continue;
      }
      const analysis: Analysis = JSON.parse(jsonMatch[1]);

      // Extract Ideas Input section
      const ideasMatch = content.match(/## Ideas Input\s*([\s\S]*?)(?=\n##|\n```)/);
      const ideas_input = ideasMatch ? ideasMatch[1].trim() : "";

      // Extract Operator Context section
      const ctxMatch = content.match(/## Operator Context\s*([\s\S]*?)(?=\n##|\n```)/);
      const operator_context = ctxMatch ? ctxMatch[1].trim() : "";

      const author =
        data.author === "arya" || data.author === "dewi" ? data.author : undefined;

      runs.push({
        slug: data.slug || file.replace(/\.md$/, ""),
        timestamp: data.timestamp || 0,
        created_at_iso: data.created_at_iso || "",
        title: data.title || "Untitled run",
        ideas_input,
        operator_context,
        author,
        analysis,
      });
    } catch (e) {
      console.error(`Failed to parse run ${file}:`, e);
    }
  }

  // Sort newest first
  runs.sort((a, b) => b.timestamp - a.timestamp);
  return runs;
}

export function getRunBySlug(slug: string): Run | null {
  const runs = getAllRuns();
  return runs.find((r) => r.slug === slug) || null;
}
