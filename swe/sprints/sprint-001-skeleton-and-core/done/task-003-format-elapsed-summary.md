# Task 003 — formatElapsed — Summary

- **Sprint:** sprints/sprint-001-skeleton-and-core
- **Completed:** 2026-11-12
- **Status:** done

## What was implemented
`formatElapsed(ms)` in `src/core.ts`, using integer math (no `toFixed`) so values floor rather than round; non-finite/negative input clamps to 0.

## Files created / changed
| File | Change |
|------|--------|
| `src/core.ts` | modified |
| `test/core.test.ts` | added 2 formatElapsed tests |

## How it satisfies the scope
Matches `specs/features/turn-timer.md` format table; `59_999` → `59.9s` as specified.

## Build & test results
```
$ npm test
tests 9, pass 9, fail 0
```

## Acceptance criteria
- [x] 0, 800, 12_340, 59_999, 60_000, 125_000, 3_599_999, 3_725_000 → expected strings (table test)
- [x] -5, NaN, Infinity → `0.0s`

## Follow-ups / TODO(verify)
- None.
