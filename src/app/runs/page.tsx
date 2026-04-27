import Link from "next/link";
import { getAllRuns } from "@/lib/runs";
import { FileText } from "lucide-react";

// Force this page to revalidate often (in case new runs are added)
export const revalidate = 60;

export default function RunsPage() {
  const runs = getAllRuns();

  return (
    <>
      <div className="mb-8">
        <div className="text-[11px] tracking-[2px] opacity-60 mb-2">SAVED RUNS</div>
        <h1 className="font-serif text-4xl font-semibold leading-tight">
          {runs.length} run{runs.length === 1 ? "" : "s"} on disk
        </h1>
        <p className="text-sm opacity-70 mt-2 max-w-[700px]">
          Each run lives as a markdown file in <code className="bg-gray-100 px-1.5 py-0.5">content/runs/</code>. You and Dewi can edit them directly in GitHub or push new ones manually.
        </p>
      </div>

      {runs.length === 0 ? (
        <div className="text-center py-20 opacity-50">
          <FileText size={32} className="mx-auto mb-4" />
          <div className="font-serif text-lg">No runs saved yet.</div>
          <div className="text-[13px] mt-2">
            Run an analysis on the home page, then click <strong>SAVE TO GITHUB</strong>.
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {runs.map((run) => (
            <Link
              key={run.slug}
              href={`/runs/${run.slug}`}
              className="border border-ink p-4 bg-white flex justify-between items-center gap-4 no-underline text-ink hover:bg-gray-50 transition"
            >
              <div className="flex-1">
                <div className="font-serif text-base font-medium mb-1">{run.title}</div>
                <div className="text-[11px] opacity-50">
                  {run.created_at_iso ? new Date(run.created_at_iso).toLocaleString() : "—"}
                  {" · "}
                  {run.analysis?.ideas?.length || 0} ideas
                  {run.author ? ` · by ${run.author}` : ""}
                </div>
              </div>
              <div className="text-[11px] tracking-[1.5px] opacity-60">OPEN →</div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
