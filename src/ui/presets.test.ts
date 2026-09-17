import { describe, expect, it } from "vitest";
import { compareMachines } from "../engine";
import { presets } from "./presets";

describe("preset sample strings", () => {
  it.each(presets)("$name samples match the NFA language", (preset) => {
    for (const input of preset.samples.accept) {
      const result = compareMachines(preset.nfa, input);
      expect(result.equivalent, `accept ${input}`).toBe(true);
      expect(result.nfaTrace.accepted, `accept ${input}`).toBe(true);
    }
    for (const input of preset.samples.reject) {
      const result = compareMachines(preset.nfa, input);
      expect(result.equivalent, `reject ${input}`).toBe(true);
      expect(result.nfaTrace.accepted, `reject ${input}`).toBe(false);
    }
  });
});
