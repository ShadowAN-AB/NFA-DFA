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

  it("marks highlight and target states", () => {
    const { nodes } = automatonToFlow(endsWithAb, {
      prefix: "nfa",
      highlight: "q0",
      target: "q2",
    });
    const data = Object.fromEntries(nodes.map((node) => [node.id, node.data]));
    expect(data["nfa:q0"]).toMatchObject({ highlight: true, target: false });
    expect(data["nfa:q2"]).toMatchObject({ highlight: false, target: true });
  });
});
