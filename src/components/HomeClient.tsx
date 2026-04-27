"use client";

import { useState, useEffect } from "react";
import { Send, Save, Copy, Check, Loader2, AlertCircle, ChevronRight, X } from "lucide-react";
import type { Analysis } from "@/types/analysis";
import ResultsView from "@/components/ResultsView";

export interface OperatorStatus {
  username: string;
  exists: boolean;
  relativePath: string;
  githubUrl: string | null;
}

export default function HomeClient({ operator }: { operator: OperatorStatus }) {
  const [view, setView] = useState<"input" | "analyzing" | "results">("input");
  const [ideasInput, setIdeasInput] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [iterationInput, setIterationInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  async function runAnalysis() {
    if (!ideasInput.trim()) {
      setError("Add at least 3 ideas to analyze.");
      return;
    }
    setError(null);
    setView("analyzing");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideas_input: ideasInput }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `API error ${res.status}`);
      }
      const j = await res.json();
      setAnalysis(j.analysis);
      setView("results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
      setView("input");
    }
  }

  async function runIteration() {
    if (!iterationInput.trim() || !analysis) return;
    setError(null);
    setView("analyzing");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideas_input: ideasInput,
          previous_analysis: analysis,
          iteration_feedback: iterationInput,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `API error ${res.status}`);
      }
      const j = await res.json();
      setAnalysis(j.analysis);
      setIterationInput("");
      setView("results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Iteration failed");
      setView("results");
    }
  }

  async function saveRunToGithub() {
    if (!analysis) return;
    setSaving(true);
    setError(null);
    setSaveSuccess(null);
    try {
      const res = await fetch("/api/save-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideas_input: ideasInput,
          analysis,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Save failed ${res.status}`);
      }
      const j = await res.json();
      setSaveSuccess(j.message || "Saved to GitHub.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function copyMarkdown() {
    if (!analysis) return;
    const md = await import("@/lib/markdown").then((m) =>
      m.generateRunMarkdown({
        slug: "preview",
        timestamp: Date.now(),
        created_at_iso: new Date().toISOString(),
        title: "Preview run",
        ideas_input: ideasInput,
        operator_context: "",
        author: operator.username === "arya" || operator.username === "dewi" ? operator.username : undefined,
        analysis,
      }),
    );
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setError("Copy failed: " + (e instanceof Error ? e.message : ""));
    }
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-600 px-3 py-3 mb-6 text-[13px] flex gap-2 items-start">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-px" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="p-0">
            <X size={14} />
          </button>
        </div>
      )}

      {saveSuccess && (
        <div className="bg-green-50 border border-green-600 px-3 py-3 mb-6 text-[13px] flex gap-2 items-start">
          <Check size={16} className="text-green-600 flex-shrink-0 mt-px" />
          <span className="flex-1">{saveSuccess}</span>
          <button onClick={() => setSaveSuccess(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {view === "input" && (
        <InputView
          ideasInput={ideasInput}
          setIdeasInput={setIdeasInput}
          runAnalysis={runAnalysis}
          operator={operator}
        />
      )}

      {view === "analyzing" && <AnalyzingView />}

      {view === "results" && analysis && (
        <>
          <div className="flex gap-2 mb-8 pb-4 border-b border-gray-300">
            <button onClick={saveRunToGithub} disabled={saving} className={btnSecondary}>
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {saving ? " SAVING…" : " SAVE TO GITHUB"}
            </button>
            <button onClick={copyMarkdown} className={btnSecondary}>
              {copied ? (
                <>
                  <Check size={13} /> COPIED
                </>
              ) : (
                <>
                  <Copy size={13} /> COPY MARKDOWN
                </>
              )}
            </button>
            <button onClick={() => setView("input")} className={btnSecondary}>
              ← NEW RUN
            </button>
          </div>

          <ResultsView analysis={analysis} />

          <div className="mt-12 p-6 bg-ink text-paper">
            <div className="text-[10px] tracking-[2px] opacity-60 mb-2">ITERATE</div>
            <div className="font-serif text-lg font-medium mb-3">
              Push back. Add ideas. Change pricing. Test alternate buyers.
            </div>
            <textarea
              value={iterationInput}
              onChange={(e) => setIterationInput(e.target.value)}
              placeholder={`e.g. "Dewi disagrees with the buyer for idea #2 - she thinks it's solo PMs at SaaS startups, not technical founders. Re-run idea #2."`}
              className="w-full min-h-[100px] p-4 text-[13px] leading-relaxed bg-[#0a0a0a] text-paper border border-[#444] resize-y outline-none font-mono"
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={runIteration}
                disabled={!iterationInput.trim()}
                className={`bg-paper text-ink px-6 py-3 text-[11px] tracking-[2px] border-none flex items-center gap-2 ${
                  iterationInput.trim() ? "opacity-100" : "opacity-40"
                }`}
              >
                REGENERATE <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function InputView({
  ideasInput,
  setIdeasInput,
  runAnalysis,
  operator,
}: {
  ideasInput: string;
  setIdeasInput: (v: string) => void;
  runAnalysis: () => void;
  operator: OperatorStatus;
}) {
  return (
    <div>
      <div className="mb-8">
        <div className="text-[11px] tracking-[2px] opacity-60 mb-2">STEP 01 — INPUT</div>
        <h1 className="font-serif text-4xl font-semibold mb-3 leading-tight">
          Drop 3–5 ideas. <span className="opacity-50">One line each is enough.</span>
        </h1>
        <p className="text-sm opacity-70 max-w-[700px] leading-relaxed">
          The system generates buyer personas, pain hypotheses, distribution paths, pricing, and Gate 3 tests for each. Then it ranks them and tells you what to kill.
        </p>
      </div>

      <div
        className={`mb-4 p-3 text-xs flex justify-between items-center border ${
          operator.exists ? "bg-green-50 border-green-300" : "bg-amber-50 border-amber-400"
        }`}
      >
        <span>
          {operator.exists ? (
            <>
              ✓ Operator context loaded for <strong>{operator.username}</strong> from{" "}
              <code className="bg-white/60 px-1">{operator.relativePath}</code>
            </>
          ) : (
            <>
              ⚠ No operator context for <strong>{operator.username}</strong> — analysis will run without context. Create{" "}
              <code className="bg-white/60 px-1">{operator.relativePath}</code> to sharpen results.
            </>
          )}
        </span>
        {operator.githubUrl && (
          <a
            href={operator.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="border border-ink px-2.5 py-1 text-[11px] tracking-[1px] no-underline text-ink"
          >
            EDIT ON GITHUB →
          </a>
        )}
      </div>

      <textarea
        value={ideasInput}
        onChange={(e) => setIdeasInput(e.target.value)}
        placeholder={`1. A Notion-template marketplace for solopreneur SOPs\n2. AI stand-in PM that converts voice notes into Linear tickets\n3. Tool that auto-generates Webflow case studies from Notion docs\n4. Indonesian freelancer faktur pajak automation`}
        className="w-full min-h-[240px] p-5 text-sm leading-relaxed bg-white border border-ink resize-y outline-none font-mono"
      />

      <div className="mt-5 flex justify-between items-center">
        <div className="text-[11px] opacity-50">
          {ideasInput.split("\n").filter((l) => l.trim()).length} lines entered
        </div>
        <button
          onClick={runAnalysis}
          className="bg-ink text-paper px-7 py-3.5 text-xs tracking-[2px] border-none flex items-center gap-2.5"
        >
          ANALYZE <Send size={14} />
        </button>
      </div>
    </div>
  );
}

function AnalyzingView() {
  const phrases = [
    "Generating buyer personas",
    "Stress-testing distribution paths",
    "Calibrating pricing assumptions",
    "Drafting Gate 3 tests",
    "Ranking by founder fit",
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setIdx((p) => (p + 1) % phrases.length), 1500);
    return () => clearInterval(i);
  }, [phrases.length]);
  return (
    <div className="py-20 text-center">
      <Loader2 size={32} className="animate-spin mx-auto mb-6" />
      <div className="text-[11px] tracking-[2px] opacity-50 mb-2">WORKING</div>
      <div className="font-serif text-2xl font-medium">{phrases[idx]}…</div>
    </div>
  );
}

const btnSecondary =
  "bg-transparent border border-ink text-ink px-3.5 py-2 text-[11px] tracking-[1.5px] flex items-center gap-1.5";
