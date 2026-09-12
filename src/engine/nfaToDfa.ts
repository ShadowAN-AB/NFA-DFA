import { subsetLabel, uniqueSorted } from "./subset";
import type { ConversionResult, ConversionStep, DFA, NFA, StateId } from "./types";
import { assertValidNfa } from "./validateNfa";

export interface ConvertOptions {
  /** When true (default), missing transitions go to a sink state ∅. */
  includeSink?: boolean;
}

export function nfaToDfa(nfa: NFA, options: ConvertOptions = {}): ConversionResult {
  assertValidNfa(nfa);
  const includeSink = options.includeSink ?? true;
  const warnings: string[] = [];

  const startSubset = uniqueSorted([nfa.start]);
  const startLabel = subsetLabel(startSubset);

  const subsets: Record<string, StateId[]> = { [startLabel]: startSubset };
  const dfaDelta: DFA["delta"] = {};
  const steps: ConversionStep[] = [];
  const worklist: StateId[][] = [startSubset];
  const seen = new Set<string>([startLabel]);
  let stepNumber = 1;
  let sinkCreated = false;

  while (worklist.length > 0) {
    const current = worklist.shift()!;
    const currentLabel = subsetLabel(current);
    dfaDelta[currentLabel] = {};

    for (const symbol of nfa.alphabet) {
      const contributions = current.map((from) => ({
        from,
        targets: uniqueSorted(nfa.delta[from]?.[symbol] ?? []),
      }));

      const union = uniqueSorted(contributions.flatMap((item) => item.targets));
      const emptyUnion = union.length === 0;

      if (emptyUnion && !includeSink) {
        warnings.push(`No ${symbol}-transition from ${currentLabel}; DFA left incomplete.`);
        steps.push({
          step: stepNumber++,
          currentSubset: current,
          currentLabel,
          symbol,
          contributions,
          unionResult: [],
          resultLabel: "∅",
          isNewState: false,
        });
        continue;
      }

      const resultLabel = subsetLabel(union);
      const isNewState = !seen.has(resultLabel);
      dfaDelta[currentLabel][symbol] = resultLabel;

      if (isNewState) {
        seen.add(resultLabel);
        subsets[resultLabel] = union;
        if (emptyUnion) {
          sinkCreated = true;
        } else {
          worklist.push(union);
        }
      }

      steps.push({
        step: stepNumber++,
        currentSubset: current,
        currentLabel,
        symbol,
        contributions,
        unionResult: union,
        resultLabel,
        isNewState,
      });
    }
  }

  if (sinkCreated) {
    dfaDelta["∅"] = {};
    for (const symbol of nfa.alphabet) {
      dfaDelta["∅"][symbol] = "∅";
    }
    warnings.push("Sink state ∅ added for missing NFA transitions.");
  }

  const accept = Object.entries(subsets)
    .filter(([, members]) => members.some((state) => nfa.accept.includes(state)))
    .map(([label]) => label);

  const dfa: DFA = {
    states: Object.keys(subsets),
    alphabet: [...nfa.alphabet],
    start: startLabel,
    accept,
    delta: dfaDelta,
    subsets,
  };

  return { dfa, steps, warnings };
}
