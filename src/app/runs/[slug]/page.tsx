import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllRuns, getRunBySlug } from "@/lib/runs";
import ResultsView from "@/components/ResultsView";

export const revalidate = 60;

// Pre-generate static pages for all runs at build time
export function generateStaticParams() {
  const runs = getAllRuns();
  return runs.map((r) => ({ slug: r.slug }));
}

export default async function RunPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const run = getRunBySlug(slug);
  if (!run) notFound();

  return (
    <>
      <div className="mb-8">
        <Link href="/runs" className="text-[11px] tracking-[1.5px] opacity-60 no-underline text-ink hover:opacity-100">
          ← ALL RUNS
        </Link>
        <div className="text-[11px] tracking-[2px] opacity-60 mt-4 mb-2">RUN</div>
        <h1 className="font-serif text-3xl font-semibold leading-tight">{run.title}</h1>
        <div className="text-[11px] opacity-50 mt-2">
          {run.created_at_iso ? new Date(run.created_at_iso).toLocaleString() : "—"}
          {" · "}slug: <code className="bg-gray-100 px-1.5 py-0.5">{run.slug}.md</code>
        </div>
      </div>

      {run.ideas_input && (
        <div className="mb-10 p-5 bg-white border border-gray-300">
          <div className="text-[10px] tracking-[2px] opacity-60 mb-2">IDEAS INPUT</div>
          <pre className="text-[13px] leading-relaxed whitespace-pre-wrap font-mono">{run.ideas_input}</pre>
        </div>
      )}

      <ResultsView analysis={run.analysis} />
    </>
  );
}
