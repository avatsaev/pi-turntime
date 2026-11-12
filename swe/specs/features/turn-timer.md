# Feature — Turn timer (core)

> Part of: [overview.md](../overview.md)
> Dependencies: none (pure module, no host imports)

## Purpose

Define what "total turn time" means and implement it once, host-neutral, so the pi adapter (and any
future adapter) only wires events to it.

## Public contract

Module `src/core.ts`.

```ts
export const ENTRY_TYPE = "pi-turntime.run";

export interface RunRecord { elapsedMs: number; startedAt: number; aborted: boolean }

export class RunTimer {
  constructor(now?: () => number);            // injectable clock, default Date.now
  start(): void;                              // idempotent while a window is open
  stop(aborted: boolean): RunRecord | undefined; // closes window; undefined if none open
  reset(): void;                              // drop any open window without emitting
  readonly isOpen: boolean;
}

export function formatElapsed(ms: number): string;
```

| Function | Inputs | Outputs | Errors |
|----------|--------|---------|--------|
| `start` | — | — | never throws |
| `stop` | `aborted` flag | `RunRecord` or `undefined` | never throws; returns `undefined` when closed |
| `formatElapsed` | ms (any finite number; negatives and NaN clamp to 0) | string | never throws |

## Behavior & algorithms

Definition: a **window** opens at the first `agent_start` after idle and closes at `agent_settled`.
`agent_end` does **not** close it, because the host may start another low-level run (retry, recovery,
compaction retry, queued continuation) before the user gets control back; the user-perceived turn is
the whole span.

```
start():  if window open: return            # nested agent_start from retry/continuation
          startedAt = now(); open = true

stop(aborted):
          if not open: return undefined
          elapsedMs = max(0, now() - startedAt)
          open = false
          return { elapsedMs, startedAt, aborted }
```

Elapsed-time format (`formatElapsed`), floor to the unit shown:

```
ms < 1000        -> "0.Ns"   one decimal, e.g. 800 -> "0.8s"
ms < 60_000      -> "S.Ns"   one decimal, e.g. 12_340 -> "12.3s"
ms < 3_600_000   -> "Mm SSs" seconds zero-padded, e.g. 125_000 -> "2m 05s"
otherwise        -> "Hh MMm SSs" minutes and seconds zero-padded, e.g. 3_725_000 -> "1h 02m 05s"
```

## Data & persistence touchpoints

None here; `RunRecord` is what adapters persist (see [pi-turn-time-row.md](pi-turn-time-row.md)).

## Error handling & edge cases

| Condition | Expected behavior |
|-----------|-------------------|
| `start()` twice before `stop()` | Second call ignored; original `startedAt` kept |
| `stop()` with no open window | Returns `undefined`; nothing emitted |
| Clock goes backwards | `elapsedMs` clamps to 0 |
| Session switched/reset mid-window | `reset()` drops the window; nothing emitted |
| Value `59_999` ms | `"60.0s"` is **not** allowed; rounds down to `"59.9s"` (floor, never carry into the next unit early) |

## Dependencies on other specs

- None. Consumed by [pi-turn-time-row.md](pi-turn-time-row.md).

## Acceptance criteria

- [ ] Given `start()`, clock +12_340 ms, `stop(false)` then record `{ elapsedMs: 12340, aborted: false }`.
- [ ] Given `start()`, `start()`, clock +5 s, `stop(false)` then exactly one record and `startedAt` equals the first start.
- [ ] Given no `start()`, `stop(false)` returns `undefined`.
- [ ] Given `start()`, `reset()`, `stop(false)` returns `undefined`.
- [ ] `formatElapsed` yields: 800→`0.8s`, 12_340→`12.3s`, 59_999→`59.9s`, 125_000→`2m 05s`, 3_725_000→`1h 02m 05s`, -5→`0.0s`, NaN→`0.0s`.

## TODO(verify)

- None beyond those listed in the overview.
