# SubsetLab — NFA to DFA

CSET302 Automata Theory simulator. Converts a user-defined NFA to an equivalent DFA using subset construction, with step-by-step tables, graphs, and dual string testing.

Repository: https://github.com/ShadowAN-AB/NFA-DFA

## Run

```bash
npm install
npm test
npm run dev
```

Open the local Vite URL, load **Ends with ab**, click **Convert to DFA**, then test `aab` (accept) and `aabb` (reject).

## What it does

1. Accepts a user-defined NFA (or a preset).
2. Runs subset construction and records every intermediate subset.
3. Shows NFA/DFA transition tables and graphs.
4. Tests the same string on both machines and checks that they agree.

Epsilon-NFA conversion is intentionally out of scope (separate course topic).
