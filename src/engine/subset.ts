import type { StateId } from "./types";

export function uniqueSorted(states: StateId[]): StateId[] {
  return [...new Set(states)].sort();
}

export function subsetLabel(states: StateId[]): string {
  const unique = uniqueSorted(states);
  if (unique.length === 0) {
    return "∅";
  }
  return `{${unique.join(",")}}`;
}
