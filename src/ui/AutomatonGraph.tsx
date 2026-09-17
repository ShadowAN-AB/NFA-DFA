import { Background, Controls, ReactFlow } from "@xyflow/react";
import type { DFA, NFA } from "../engine";
import { AutomatonNode } from "./AutomatonNode";
import { automatonToFlow } from "./graphModel";

const nodeTypes = { automaton: AutomatonNode };

interface AutomatonGraphProps {
  title: string;
  automaton?: NFA | DFA;
  highlight?: string;
  target?: string;
  prefix: string;
  legend?: boolean;
}

export function AutomatonGraph({
  title,
  automaton,
  highlight,
  target,
  prefix,
  legend = false,
}: AutomatonGraphProps) {
  const graph = automaton
    ? automatonToFlow(automaton, { prefix, highlight, target })
    : { nodes: [], edges: [] };

  return (
    <section className="panel graph-panel">
      <header className="panel-head">
        <h2>{title}</h2>
        <p>{automaton ? `${automaton.states.length} states` : "Convert an NFA to see the machine."}</p>
      </header>
      {legend && (
        <ul className="legend">
          <li>
            <span className="swatch start" />
            Start
          </li>
          <li>
            <span className="swatch accept" />
            Accept
          </li>
          <li>
            <span className="swatch hot" />
            Current S
          </li>
          <li>
            <span className="swatch target" />
            δ′(S, a)
          </li>
        </ul>
      )}
      <div className="graph-canvas">
        <ReactFlow
          nodes={graph.nodes}
          edges={graph.edges}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={18} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </section>
  );
}
