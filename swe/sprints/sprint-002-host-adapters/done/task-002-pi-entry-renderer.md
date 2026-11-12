# Task 002 — pi adapter: entry renderer

- **Sprint:** sprints/sprint-002-host-adapters
- **Status:** done
- **Type:** feature
- **Area:** pi adapter
- **Priority:** P1
- **Estimated size:** S
- **Depends on:** task-001 (sprint-002), task-003 (sprint-001)

## Goal
Register an entry renderer that draws a dim `Turn time …` line for `pi-turntime.run` entries, live and on replay.

## Context / why
This is the user-visible row under the last assistant message in pi.

## Scope references
- `swe/specs/features/pi-turn-time-row.md` § Public contract (renderer output), § Behavior & algorithms
- `~/DEV/pi/packages/coding-agent/src/core/extensions/types.ts` L1563 (`EntryRenderer` signature: `(entry, options, theme) => Component | undefined`)
- `~/DEV/pi/packages/coding-agent/src/modes/interactive/components/custom-entry.ts` (host adds a 1-row Spacer above; no horizontal padding; renderer exceptions are shown as an error box)
- `src/pi.ts` (modify), `src/core.ts` (consume `formatElapsed`), `test/pi.test.ts` (extend)

## What to build
- In `registerPi`, call `api.registerEntryRenderer(ENTRY_TYPE, renderer)`.
- `renderer(entry, _opts, theme)`: validate `entry.data` (`elapsedMs` finite and ≥ 0, `aborted` boolean) else return `undefined`. Text = `Turn time ${formatElapsed(ms)}` plus ` (aborted)` when aborted.
- Return an inline `Component` `{ render(width): string[]; invalidate() {} }`: one line = `" " + theme.fg("dim", text)` where `text` is hard-truncated so the visible width ≤ `width` (text is ASCII; truncate by character count to `width - 1`; return `[]` when `width < 2`). **Do not import `@earendil-works/pi-tui` at runtime.**

## Out of scope
Token/cost stats, expanded view, config.

## Acceptance criteria
- [ ] Valid data → component whose `render(80)` is one line containing `Turn time 2m 05s`, wrapped through `theme.fg("dim", …)` (fake theme records calls).
- [ ] `aborted: true` → text ends with `(aborted)`.
- [ ] Malformed/missing data → `undefined`, no throw.
- [ ] `render(10)` never returns a line with visible length > 10; `render(1)` → `[]`.
- [ ] `registerEntryRenderer` called exactly once with `"pi-turntime.run"`.

## Test / verification plan
- Tests: extend `test/pi.test.ts`; `npm test` all pass.

## Notes
Live end-to-end rendering is verified in sprint-003 task-004.
