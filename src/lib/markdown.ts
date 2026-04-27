import type { Run, Analysis } from "@/types/analysis";

export function generateRunMarkdown(run: Omit<Run, "slug"> & { slug: string }): string {
  const authorLine = run.author ? `\nauthor: ${run.author}` : "";
  const frontmatter = `---
slug: ${run.slug}
timestamp: ${run.timestamp}
created_at_iso: ${run.created_at_iso}
title: ${JSON.stringify(run.title)}${authorLine}
---`;

  const ideas = `## Ideas Input

${run.ideas_input}`;

  const ctx = run.operator_context
    ? `\n\n## Operator Context\n\n${run.operator_context}`
    : "";

  const summary = formatSummary(run.analysis);
  const perIdea = formatPerIdea(run.analysis);
  const ranking = formatRanking(run.analysis);
  const nextSteps = formatNextSteps(run.analysis);
  const constraints = formatConstraints(run.analysis);

  // The JSON block at the end is the canonical source of truth
  // The human-readable sections above are for git diff readability
  const json = `\n\n## Analysis JSON\n\n\`\`\`json\n${JSON.stringify(run.analysis, null, 2)}\n\`\`\``;

  return `${frontmatter}\n\n${ideas}${ctx}\n\n${summary}\n\n${perIdea}\n\n${ranking}\n\n${nextSteps}${constraints}${json}\n`;
}

function formatSummary(a: Analysis): string {
  let out = `## Summary\n\n| # | Idea | Buyer | Core pain | Speed | Fit |\n|---|---|---|---|---|---|\n`;
  for (const r of a.summary_table || []) {
    out += `| ${r.num} | ${r.idea_short} | ${r.buyer} | ${r.core_pain} | ${r.speed_to_revenue} | ${r.founder_fit} |\n`;
  }
  return out;
}

function formatPerIdea(a: Analysis): string {
  let out = `## Per-idea analysis\n`;
  for (const idea of a.ideas || []) {
    out += `\n### Idea #${idea.num}: ${idea.name}\n\n`;
    out += `**Hypothesis:** ${idea.hypothesis}\n\n`;
    out += `**Assumed buyer:** ${idea.assumed_buyer}\n\n`;
    out += `**Assumed pain:** ${idea.assumed_pain}\n\n`;
    out += `**Assumed pricing:** ${idea.assumed_pricing}\n\n`;
    out += `**Distribution hypothesis:** ${idea.distribution_hypothesis}\n\n`;
    out += `**Strongest assumption:** ${idea.strongest_assumption}\n\n`;
    out += `**Weakest assumption:** ${idea.weakest_assumption}\n\n`;
    out += `**Suggested Gate 3 test:** ${idea.gate3_test}\n\n`;
    out += `**Kill signals:**\n`;
    for (const s of idea.kill_signals || []) out += `- ${s}\n`;
    out += `\n**Founder-fit notes:** ${idea.founder_fit_notes}\n`;
  }
  return out;
}

function formatRanking(a: Analysis): string {
  let out = `## Ranking\n`;
  for (const r of a.ranking || []) {
    out += `\n**Idea #${r.num} — ${r.verdict}**\n${r.reasoning}\n`;
  }
  return out;
}

function formatNextSteps(a: Analysis): string {
  if (!a.next_steps) return "";
  return `## What to do next

- **This week:** ${a.next_steps.this_week}
- **This month:** ${a.next_steps.this_month}
- **Open question:** ${a.next_steps.open_question}`;
}

function formatConstraints(a: Analysis): string {
  if (!a.constraints_flagged?.length) return "";
  let out = `\n\n## Constraints flagged\n\n`;
  for (const c of a.constraints_flagged) out += `- ${c}\n`;
  return out;
}

export function generateSlug(title: string, timestamp: number): string {
  const date = new Date(timestamp);
  const dateStr = date.toISOString().slice(0, 10);
  const slugified = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${dateStr}-${slugified}`;
}
