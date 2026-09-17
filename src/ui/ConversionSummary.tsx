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
      <p className="summary-line">
        Reachable DFA states: <strong>{dfa.states.length}</strong>
        {" · "}
        Steps recorded: <strong>{steps.length}</strong>
        {" · "}
        Sink: <strong>{sink ? "yes (∅)" : "not required"}</strong>
      </p>
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
