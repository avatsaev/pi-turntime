# Task 002 — pi adapter: entry renderer — Summary

- **Sprint:** sprints/sprint-002-host-adapters
- **Completed:** 2026-11-12
- **Status:** done

## What was implemented
`renderRow(entry, theme)` (exported) and `registerEntryRenderer(ENTRY_TYPE, …)` inside `registerPi`. Output is an inline `{ render, invalidate }` component: one line `" " + theme.fg("dim", "Turn time <fmt>[ (aborted)]")`, truncated to `width - 1` characters, `[]` for width < 2. Invalid data returns `undefined`. No runtime pi-tui import.

## Files created / changed
| File | Change |
|------|--------|
| `src/pi.ts` | modified |
| `test/pi.test.ts` | extended (+4 tests, fake gains `registerEntryRenderer`) |

## How it satisfies the scope
Matches `specs/features/pi-turn-time-row.md`. Signature `(entry, options, theme) => Component | undefined` confirmed against pi `types.ts` L1563; host's `CustomEntryComponent` adds the spacer and no horizontal padding, hence the leading space.

## Build & test results
```
$ npm test
tests 20, pass 20, fail 0
```

## Acceptance criteria
- [x] valid data → one line with `Turn time 2m 05s` wrapped in `fg("dim", …)`
- [x] aborted → `(aborted)` suffix
- [x] malformed/missing data → `undefined`, no throw
- [x] width never exceeded; width 1 → `[]`
- [x] renderer registered exactly once for `pi-turntime.run`

## Follow-ups / TODO(verify)
- Truncation counts characters, valid because the text is ASCII (theme escape codes are added after slicing).
- Live rendering and resume replay verified in sprint-003 task-004.
