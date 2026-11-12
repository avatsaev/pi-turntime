# Task 002 — RunTimer state machine

- **Sprint:** sprints/sprint-001-skeleton-and-core
- **Status:** done
- **Type:** feature
- **Area:** core
- **Priority:** P1
- **Estimated size:** S
- **Depends on:** task-001

## Goal
Implement the host-neutral `RunTimer` and `ENTRY_TYPE` / `RunRecord` in `src/core.ts`.

## Context / why
"Total turn time" is one window from first `agent_start` to `agent_settled`; nested starts (retries, continuations) must not restart it.

## Scope references
- `swe/specs/features/turn-timer.md` § Public contract, § Behavior & algorithms, § Error handling & edge cases
- `src/core.ts` (create), `test/core.test.ts` (create)

## What to build
- `export const ENTRY_TYPE = "pi-turntime.run"`.
- `export interface RunRecord { elapsedMs: number; startedAt: number; aborted: boolean }`.
- `export class RunTimer` with injectable clock `constructor(now: () => number = Date.now)`, `start()`, `stop(aborted: boolean): RunRecord | undefined`, `reset()`, getter `isOpen`.
- Erasable TS syntax only: declare fields explicitly; **no** constructor parameter properties.
- No imports from any host package.

## Out of scope
`formatElapsed` (task-003), any adapter wiring.

## Acceptance criteria
- [ ] `start()`, clock +12_340 ms, `stop(false)` → `{ elapsedMs: 12340, aborted: false, startedAt: <start> }`.
- [ ] `start()` twice, clock +5 s, `stop(false)` → one record, `startedAt` equals the first start.
- [ ] `stop()` with no open window → `undefined`; a second `stop()` after a successful one → `undefined`.
- [ ] `start()`, `reset()`, `stop(false)` → `undefined`.
- [ ] Clock moving backwards → `elapsedMs === 0`.
- [ ] `stop(true)` yields `aborted: true`.

## Test / verification plan
- Tests: `test/core.test.ts` with a fake clock covering each criterion; `npm test` all pass.

## Notes
None.
