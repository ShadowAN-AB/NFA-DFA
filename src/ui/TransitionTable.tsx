import type { DFA, NFA } from "../engine";

interface TransitionTableProps {
  title: string;
  automaton?: NFA | DFA;
}

function cell(automaton: NFA | DFA, state: string, symbol: string): string {
  const raw = automaton.delta[state]?.[symbol];
  if (!raw) {
    return "—";
  }
  return Array.isArray(raw) ? (raw.length ? raw.join(", ") : "—") : raw;
}

export function TransitionTable({ title, automaton }: TransitionTableProps) {
  return (
    <section className="panel">
      <header className="panel-head">
        <h2>{title}</h2>
      </header>
      {!automaton ? (
        <p className="empty">No table yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>State</th>
                {automaton.alphabet.map((symbol) => (
                  <th key={symbol}>{symbol}</th>
                ))}
                <th>Accept</th>
              </tr>
            </thead>
            <tbody>
              {automaton.states.map((state) => (
                <tr key={state}>
                  <td>
                    {state === automaton.start ? `${state} (s)` : state}
                  </td>
                  {automaton.alphabet.map((symbol) => (
                    <td key={symbol}>{cell(automaton, state, symbol)}</td>
                  ))}
                  <td>{automaton.accept.includes(state) ? "yes" : "no"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
