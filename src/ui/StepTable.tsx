import type { ConversionStep } from "../engine";

interface StepTableProps {
  steps: ConversionStep[];
  selected: number | null;
  onSelect: (step: number) => void;
}

export function StepTable({ steps, selected, onSelect }: StepTableProps) {
  return (
    <section className="panel">
      <header className="panel-head">
        <h2>Subset construction</h2>
        <p>Each row is δ′(S, a) = ∪ δ(q, a) for q in S.</p>
      </header>
      {steps.length === 0 ? (
        <p className="empty">Convert an NFA to see the worklist steps.</p>
      ) : (
        <div className="table-wrap">
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
                  <td>{step.currentLabel}</td>
                  <td>{step.symbol}</td>
                  <td>{step.unionResult.length === 0 ? "∅" : `{${step.unionResult.join(",")}}`}</td>
                  <td>{step.resultLabel}</td>
                  <td>{step.isNewState ? "yes" : "no"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
