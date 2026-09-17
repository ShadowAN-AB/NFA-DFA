import type { NFA } from "../engine";
import { endsWithAb } from "../engine";

export interface Preset {
  id: string;
  name: string;
  description: string;
  samples: { accept: string[]; reject: string[] };
  nfa: NFA;
}

export const presets: Preset[] = [
  {
    id: "ends-with-ab",
    name: "Ends with ab",
    description: "Canonical teaching example: strings over {a,b} that end with ab.",
    samples: { accept: ["ab", "aab", "bab"], reject: ["", "a", "ba"] },
    nfa: endsWithAb,
  },
  {
    id: "contains-aa",
    name: "Contains aa",
    description: "Nondeterministic guess of the first aa pair.",
    samples: { accept: ["aa", "baa", "aab"], reject: ["", "a", "ab"] },
    nfa: {
      states: ["q0", "q1", "q2"],
      alphabet: ["a", "b"],
      start: "q0",
      accept: ["q2"],
      delta: {
        q0: { a: ["q0", "q1"], b: ["q0"] },
        q1: { a: ["q2"] },
        q2: { a: ["q2"], b: ["q2"] },
      },
    },
  },
  {
    id: "only-a",
    name: "Only a⁺",
    description: "Missing b-transitions force a DFA sink state.",
    samples: { accept: ["a", "aa", "aaa"], reject: ["", "b", "ab"] },
    nfa: {
      states: ["q0", "q1"],
      alphabet: ["a", "b"],
      start: "q0",
      accept: ["q1"],
      delta: {
        q0: { a: ["q1"] },
        q1: { a: ["q1"] },
      },
    },
  },
];
