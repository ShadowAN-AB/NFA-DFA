import { nfaToDfa } from "./nfaToDfa";
import type { DFA, NFA, RunTrace, StateId } from "./types";

export function runDfa(dfa: DFA, input: string): RunTrace {
  const path: string[] = [dfa.start];
  let current = dfa.start;

  for (const symbol of input.split("")) {
    if (!dfa.alphabet.includes(symbol)) {
      return {
        machine: "DFA",
        input,
        accepted: false,
        path,
        detail: `Symbol "${symbol}" is not in the alphabet.`,
      };
    }

    const next = dfa.delta[current]?.[symbol];
    if (!next) {
      return {
        machine: "DFA",
        input,
        accepted: false,
        path,
        detail: `No DFA transition from ${current} on "${symbol}".`,
      };
    }

    current = next;
    path.push(current);
  }

  const accepted = dfa.accept.includes(current);
  return {
    machine: "DFA",
    input,
    accepted,
    path,
    detail: accepted ? `Halted in accept state ${current}.` : `Halted in non-accept state ${current}.`,
  };
}

export function runNfa(nfa: NFA, input: string): RunTrace {
  const symbols = input.split("");

  for (const symbol of symbols) {
    if (!nfa.alphabet.includes(symbol)) {
      return {
        machine: "NFA",
        input,
        accepted: false,
        path: [nfa.start],
        detail: `Symbol "${symbol}" is not in the alphabet.`,
      };
    }
  }

  type Node = { state: StateId; index: number };
  const start: Node = { state: nfa.start, index: 0 };
  const queue: Node[] = [start];
  const visited = new Set<string>([key(start)]);
  const parent = new Map<string, { prev: string; state: StateId }>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentKey = key(current);

    if (current.index === symbols.length) {
      if (nfa.accept.includes(current.state)) {
        return {
          machine: "NFA",
          input,
          accepted: true,
          path: reconstruct(parent, currentKey, current.state),
          detail: `An accepting path ends in ${current.state}.`,
        };
      }
      continue;
    }

    const symbol = symbols[current.index];
    const targets = nfa.delta[current.state]?.[symbol] ?? [];

    for (const target of targets) {
      const next: Node = { state: target, index: current.index + 1 };
      const nextKey = key(next);
      if (visited.has(nextKey)) {
        continue;
      }
      visited.add(nextKey);
      parent.set(nextKey, { prev: currentKey, state: current.state });
      queue.push(next);
    }
  }

  return {
    machine: "NFA",
    input,
    accepted: false,
    path: [nfa.start],
    detail: "No accepting path exists for this string.",
  };
}

export function compareMachines(nfa: NFA, input: string): {
  nfaTrace: RunTrace;
  dfaTrace: RunTrace;
  equivalent: boolean;
} {
  const { dfa } = nfaToDfa(nfa);
  const nfaTrace = runNfa(nfa, input);
  const dfaTrace = runDfa(dfa, input);
  return {
    nfaTrace,
    dfaTrace,
    equivalent: nfaTrace.accepted === dfaTrace.accepted,
  };
}

function key(node: { state: StateId; index: number }): string {
  return `${node.state}|${node.index}`;
}

function reconstruct(
  parent: Map<string, { prev: string; state: StateId }>,
  endKey: string,
  endState: StateId,
): StateId[] {
  const states: StateId[] = [endState];
  let cursor = endKey;

  while (parent.has(cursor)) {
    const step = parent.get(cursor)!;
    states.push(step.state);
    cursor = step.prev;
  }

  return states.reverse();
}
