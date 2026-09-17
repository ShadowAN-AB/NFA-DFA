import { describe, expect, it } from "vitest";
import type { ConversionStep } from "../engine";
import { explainStep } from "./explainStep";

const sample: ConversionStep = {
  step: 1,
  currentSubset: ["q0"],
  currentLabel: "{q0}",
  symbol: "a",
  contributions: [{ from: "q0", targets: ["q0", "q1"] }],
  unionResult: ["q0", "q1"],
  resultLabel: "{q0,q1}",
  isNewState: true,
};

describe("explainStep", () => {
  it("describes a new subset in spoken English", () => {
    const text = explainStep(sample);
    expect(text).toContain("From {q0} on symbol a");
    expect(text).toContain("{q0,q1}");
    expect(text).toContain("worklist");
  });

  it("says when a subset is already known", () => {
    const text = explainStep({ ...sample, isNewState: false, unionResult: [] , resultLabel: "∅" });
    expect(text).toContain("∅");
    expect(text).toContain("already discovered");
  });
});
