import type { NFA, ValidationIssue } from "./types";

export function validateNfa(nfa: NFA): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const states = new Set(nfa.states);

  if (nfa.states.length === 0) {
    issues.push({ field: "states", message: "NFA must have at least one state." });
  }

  if (new Set(nfa.states).size !== nfa.states.length) {
    issues.push({ field: "states", message: "State names must be unique." });
  }

  if (nfa.alphabet.length === 0) {
    issues.push({ field: "alphabet", message: "Alphabet must contain at least one symbol." });
  }

  if (new Set(nfa.alphabet).size !== nfa.alphabet.length) {
    issues.push({ field: "alphabet", message: "Alphabet symbols must be unique." });
  }

  if (nfa.alphabet.some((symbol) => symbol === "" || symbol === "ε" || symbol === "epsilon")) {
    issues.push({
      field: "alphabet",
      message: "Epsilon transitions are out of scope. Use a non-empty symbol alphabet.",
    });
  }

  if (!nfa.start) {
    issues.push({ field: "start", message: "Start state is required." });
  } else if (!states.has(nfa.start)) {
    issues.push({ field: "start", message: `Start state "${nfa.start}" is not in Q.` });
  }

  if (nfa.accept.length === 0) {
    issues.push({ field: "accept", message: "At least one accept state is required." });
  }

  for (const accept of nfa.accept) {
    if (!states.has(accept)) {
      issues.push({ field: "accept", message: `Accept state "${accept}" is not in Q.` });
    }
  }

  for (const [from, bySymbol] of Object.entries(nfa.delta)) {
    if (!states.has(from)) {
      issues.push({ field: "delta", message: `Transition from unknown state "${from}".` });
      continue;
    }

    for (const [symbol, targets] of Object.entries(bySymbol ?? {})) {
      if (!nfa.alphabet.includes(symbol)) {
        issues.push({
          field: "delta",
          message: `Symbol "${symbol}" on ${from} is not in the alphabet.`,
        });
      }

      for (const target of targets ?? []) {
        if (!states.has(target)) {
          issues.push({
            field: "delta",
            message: `Transition ${from} -${symbol}-> ${target} uses an unknown target.`,
          });
        }
      }
    }
  }

  return issues;
}

export function assertValidNfa(nfa: NFA): void {
  const issues = validateNfa(nfa);
  if (issues.length > 0) {
    throw new Error(issues.map((issue) => issue.message).join(" "));
  }
}
