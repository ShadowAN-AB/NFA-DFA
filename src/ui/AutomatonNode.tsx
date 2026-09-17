import { Handle, Position, type NodeProps } from "@xyflow/react";

export interface AutomatonNodeData {
  label: string;
  start: boolean;
  accept: boolean;
  highlight: boolean;
  target: boolean;
}

export function AutomatonNode({ data }: NodeProps) {
  const node = data as unknown as AutomatonNodeData;
  const classes = [
    "auto-node",
    node.start ? "is-start" : "",
    node.accept ? "is-accept" : "",
    node.highlight ? "is-hot" : "",
    node.target ? "is-target" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <Handle type="target" position={Position.Left} />
      <span className="auto-node-label">{node.label}</span>
      {node.start && <span className="auto-node-tag">start</span>}
      {node.accept && <span className="auto-node-tag">accept</span>}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
