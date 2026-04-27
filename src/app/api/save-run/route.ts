import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { commitRunFile } from "@/lib/github";
import { generateRunMarkdown, generateSlug } from "@/lib/markdown";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";
import { getOperatorContext } from "@/lib/operators";
import type { Run, Analysis } from "@/types/analysis";

export const runtime = "nodejs";
export const maxDuration = 30;

interface SaveRunRequest {
  ideas_input: string;
  analysis: Analysis;
  title?: string;
}

export async function POST(req: NextRequest) {
  try {
    const authSecret = process.env.AUTH_SECRET;
    if (!authSecret) {
      return NextResponse.json(
        { error: "AUTH_SECRET not configured on server" },
        { status: 500 },
      );
    }

    const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
    const username = await verifySession(token, authSecret);
    if (!username) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body: SaveRunRequest = await req.json();
    const { ideas_input, analysis } = body;

    if (!analysis || !ideas_input) {
      return NextResponse.json(
        { error: "Missing required fields: ideas_input, analysis" },
        { status: 400 },
      );
    }

    const operator = getOperatorContext(username);
    const timestamp = Date.now();
    const created_at_iso = new Date(timestamp).toISOString();
    const fallbackTitle =
      analysis.summary_table?.[0]?.idea_short?.slice(0, 50) ||
      `Run ${new Date(timestamp).toLocaleDateString()}`;
    const title = body.title || fallbackTitle;
    const slug = generateSlug(title, timestamp);

    const run: Run = {
      slug,
      timestamp,
      created_at_iso,
      title,
      ideas_input,
      operator_context: operator.content,
      author: username,
      analysis,
    };

    const md = generateRunMarkdown(run);
    const filename = `${slug}.md`;

    await commitRunFile(filename, md, username);

    return NextResponse.json({
      success: true,
      slug,
      filename,
      message: "Run committed to GitHub. Vercel will rebuild in ~30 seconds.",
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
