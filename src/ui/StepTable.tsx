import type { ConversionStep } from "../engine";
import { explainStep } from "./explainStep";

interface StepTableProps {
  steps: ConversionStep[];
  selected: number | null;
  onSelect: (step: number) => void;
}

export function StepTable({ steps, selected, onSelect }: StepTableProps) {
  const current = steps.find((step) => step.step === selected);
  const index = steps.findIndex((step) => step.step === selected);

  const go = (offset: number) => {
    const next = steps[index + offset];
    if (next) {
      onSelect(next.step);
    }
  };

  return (
    <section className="panel">
      <header className="panel-head">
        <h2>Subset construction</h2>
        <p>Each row is δ′(S, a) = ∪ δ(q, a) for q in S. Click a row or step through.</p>
      </header>
      {steps.length === 0 ? (
        <p className="empty">Convert an NFA to see the worklist steps.</p>
      ) : (
        <>
          <div className="step-controls">
            <button type="button" className="ghost" onClick={() => go(-1)} disabled={index <= 0}>
              Previous
            </button>
            <span className="step-count">
              Step {current?.step ?? 1} of {steps.length}
            </span>
            <button
              type="button"
              className="ghost"
              onClick={() => go(1)}
              disabled={index < 0 || index >= steps.length - 1}
            >
              Next
            </button>
          </div>
          {current && <p className="step-explain">{explainStep(current)}</p>}
          <div className="table-wrap clickable-rows">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Subset S</th>
                  <th>a</th>
                  <th>Union</th>
                  <th>δ′(S, a)</th>
                  <th>New</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((step) => (
                  <tr
                    key={step.step}
                    className={selected === step.step ? "is-selected" : undefined}
                    onClick={() => onSelect(step.step)}
                  >
                    <td>{step.step}</td>
                    <td className="cell-current">{step.currentLabel}</td>
                    <td>{step.symbol}</td>
                    <td>{step.unionResult.length === 0 ? "∅" : `{${step.unionResult.join(",")}}`}</td>
                    <td className="cell-target">{step.resultLabel}</td>
                    <td>{step.isNewState ? "yes" : "no"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
