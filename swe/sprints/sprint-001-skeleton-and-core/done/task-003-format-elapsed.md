# Task 003 — formatElapsed

- **Sprint:** sprints/sprint-001-skeleton-and-core
- **Status:** done
- **Type:** feature
- **Area:** core
- **Priority:** P1
- **Estimated size:** XS
- **Depends on:** task-002

## Goal
Add `formatElapsed(ms: number): string` to `src/core.ts`.

## Context / why
The pi row displays this string; the exact format is part of the contract.

## Scope references
- `swe/specs/features/turn-timer.md` § Behavior & algorithms (format table), § Acceptance criteria
- `src/core.ts` (modify), `test/core.test.ts` (modify)

## What to build
Floor (never round up) to the unit shown; negatives, NaN, ±Infinity clamp to 0:
- `< 1000` and `< 60_000` → one decimal seconds (`800` → `0.8s`, `12_340` → `12.3s`, `59_999` → `59.9s`).
- `< 3_600_000` → `Mm SSs`, seconds zero-padded (`125_000` → `2m 05s`).
- otherwise → `Hh MMm SSs`, minutes and seconds zero-padded (`3_725_000` → `1h 02m 05s`).
- Beware floating-point: compute decimals with integer math (`Math.floor(ms / 100) / 10`, formatted via integer tenths), not `toFixed` (which rounds).

## Out of scope
Localization, configurable formats.

## Acceptance criteria
- [ ] 0→`0.0s`, 800→`0.8s`, 12_340→`12.3s`, 59_999→`59.9s`, 60_000→`1m 00s`, 125_000→`2m 05s`, 3_599_999→`59m 59s`, 3_725_000→`1h 02m 05s`.
- [ ] -5→`0.0s`, NaN→`0.0s`, Infinity→`0.0s`.

## Test / verification plan
- Tests: extend `test/core.test.ts` with the table above; `npm test` all pass.

## Notes
`59_999` → `59.9s` is deliberate (spec: never carry into the next unit early).
