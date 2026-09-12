import { describe, expect, it } from "vitest";
import { endsWithAb } from "./fixtures";
import { validateNfa } from "./validateNfa";

describe("validateNfa", () => {
  it("accepts the canonical ends-with-ab NFA", () => {
    expect(validateNfa(endsWithAb)).toEqual([]);
  });

  it("rejects an empty state set", () => {
    const issues = validateNfa({
      ...endsWithAb,
      states: [],
    });
    expect(issues.some((issue) => issue.field === "states")).toBe(true);
  });

  it("rejects a start state outside Q", () => {
    const issues = validateNfa({
      ...endsWithAb,
      start: "q9",
    });
    expect(issues[0]?.message).toContain("q9");
  });

  it("rejects an accept state outside Q", () => {
    const issues = validateNfa({
      ...endsWithAb,
      accept: ["qf"],
    });
    expect(issues.some((issue) => issue.field === "accept")).toBe(true);
  });

  it("rejects epsilon as an alphabet symbol", () => {
    const issues = validateNfa({
      ...endsWithAb,
      alphabet: ["a", "ε"],
    });
    expect(issues.some((issue) => issue.message.toLowerCase().includes("epsilon"))).toBe(true);
  });

  it("rejects a transition on an unknown symbol", () => {
    const issues = validateNfa({
      ...endsWithAb,
      delta: {
        ...endsWithAb.delta,
        q0: { a: ["q0"], c: ["q1"] },
      },
    });
    expect(issues.some((issue) => issue.message.includes('"c"'))).toBe(true);
  });

  it("rejects a transition to an unknown target", () => {
    const issues = validateNfa({
      ...endsWithAb,
      delta: {
        ...endsWithAb.delta,
        q1: { b: ["q9"] },
      },
    });
    expect(issues.some((issue) => issue.message.includes("q9"))).toBe(true);
  });
});
