import { describe, expect, it } from "vitest";
import { endsWithAb } from "../engine";
import { nfaToDraft, parseDraft } from "./parseDraft";

describe("parseDraft", () => {
  it("round-trips the canonical NFA", () => {
    const parsed = parseDraft(nfaToDraft(endsWithAb));
    expect(parsed.issues).toEqual([]);
    expect(parsed.nfa?.start).toBe("q0");
    expect(parsed.nfa?.delta.q0?.a).toEqual(["q0", "q1"]);
    expect(parsed.nfa?.delta.q1?.b).toEqual(["q2"]);
  });

  it("returns validation issues for a bad start state", () => {
    const parsed = parseDraft({
      states: "q0, q1",
      alphabet: "a",
      start: "q9",
      accept: "q1",
      transitions: [{ from: "q0", symbol: "a", to: "q1" }],
    });
    expect(parsed.nfa).toBeUndefined();
    expect(parsed.issues[0]?.field).toBe("start");
  });
});
