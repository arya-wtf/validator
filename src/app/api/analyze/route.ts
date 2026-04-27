import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { SYSTEM_PROMPT, ITERATION_PROMPT } from "@/lib/prompts";
import { ANALYSIS_JSON_SCHEMA } from "@/lib/openai-schema";
import { getOperatorContext } from "@/lib/operators";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";
import type { Analysis } from "@/types/analysis";

export const runtime = "nodejs";
export const maxDuration = 60;

interface AnalyzeRequest {
  ideas_input?: string;
  previous_analysis?: Analysis;
  iteration_feedback?: string;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const authSecret = process.env.AUTH_SECRET;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured on server" },
        { status: 500 },
      );
    }
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

    const body: AnalyzeRequest = await req.json();
    const { ideas_input, previous_analysis, iteration_feedback } = body;

    if (!ideas_input?.trim() && !iteration_feedback?.trim()) {
      return NextResponse.json(
        { error: "Provide ideas_input (new analysis) or iteration_feedback (iteration)" },
        { status: 400 },
      );
    }

    const operator = getOperatorContext(username);
    const operator_context = operator.content;

    const isIteration = !!previous_analysis && !!iteration_feedback;
    const systemPrompt = isIteration ? ITERATION_PROMPT : SYSTEM_PROMPT;

    let userMessage: string;
    if (isIteration) {
      userMessage = `${operator_context ? `Operator context:\n${operator_context}\n\n` : ""}Previous analysis:\n${JSON.stringify(previous_analysis, null, 2)}\n\nUser feedback / iteration request:\n${iteration_feedback}`;
    } else {
      userMessage = operator_context
        ? `Operator context:\n${operator_context}\n\nIdeas to validate:\n${ideas_input}`
        : `Ideas to validate:\n${ideas_input}`;
    }

    const client = new OpenAI({ apiKey });
    const response = await client.chat.completions.create({
      model: "gpt-5.4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: {
        type: "json_schema",
        json_schema: ANALYSIS_JSON_SCHEMA,
      },
    });

    const choice = response.choices[0];
    if (choice?.message?.refusal) {
      return NextResponse.json(
        { error: `Model refused: ${choice.message.refusal}` },
        { status: 502 },
      );
    }

    const content = choice?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Empty response from model" }, { status: 502 });
    }

    let analysis: Analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "Model returned non-JSON output", raw: content },
        { status: 502 },
      );
    }

    return NextResponse.json({
      analysis,
      operator_context_loaded: operator.exists,
      operator_context_path: operator.relativePath,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
