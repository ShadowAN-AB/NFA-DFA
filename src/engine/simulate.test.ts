import { describe, expect, it } from "vitest";
import { endsWithAb } from "./fixtures";
import { nfaToDfa } from "./nfaToDfa";
import { compareMachines, runDfa, runNfa } from "./simulate";

const accepting = ["ab", "aab", "bab", "aaab", "abab"];
const rejecting = ["", "a", "b", "ba", "aabb", "bb", "aba"];

describe("runNfa", () => {
  it.each(accepting)("accepts %s on the ends-with-ab NFA", (input) => {
    const trace = runNfa(endsWithAb, input);
    expect(trace.accepted).toBe(true);
    expect(trace.path.at(-1)).toBe("q2");
  });

  it.each(rejecting)("rejects %s on the ends-with-ab NFA", (input) => {
    expect(runNfa(endsWithAb, input).accepted).toBe(false);
  });

  it("rejects a symbol outside the alphabet", () => {
    const trace = runNfa(endsWithAb, "ac");
    expect(trace.accepted).toBe(false);
    expect(trace.detail).toContain("c");
  });
});

describe("runDfa", () => {
  const { dfa } = nfaToDfa(endsWithAb);

  it("follows the unique path for aab and accepts", () => {
    const trace = runDfa(dfa, "aab");
    expect(trace.accepted).toBe(true);
    expect(trace.path).toEqual(["{q0}", "{q0,q1}", "{q0,q1}", "{q0,q2}"]);
  });

  it("rejects aabb", () => {
    const trace = runDfa(dfa, "aabb");
    expect(trace.accepted).toBe(false);
    expect(trace.path.at(-1)).toBe("{q0}");
  });
});

describe("compareMachines", () => {
  it("agrees on every fixture string", () => {
    for (const input of [...accepting, ...rejecting]) {
      const result = compareMachines(endsWithAb, input);
      expect(result.equivalent, input).toBe(true);
      expect(result.nfaTrace.accepted, input).toBe(accepting.includes(input));
    }
  });
});
