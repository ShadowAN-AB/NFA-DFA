import type { NfaDraft, TransitionDraft } from "./parseDraft";
import { presets } from "./presets";

interface NfaBuilderProps {
  draft: NfaDraft;
  onChange: (draft: NfaDraft) => void;
  onPreset: (id: string) => void;
  onConvert: () => void;
  selectedPreset: string;
  presetDescription?: string;
}

export function NfaBuilder({
  draft,
  onChange,
  onPreset,
  onConvert,
  selectedPreset,
  presetDescription,
}: NfaBuilderProps) {
  const update = (patch: Partial<NfaDraft>) => onChange({ ...draft, ...patch });

  const updateRow = (index: number, patch: Partial<TransitionDraft>) => {
    const transitions = draft.transitions.map((row, rowIndex) =>
      rowIndex === index ? { ...row, ...patch } : row,
    );
    onChange({ ...draft, transitions });
  };

  const addRow = () => {
    onChange({
      ...draft,
      transitions: [...draft.transitions, { from: "", symbol: "", to: "" }],
    });
  };

  const removeRow = (index: number) => {
    const transitions = draft.transitions.filter((_, rowIndex) => rowIndex !== index);
    onChange({
      ...draft,
      transitions: transitions.length > 0 ? transitions : [{ from: "", symbol: "", to: "" }],
    });
  };

  return (
    <section className="panel">
      <header className="panel-head">
        <h2>NFA input</h2>
        <p>{presetDescription ?? "User-defined automaton. Load a preset or type your own."}</p>
      </header>

      <label className="field">
        <span>Preset</span>
        <select value={selectedPreset} onChange={(event) => onPreset(event.target.value)}>
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
          <option value="custom">Custom</option>
        </select>
      </label>

      <label className="field">
        <span>States Q</span>
        <input
          value={draft.states}
          onChange={(event) => update({ states: event.target.value })}
          placeholder="q0, q1, q2"
        />
      </label>

      <label className="field">
        <span>Alphabet Σ</span>
        <input
          value={draft.alphabet}
          onChange={(event) => update({ alphabet: event.target.value })}
          placeholder="a, b"
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Start q₀</span>
          <input
            value={draft.start}
            onChange={(event) => update({ start: event.target.value })}
            placeholder="q0"
          />
        </label>
        <label className="field">
          <span>Accept F</span>
          <input
            value={draft.accept}
            onChange={(event) => update({ accept: event.target.value })}
            placeholder="q2"
          />
        </label>
      </div>

      <div className="transition-block">
        <div className="transition-head">
          <span>Transitions δ</span>
          <button type="button" className="linkish" onClick={addRow}>
            Add row
          </button>
        </div>
        {draft.transitions.map((row, index) => (
          <div className="transition-row" key={`${index}-${row.from}-${row.symbol}`}>
            <input
              value={row.from}
              placeholder="from"
              onChange={(event) => updateRow(index, { from: event.target.value })}
            />
            <input
              value={row.symbol}
              placeholder="symbol"
              onChange={(event) => updateRow(index, { symbol: event.target.value })}
            />
            <input
              value={row.to}
              placeholder="to (comma for many)"
              onChange={(event) => updateRow(index, { to: event.target.value })}
            />
            <button type="button" className="iconish" onClick={() => removeRow(index)} aria-label="Remove">
              ×
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="primary" onClick={onConvert}>
        Convert to DFA
      </button>
    </section>
  );
}
