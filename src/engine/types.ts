export type StateId = string;
export type AlphabetSymbol = string;

export interface NFA {
  states: StateId[];
  alphabet: AlphabetSymbol[];
  start: StateId;
  accept: StateId[];
  /** δ(q, a) may return several states. Missing entries mean no transition. */
  delta: Record<StateId, Partial<Record<AlphabetSymbol, StateId[]>>>;
}

export interface DFA {
  states: string[];
  alphabet: AlphabetSymbol[];
  start: string;
  accept: string[];
  delta: Record<string, Partial<Record<AlphabetSymbol, string>>>;
  /** Maps a DFA state label such as "{q0,q1}" to the NFA states it represents. */
  subsets: Record<string, StateId[]>;
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface TransitionContribution {
  from: StateId;
  targets: StateId[];
}

export interface ConversionStep {
  step: number;
  currentSubset: StateId[];
  currentLabel: string;
  symbol: AlphabetSymbol;
  contributions: TransitionContribution[];
  unionResult: StateId[];
  resultLabel: string;
  isNewState: boolean;
}

export interface ConversionResult {
  dfa: DFA;
  steps: ConversionStep[];
  warnings: string[];
}

export interface RunTrace {
  machine: "NFA" | "DFA";
  input: string;
  accepted: boolean;
  /** DFA: unique state path. NFA: one accepting path, or a rejecting path. */
  path: string[];
  detail: string;
}
