export interface SummaryRow {
  num: number;
  idea_short: string;
  buyer: string;
  core_pain: string;
  speed_to_revenue: string;
  founder_fit: "High" | "Medium" | "Low";
}

export interface IdeaAnalysis {
  num: number;
  name: string;
  hypothesis: string;
  assumed_buyer: string;
  assumed_pain: string;
  assumed_pricing: string;
  distribution_hypothesis: string;
  strongest_assumption: string;
  weakest_assumption: string;
  gate3_test: string;
  kill_signals: string[];
  founder_fit_notes: string;
}

export type Verdict = "PROCEED FIRST" | "PROCEED IF X FAILS" | "PARK" | "KILL";

export interface RankingItem {
  num: number;
  verdict: Verdict;
  reasoning: string;
}

export interface NextSteps {
  this_week: string;
  this_month: string;
  open_question: string;
}

export interface Analysis {
  summary_table: SummaryRow[];
  ideas: IdeaAnalysis[];
  ranking: RankingItem[];
  next_steps: NextSteps;
  constraints_flagged: string[];
}

export interface Run {
  slug: string;
  timestamp: number;
  created_at_iso: string;
  title: string;
  ideas_input: string;
  operator_context: string;
  author?: "arya" | "dewi";
  analysis: Analysis;
}
