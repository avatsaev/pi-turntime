# Task 002 — RunTimer state machine — Summary

- **Sprint:** sprints/sprint-001-skeleton-and-core
- **Completed:** 2026-11-12
- **Status:** done

## What was implemented
`ENTRY_TYPE`, `RunRecord`, and `RunTimer` (injectable clock, idempotent `start`, `stop(aborted)`, `reset`, `isOpen`) in `src/core.ts`. Erasable TS syntax only, no host imports.

## Files created / changed
| File | Change |
|------|--------|
| `src/core.ts` | created |
| `test/core.test.ts` | created (6 RunTimer tests) |

## How it satisfies the scope
Follows `specs/features/turn-timer.md` § Behavior & algorithms exactly.

## Build & test results
```
$ npm test
tests 7, pass 7, fail 0
```

## Acceptance criteria
- [x] start +12_340 ms stop(false) → `{12340, startedAt, false}` (test 1)
- [x] nested start → one record, first startedAt (test 2)
- [x] stop without start / second stop → undefined (tests 2, 3)
- [x] start, reset, stop → undefined (test 4)
- [x] backwards clock → 0 (test 5)
- [x] stop(true) → aborted true (test 6)

## Follow-ups / TODO(verify)
- None.
