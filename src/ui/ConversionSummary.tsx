import type { ConversionResult } from "../engine";

interface ConversionSummaryProps {
  result?: ConversionResult;
}

export function ConversionSummary({ result }: ConversionSummaryProps) {
  if (!result) {
    return (
      <section className="panel">
        <header className="panel-head">
          <h2>Conversion result</h2>
          <p>Convert an NFA to see the generated DFA size and accept set.</p>
        </header>
      </section>
    );
  }

  const { dfa, steps, warnings } = result;
  const sink = dfa.states.includes("∅");

  return (
    <section className="panel">
      <header className="panel-head">
        <h2>Conversion result</h2>
        <p>Summary of the subset construction that the tables and graphs display.</p>
      </header>
      <div className="metrics">
        <div className="metric">
          <span>DFA states</span>
          <strong>{dfa.states.length}</strong>
        </div>
        <div className="metric">
          <span>Worklist steps</span>
          <strong>{steps.length}</strong>
        </div>
        <div className="metric">
          <span>Sink ∅</span>
          <strong>{sink ? "yes" : "no"}</strong>
        </div>
      </div>
      <p className="summary-line">
        Start: <strong>{dfa.start}</strong>
        {" · "}
        Accept: <strong>{dfa.accept.length ? dfa.accept.join(", ") : "none"}</strong>
      </p>
      {warnings.map((warning) => (
        <p className="muted" key={warning}>
          {warning}
        </p>
      ))}
    </section>
  );
}
