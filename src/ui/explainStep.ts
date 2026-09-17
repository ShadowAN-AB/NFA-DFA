import type { ConversionStep } from "../engine";

export function explainStep(step: ConversionStep): string {
  const union = step.unionResult.length === 0 ? "∅" : `{${step.unionResult.join(",")}}`;
  const novelty = step.isNewState
    ? "This subset is new, so it is added to the DFA and the worklist."
    : "This subset was already discovered, so the worklist does not grow.";
  return `From ${step.currentLabel} on symbol ${step.symbol}, collect every NFA target and take the union ${union}. The DFA move is ${step.currentLabel} -${step.symbol}-> ${step.resultLabel}. ${novelty}`;
}
