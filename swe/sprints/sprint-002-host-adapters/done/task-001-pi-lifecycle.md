# Task 001 — pi adapter: lifecycle wiring & persistence

- **Sprint:** sprints/sprint-002-host-adapters
- **Status:** done
- **Type:** feature
- **Area:** pi adapter
- **Priority:** P1
- **Estimated size:** S
- **Depends on:** task-002 (sprint-001)

## Goal
`src/pi.ts` exports `registerPi(api)` that times each run and appends one `custom` entry per settled run.

## Context / why
pi has no per-message stats row; the measurement must be persisted so it survives resume and stays out of LLM context.

## Scope references
- `swe/specs/features/pi-turn-time-row.md` § Public contract, § Behavior & algorithms, § Error handling & edge cases
- `swe/specs/features/turn-timer.md`
- `src/core.ts` (consume), `src/pi.ts` (create), `test/pi.test.ts` (create)
- pi source for exact API shapes: `~/DEV/pi/packages/coding-agent/src/core/extensions/types.ts` (`agent_settled` at ~L1034/L1652, `registerEntryRenderer` ~L1725), `src/core/agent-session.ts` ~L1084

## What to build
- `export function registerPi(api: ExtensionAPI): void` with a fresh `RunTimer` created **inside** the function (no module-level state).
- `agent_start` → `timer.start()`; `agent_settled` (`{ aborted }`) → `rec = timer.stop(aborted)`; if `rec`, `api.appendEntry(ENTRY_TYPE, rec)` wrapped in try/catch that swallows errors (log via `console.error` is NOT allowed in TUI; just swallow).
- `session_start` and `session_shutdown` → `timer.reset()`.
- `import type { ExtensionAPI } from "@earendil-works/pi-coding-agent"` only (type-only import).
- Renderer registration is task-002; leave the call site for it in this file.

## Out of scope
Renderer (task-002), host detection (task-004).

## Acceptance criteria
- [ ] Fake api: `agent_start`, clock +3 s, `agent_settled {aborted:false}` → exactly one `appendEntry("pi-turntime.run", { elapsedMs: 3000, startedAt, aborted: false })`.
- [ ] Nested `agent_start` ×2 before one settle → one entry, spanning both.
- [ ] `agent_settled` without prior start → no entry.
- [ ] `session_start` between start and settle → no entry.
- [ ] `appendEntry` throwing does not propagate out of the handler.
- [ ] `aborted: true` is recorded.

## Test / verification plan
- Tests: `test/pi.test.ts` with a hand-rolled fake `api` (`on` records handlers; `appendEntry` records calls; inject clock via an optional second parameter `registerPi(api, now?)`); `npm test` all pass.

## Notes
Per-turn state must live inside the factory call so subagent/child sessions get independent timers.
