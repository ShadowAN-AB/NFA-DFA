import type { Edge, Node } from "@xyflow/react";
import type { DFA, NFA } from "../engine";

interface GraphOptions {
  highlight?: string;
  prefix: string;
}

export function automatonToFlow(
  automaton: NFA | DFA,
  options: GraphOptions,
): { nodes: Node[]; edges: Edge[] } {
  const { prefix, highlight } = options;
  const count = automaton.states.length || 1;

  const nodes: Node[] = automaton.states.map((state, index) => {
    const angle = (2 * Math.PI * index) / count - Math.PI / 2;
    const radius = count <= 3 ? 110 : 130;
    return {
      id: `${prefix}:${state}`,
      position: {
        x: 170 + Math.cos(angle) * radius,
        y: 140 + Math.sin(angle) * radius,
      },
      data: {
        label: state,
        start: state === automaton.start,
        accept: automaton.accept.includes(state),
        highlight: state === highlight,
      },
      type: "automaton",
      draggable: true,
    };
  });

  const grouped = new Map<string, string[]>();
  for (const from of automaton.states) {
    const row = automaton.delta[from] ?? {};
    for (const [symbol, raw] of Object.entries(row)) {
      const targets = Array.isArray(raw) ? raw : raw ? [raw] : [];
      for (const to of targets) {
        const key = `${from}=>${to}`;
        const symbols = grouped.get(key) ?? [];
        symbols.push(symbol);
        grouped.set(key, symbols);
      }
    }
  }

  const edges: Edge[] = [...grouped.entries()].map(([key, symbols]) => {
    const [from, to] = key.split("=>");
    return {
      id: `${prefix}:${from}-${symbols.join("|")}-${to}`,
      source: `${prefix}:${from}`,
      target: `${prefix}:${to}`,
      label: symbols.join(", "),
      markerEnd: { type: "arrowclosed" },
    };
  });

  return { nodes, edges };
}
