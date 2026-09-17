import type { RunTrace } from "../engine";

interface StringTesterProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onPick?: (value: string) => void;
  samples?: { accept: string[]; reject: string[] };
  nfaTrace?: RunTrace;
  dfaTrace?: RunTrace;
  equivalent?: boolean;
}

export function StringTester({
  value,
  onChange,
  onRun,
  onPick,
  samples,
  nfaTrace,
  dfaTrace,
  equivalent,
}: StringTesterProps) {
  const pick = (sample: string) => {
    if (onPick) {
      onPick(sample);
      return;
    }
    onChange(sample);
  };

  return (
    <section className="panel">
      <header className="panel-head">
        <h2>String tester</h2>
        <p>Run the same string on the original NFA and the generated DFA.</p>
      </header>
      <div className="tester-row">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="e.g. aab"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onRun();
            }
          }}
        />
        <button type="button" className="primary" onClick={onRun}>
          Test
        </button>
      </div>
      {samples && (
        <div className="sample-board">
          <SampleRow label="Should accept" values={samples.accept} onPick={pick} />
          <SampleRow label="Should reject" values={samples.reject} onPick={pick} />
        </div>
      )}
      {nfaTrace && dfaTrace && (
        <div className={`verdict ${equivalent ? "ok" : "bad"}`}>
          {equivalent
            ? `Both machines ${nfaTrace.accepted ? "accept" : "reject"} "${nfaTrace.input || "ε"}".`
            : "NFA and DFA disagree. Check the conversion."}
        </div>
      )}
      <div className="trace-grid">
        <TraceCard title="NFA" trace={nfaTrace} />
        <TraceCard title="DFA" trace={dfaTrace} />
      </div>
    </section>
  );
}

function SampleRow({
  label,
  values,
  onPick,
}: {
  label: string;
  values: string[];
  onPick: (value: string) => void;
}) {
  return (
    <div className="sample-row">
      <span>{label}</span>
      <div className="chips">
        {values.map((sample) => (
          <button key={`${label}-${sample}`} type="button" className="chip" onClick={() => onPick(sample)}>
            {sample === "" ? "ε" : sample}
          </button>
        ))}
      </div>
    </div>
  );
}

function TraceCard({ title, trace }: { title: string; trace?: RunTrace }) {
  if (!trace) {
    return (
      <div className="trace">
        <h3>{title}</h3>
        <p className="empty">No run yet.</p>
      </div>
    );
  }

  return (
    <div className="trace">
      <h3>
        {title} · {trace.accepted ? "accept" : "reject"}
      </h3>
      <p className="path">{trace.path.join(" → ")}</p>
      <p className="muted">{trace.detail}</p>
    </div>
  );
}
