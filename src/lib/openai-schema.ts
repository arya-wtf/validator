export const ANALYSIS_JSON_SCHEMA = {
  name: "analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["summary_table", "ideas", "ranking", "next_steps", "constraints_flagged"],
    properties: {
      summary_table: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["num", "idea_short", "buyer", "core_pain", "speed_to_revenue", "founder_fit"],
          properties: {
            num: { type: "integer" },
            idea_short: { type: "string" },
            buyer: { type: "string" },
            core_pain: { type: "string" },
            speed_to_revenue: { type: "string" },
            founder_fit: { type: "string", enum: ["High", "Medium", "Low"] },
          },
        },
      },
      ideas: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "num",
            "name",
            "hypothesis",
            "assumed_buyer",
            "assumed_pain",
            "assumed_pricing",
            "distribution_hypothesis",
            "strongest_assumption",
            "weakest_assumption",
            "gate3_test",
            "kill_signals",
            "founder_fit_notes",
          ],
          properties: {
            num: { type: "integer" },
            name: { type: "string" },
            hypothesis: { type: "string" },
            assumed_buyer: { type: "string" },
            assumed_pain: { type: "string" },
            assumed_pricing: { type: "string" },
            distribution_hypothesis: { type: "string" },
            strongest_assumption: { type: "string" },
            weakest_assumption: { type: "string" },
            gate3_test: { type: "string" },
            kill_signals: { type: "array", items: { type: "string" } },
            founder_fit_notes: { type: "string" },
          },
        },
      },
      ranking: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["num", "verdict", "reasoning"],
          properties: {
            num: { type: "integer" },
            verdict: {
              type: "string",
              enum: ["PROCEED FIRST", "PROCEED IF X FAILS", "PARK", "KILL"],
            },
            reasoning: { type: "string" },
          },
        },
      },
      next_steps: {
        type: "object",
        additionalProperties: false,
        required: ["this_week", "this_month", "open_question"],
        properties: {
          this_week: { type: "string" },
          this_month: { type: "string" },
          open_question: { type: "string" },
        },
      },
      constraints_flagged: {
        type: "array",
        items: { type: "string" },
      },
    },
  },
} as const;
