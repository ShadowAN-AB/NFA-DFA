import { describe, expect, it } from "vitest";
import { endsWithAb } from "../engine";
import { automatonToFlow } from "./graphModel";

describe("automatonToFlow", () => {
  it("creates one node per state and merges multi-symbol edges", () => {
    const { nodes, edges } = automatonToFlow(endsWithAb, { prefix: "nfa" });
    expect(nodes.map((node) => node.id)).toEqual(["nfa:q0", "nfa:q1", "nfa:q2"]);
    const q0Loop = edges.find((edge) => edge.source === "nfa:q0" && edge.target === "nfa:q0");
    expect(q0Loop?.label).toContain("a");
    expect(q0Loop?.label).toContain("b");
  });
});
