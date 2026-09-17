import { ReactFlowProvider } from "@xyflow/react";
import { useEffect, useMemo, useState } from "react";
import {
  compareMachines,
  nfaToDfa,
  type ConversionResult,
  type NFA,
  type RunTrace,
} from "./engine";
import { AutomatonGraph } from "./ui/AutomatonGraph";
import { ConversionSummary } from "./ui/ConversionSummary";
import { NfaBuilder } from "./ui/NfaBuilder";
import { nfaToDraft, parseDraft, type NfaDraft } from "./ui/parseDraft";
import { presets } from "./ui/presets";
import { StepTable } from "./ui/StepTable";
import { StringTester } from "./ui/StringTester";
import { TransitionTable } from "./ui/TransitionTable";

const firstPreset = presets[0];
const firstConversion = nfaToDfa(firstPreset.nfa);

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
  const [conversion, setConversion] = useState<ConversionResult | undefined>(firstConversion);
  const [issues, setIssues] = useState<string[]>(firstConversion.warnings);
  const [selectedStep, setSelectedStep] = useState<number | null>(firstConversion.steps[0]?.step ?? null);
  const [testString, setTestString] = useState(firstPreset.samples.accept[1] ?? firstPreset.samples.accept[0]);
  const [nfaTrace, setNfaTrace] = useState<RunTrace>();
  const [dfaTrace, setDfaTrace] = useState<RunTrace>();
  const [equivalent, setEquivalent] = useState<boolean>();
  const [pathIndex, setPathIndex] = useState(0);
  const activePreset = presets.find((item) => item.id === presetId);

  const highlight = useMemo(() => {
    if (!conversion || selectedStep === null) {
      return { current: undefined as string | undefined, target: undefined as string | undefined };
    }
    const step = conversion.steps.find((item) => item.step === selectedStep);
    return { current: step?.currentLabel, target: step?.resultLabel };
  }, [conversion, selectedStep]);

  const dfaHighlight = dfaTrace
    ? {
        current: dfaTrace.path[pathIndex],
        target: dfaTrace.path[pathIndex + 1],
      }
    : highlight;

  const loadPreset = (id: string) => {
    setPresetId(id);
    const preset = presets.find((item) => item.id === id);
    if (!preset) {
      return;
    }
    setDraft(nfaToDraft(preset.nfa));
    setNfa(preset.nfa);
    const result = nfaToDfa(preset.nfa);
    setConversion(result);
    setIssues(result.warnings);
    setSelectedStep(result.steps[0]?.step ?? null);
    setTestString(preset.samples.accept[0] ?? "aab");
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

  const applyRun = (input: string) => {
    if (!nfa) {
      setIssues(["Convert a valid NFA before testing strings."]);
      return;
    }
    const result = compareMachines(nfa, input);
    setTestString(input);
    setNfaTrace(result.nfaTrace);
    setDfaTrace(result.dfaTrace);
    setEquivalent(result.equivalent);
    setPathIndex(Math.max(0, result.dfaTrace.path.length - 1));
  };

  const runTest = () => {
    applyRun(testString);
  };

  const clearRun = () => {
    setNfaTrace(undefined);
    setDfaTrace(undefined);
    setEquivalent(undefined);
    setPathIndex(0);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!conversion || selectedStep === null) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "SELECT" || target.tagName === "TEXTAREA")) {
        return;
      }
      const index = conversion.steps.findIndex((step) => step.step === selectedStep);
      if (event.key === "ArrowRight" && index < conversion.steps.length - 1) {
        setSelectedStep(conversion.steps[index + 1].step);
      }
      if (event.key === "ArrowLeft" && index > 0) {
        setSelectedStep(conversion.steps[index - 1].step);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [conversion, selectedStep]);

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">CSET302 · Automata Theory</p>
          <h1>SubsetLab</h1>
        </div>
        <p className="lede">
          NFA to DFA by subset construction. Presets convert immediately. For a
          custom machine, edit the tables then Convert. Use Next or the arrow
          keys to walk the worklist.
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
          presetDescription={activePreset?.description}
          onChange={changeDraft}
          onPreset={loadPreset}
          onConvert={convert}
        />

        <div className="column">
          <ConversionSummary result={conversion} />
          <StepTable
            steps={conversion?.steps ?? []}
            selected={selectedStep}
            onSelect={setSelectedStep}
          />
          <TransitionTable title="NFA table" automaton={nfa} />
          <TransitionTable
            title="DFA table"
            automaton={conversion?.dfa}
            highlight={dfaHighlight.current}
            target={dfaHighlight.target}
          />
        </div>

        <div className="column">
          <AutomatonGraph title="NFA" automaton={nfa} prefix="nfa" legend />
          <AutomatonGraph
            title="Generated DFA"
            automaton={conversion?.dfa}
            highlight={dfaHighlight.current}
            target={dfaHighlight.target}
            prefix="dfa"
            legend
            legendMode={dfaTrace ? "run" : "construction"}
          />
          <StringTester
            value={testString}
            onChange={setTestString}
            onRun={runTest}
            onPick={applyRun}
            samples={activePreset?.samples}
            pathIndex={pathIndex}
            onPathIndex={setPathIndex}
            nfaTrace={nfaTrace}
            dfaTrace={dfaTrace}
            equivalent={equivalent}
          />
        </div>
      </div>
    </div>
  );
}
