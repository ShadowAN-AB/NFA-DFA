import { Background, Controls, ReactFlow } from "@xyflow/react";
import type { DFA, NFA } from "../engine";
import { AutomatonNode } from "./AutomatonNode";
import { automatonToFlow } from "./graphModel";

const nodeTypes = { automaton: AutomatonNode };

interface AutomatonGraphProps {
  title: string;
  automaton?: NFA | DFA;
  highlight?: string;
  prefix: string;
}

export function AutomatonGraph({ title, automaton, highlight, prefix }: AutomatonGraphProps) {
  const graph = automaton
    ? automatonToFlow(automaton, { prefix, highlight })
    : { nodes: [], edges: [] };

  return (
    <section className="panel graph-panel">
      <header className="panel-head">
        <h2>{title}</h2>
        <p>{automaton ? `${automaton.states.length} states` : "Convert an NFA to see the machine."}</p>
      </header>
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
