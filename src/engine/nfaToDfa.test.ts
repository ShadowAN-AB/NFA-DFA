import { describe, expect, it } from "vitest";
import { endsWithAb } from "./fixtures";
import { nfaToDfa } from "./nfaToDfa";
import type { NFA } from "./types";

describe("nfaToDfa", () => {
  it("converts the ends-with-ab NFA to the expected DFA", () => {
    const { dfa } = nfaToDfa(endsWithAb);

    expect(dfa.start).toBe("{q0}");
    expect(dfa.states).toEqual(expect.arrayContaining(["{q0}", "{q0,q1}", "{q0,q2}"]));
    expect(dfa.accept).toEqual(["{q0,q2}"]);
    expect(dfa.delta["{q0}"]).toEqual({ a: "{q0,q1}", b: "{q0}" });
    expect(dfa.delta["{q0,q1}"]).toEqual({ a: "{q0,q1}", b: "{q0,q2}" });
    expect(dfa.delta["{q0,q2}"]).toEqual({ a: "{q0,q1}", b: "{q0}" });
    expect(dfa.states).not.toContain("∅");
  });

  it("records a step for every subset and symbol", () => {
    const { steps } = nfaToDfa(endsWithAb);
    expect(steps).toHaveLength(6);
    expect(steps[0]).toMatchObject({
      currentLabel: "{q0}",
      symbol: "a",
      resultLabel: "{q0,q1}",
      isNewState: true,
    });
    expect(steps[3]).toMatchObject({
      currentLabel: "{q0,q1}",
      symbol: "b",
      unionResult: ["q0", "q2"],
      resultLabel: "{q0,q2}",
    });
  });

  it("adds a sink when a transition is missing", () => {
    const onlyA: NFA = {
      states: ["q0", "q1"],
      alphabet: ["a", "b"],
      start: "q0",
      accept: ["q1"],
      delta: {
        q0: { a: ["q1"] },
        q1: {},
      },
    };

    const { dfa, warnings } = nfaToDfa(onlyA);
    expect(dfa.states).toContain("∅");
    expect(dfa.delta["{q0}"]?.b).toBe("∅");
    expect(dfa.delta["∅"]).toEqual({ a: "∅", b: "∅" });
    expect(dfa.accept).toEqual(["{q1}"]);
    expect(warnings.some((warning) => warning.includes("Sink"))).toBe(true);
  });

  it("keeps an already deterministic NFA as a DFA with the same reachable states", () => {
    const alreadyDfa: NFA = {
      states: ["q0", "q1"],
      alphabet: ["a"],
      start: "q0",
      accept: ["q1"],
      delta: {
        q0: { a: ["q1"] },
        q1: { a: ["q1"] },
      },
    };

    const { dfa } = nfaToDfa(alreadyDfa);
    expect(dfa.states).toEqual(["{q0}", "{q1}"]);
    expect(dfa.delta["{q0}"]?.a).toBe("{q1}");
    expect(dfa.delta["{q1}"]?.a).toBe("{q1}");
  });

  it("rejects an invalid NFA before converting", () => {
    expect(() =>
      nfaToDfa({
        ...endsWithAb,
        start: "missing",
      }),
    ).toThrow(/missing/);
  });
});
