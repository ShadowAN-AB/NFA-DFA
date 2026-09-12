import type { NFA } from "./types";

/** Language: strings over {a,b} that end with ab. */
export const endsWithAb: NFA = {
  states: ["q0", "q1", "q2"],
  alphabet: ["a", "b"],
  start: "q0",
  accept: ["q2"],
  delta: {
    q0: { a: ["q0", "q1"], b: ["q0"] },
    q1: { b: ["q2"] },
    q2: {},
  },
};
