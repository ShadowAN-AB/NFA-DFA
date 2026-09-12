import { validateNfa } from "../engine";
import type { NFA, ValidationIssue } from "../engine";

export interface TransitionDraft {
  from: string;
  symbol: string;
  to: string;
}

export interface NfaDraft {
  states: string;
  alphabet: string;
  start: string;
  accept: string;
  transitions: TransitionDraft[];
}

export function splitCsv(value: string): string[] {
  return value
    .split(/[, \n]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function parseDraft(draft: NfaDraft): { nfa?: NFA; issues: ValidationIssue[] } {
  const states = splitCsv(draft.states);
  const alphabet = splitCsv(draft.alphabet);
  const accept = splitCsv(draft.accept);
  const delta: NFA["delta"] = {};

  for (const state of states) {
    delta[state] = {};
  }

  for (const row of draft.transitions) {
    const from = row.from.trim();
    const symbol = row.symbol.trim();
    const targets = splitCsv(row.to);
    if (!from || !symbol) {
      continue;
    }
    if (!delta[from]) {
      delta[from] = {};
    }
    const existing = delta[from][symbol] ?? [];
    delta[from][symbol] = [...new Set([...existing, ...targets])];
  }

  const nfa: NFA = {
    states,
    alphabet,
    start: draft.start.trim(),
    accept,
    delta,
  };

  const issues = validateNfa(nfa);
  return issues.length === 0 ? { nfa, issues } : { issues };
}

export function nfaToDraft(nfa: NFA): NfaDraft {
  const transitions: TransitionDraft[] = [];
  for (const from of nfa.states) {
    for (const symbol of nfa.alphabet) {
      const targets = nfa.delta[from]?.[symbol] ?? [];
      if (targets.length > 0) {
        transitions.push({ from, symbol, to: targets.join(", ") });
      }
    }
  }

  return {
    states: nfa.states.join(", "),
    alphabet: nfa.alphabet.join(", "),
    start: nfa.start,
    accept: nfa.accept.join(", "),
    transitions: transitions.length > 0 ? transitions : [{ from: "", symbol: "", to: "" }],
  };
}
