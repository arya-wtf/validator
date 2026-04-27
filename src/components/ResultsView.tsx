import type { Analysis } from "@/types/analysis";

export default function ResultsView({ analysis }: { analysis: Analysis }) {
  return (
    <>
      <Section num="01" title="Summary">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-ink">
                {["#", "Idea", "Buyer", "Core pain", "Speed", "Fit"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-[10px] tracking-[1.5px] opacity-60 font-medium">
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analysis.summary_table?.map((r, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-3 px-3 font-semibold">{r.num}</td>
                  <td className="py-3 px-3">{r.idea_short}</td>
                  <td className="py-3 px-3 opacity-80">{r.buyer}</td>
                  <td className="py-3 px-3 opacity-80">{r.core_pain}</td>
                  <td className="py-3 px-3 whitespace-nowrap">{r.speed_to_revenue}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] tracking-[1px] ${
                        r.founder_fit === "High"
                          ? "bg-green-100 text-green-700"
                          : r.founder_fit === "Medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {r.founder_fit?.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section num="02" title="Per-idea analysis">
        <div className="flex flex-col gap-6">
          {analysis.ideas?.map((idea) => (
            <div key={idea.num} className="border border-ink bg-white">
              <div className="px-5 py-4 bg-ink text-paper">
                <div className="text-[10px] tracking-[2px] opacity-60">IDEA #{idea.num}</div>
                <div className="font-serif text-lg font-semibold mt-0.5">{idea.name}</div>
              </div>
              <div className="p-5">
                <Field label="Hypothesis" value={idea.hypothesis} bold />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mt-4">
                  <Field label="Assumed buyer" value={idea.assumed_buyer} />
                  <Field label="Assumed pain" value={idea.assumed_pain} />
                  <Field label="Assumed pricing" value={idea.assumed_pricing} />
                  <Field label="Distribution" value={idea.distribution_hypothesis} />
                  <Field label="Strongest assumption" value={idea.strongest_assumption} />
                  <Field label="Weakest assumption" value={idea.weakest_assumption} />
                </div>
                <div className="mt-4 p-3 bg-[#f5f5f0] border-l-[3px] border-ink">
                  <div className="text-[10px] tracking-[1.5px] opacity-60 mb-1">SUGGESTED GATE 3 TEST</div>
                  <div className="text-[13px]">{idea.gate3_test}</div>
                </div>
                <div className="mt-4">
                  <div className="text-[10px] tracking-[1.5px] opacity-60 mb-2">KILL SIGNALS</div>
                  <ul className="m-0 pl-5 text-[13px] leading-relaxed">
                    {idea.kill_signals?.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="mt-4 text-xs opacity-70 italic">{idea.founder_fit_notes}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section num="03" title="Ranking">
        <div className="flex flex-col gap-3">
          {analysis.ranking?.map((r) => {
            const c = verdictColor(r.verdict);
            return (
              <div key={r.num} className={`flex gap-4 p-4 ${c.bg} border-l-[3px] ${c.border}`}>
                <div className={`text-2xl font-semibold ${c.text} min-w-[40px]`}>#{r.num}</div>
                <div className="flex-1">
                  <div className={`text-[11px] tracking-[1.5px] font-semibold ${c.text} mb-1`}>{r.verdict}</div>
                  <div className="text-[13px] leading-relaxed text-ink">{r.reasoning}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section num="04" title="What to do next">
        <div className="flex flex-col gap-3">
          <NextStep label="THIS WEEK" value={analysis.next_steps?.this_week} />
          <NextStep label="THIS MONTH" value={analysis.next_steps?.this_month} />
          <NextStep label="OPEN QUESTION (HUMAN JUDGMENT)" value={analysis.next_steps?.open_question} />
        </div>
      </Section>

      {analysis.constraints_flagged?.length > 0 && (
        <Section num="--" title="Constraints flagged">
          <ul className="m-0 pl-5 text-[13px] leading-relaxed opacity-70">
            {analysis.constraints_flagged.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </Section>
      )}
    </>
  );
}

function verdictColor(v: string) {
  if (v?.includes("PROCEED FIRST")) return { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" };
  if (v?.includes("PROCEED IF")) return { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" };
  if (v?.includes("PARK")) return { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" };
  if (v?.includes("KILL")) return { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" };
  return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" };
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <div className="flex items-baseline gap-4 mb-4 pb-2 border-b border-ink">
        <div className="text-[11px] tracking-[2px] opacity-50">{num}</div>
        <div className="font-serif text-2xl font-semibold">{title}</div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div>
      <div className="text-[10px] tracking-[1.5px] opacity-60 mb-1">{label.toUpperCase()}</div>
      <div className={`text-[13px] leading-relaxed ${bold ? "font-medium" : ""}`}>{value}</div>
    </div>
  );
}

function NextStep({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 border border-ink">
      <div className="text-[10px] tracking-[2px] opacity-60 mb-1.5">{label}</div>
      <div className="text-sm leading-relaxed">{value}</div>
    </div>
  );
}
