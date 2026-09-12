import { ReactFlowProvider } from "@xyflow/react";
import { useMemo, useState } from "react";
import {
  compareMachines,
  nfaToDfa,
  type ConversionResult,
  type NFA,
  type RunTrace,
} from "./engine";
import { AutomatonGraph } from "./ui/AutomatonGraph";
import { NfaBuilder } from "./ui/NfaBuilder";
import { nfaToDraft, parseDraft, type NfaDraft } from "./ui/parseDraft";
import { presets } from "./ui/presets";
import { StepTable } from "./ui/StepTable";
import { StringTester } from "./ui/StringTester";
import { TransitionTable } from "./ui/TransitionTable";

const firstPreset = presets[0];

export default function App() {
  return (
    <ReactFlowProvider>
      <Workbench />
    </ReactFlowProvider>
  );
}

function Workbench() {
  const [presetId, setPresetId] = useState(firstPreset.id);
  const [draft, setDraft] = useState<NfaDraft>(() => nfaToDraft(firstPreset.nfa));
  const [nfa, setNfa] = useState<NFA | undefined>(firstPreset.nfa);
  const [conversion, setConversion] = useState<ConversionResult | undefined>();
  const [issues, setIssues] = useState<string[]>([]);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [testString, setTestString] = useState("aab");
  const [nfaTrace, setNfaTrace] = useState<RunTrace>();
  const [dfaTrace, setDfaTrace] = useState<RunTrace>();
  const [equivalent, setEquivalent] = useState<boolean>();

  const highlight = useMemo(() => {
    if (!conversion || selectedStep === null) {
      return undefined;
    }
    return conversion.steps.find((step) => step.step === selectedStep)?.currentLabel;
  }, [conversion, selectedStep]);

  const loadPreset = (id: string) => {
    setPresetId(id);
    const preset = presets.find((item) => item.id === id);
    if (!preset) {
      return;
    }
    setDraft(nfaToDraft(preset.nfa));
    setNfa(undefined);
    setConversion(undefined);
    setIssues([]);
    setSelectedStep(null);
    clearRun();
  };

  const changeDraft = (next: NfaDraft) => {
    setDraft(next);
    setPresetId("custom");
  };

  const convert = () => {
    const parsed = parseDraft(draft);
    if (!parsed.nfa) {
      setIssues(parsed.issues.map((issue) => issue.message));
      setNfa(undefined);
      setConversion(undefined);
      clearRun();
      return;
    }

    const result = nfaToDfa(parsed.nfa);
    setIssues(result.warnings);
    setNfa(parsed.nfa);
    setConversion(result);
    setSelectedStep(result.steps[0]?.step ?? null);
    clearRun();
  };

  const runTest = () => {
    if (!nfa) {
      setIssues(["Convert a valid NFA before testing strings."]);
      return;
    }
    const result = compareMachines(nfa, testString);
    setNfaTrace(result.nfaTrace);
    setDfaTrace(result.dfaTrace);
    setEquivalent(result.equivalent);
  };

  const clearRun = () => {
    setNfaTrace(undefined);
    setDfaTrace(undefined);
    setEquivalent(undefined);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">CSET302 · Automata Theory</p>
          <h1>SubsetLab</h1>
        </div>
        <p className="lede">
          NFA to DFA by subset construction. Enter an automaton, inspect every
          subset, then validate strings on both machines.
        </p>
      </header>

      {issues.length > 0 && (
        <div className="banner">
          {issues.map((issue) => (
            <p key={issue}>{issue}</p>
          ))}
        </div>
      )}

      <div className="layout">
        <NfaBuilder
          draft={draft}
          selectedPreset={presetId}
          onChange={changeDraft}
          onPreset={loadPreset}
          onConvert={convert}
        />

        <div className="column">
          <StepTable
            steps={conversion?.steps ?? []}
            selected={selectedStep}
            onSelect={setSelectedStep}
          />
          <TransitionTable title="NFA table" automaton={nfa} />
          <TransitionTable title="DFA table" automaton={conversion?.dfa} />
        </div>

        <div className="column">
          <AutomatonGraph title="NFA" automaton={nfa} prefix="nfa" />
          <AutomatonGraph
            title="Generated DFA"
            automaton={conversion?.dfa}
            highlight={highlight}
            prefix="dfa"
          />
          <StringTester
            value={testString}
            onChange={setTestString}
            onRun={runTest}
            nfaTrace={nfaTrace}
            dfaTrace={dfaTrace}
            equivalent={equivalent}
          />
        </div>
      </div>
    </div>
  );
}
