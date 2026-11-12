# Task 004 — Live verification on pi and omp

- **Sprint:** sprints/sprint-003-hardening-and-docs
- **Status:** in_progress
- **Type:** test
- **Area:** acceptance
- **Priority:** P1
- **Estimated size:** M
- **Depends on:** task-002 (sprint-003), task-004 (sprint-002)

## Goal
Prove, in real TUIs, the end-to-end acceptance criteria that unit tests with fakes cannot, and close the spec TODO(verify) items.

## Context / why
Both adapters were written against read APIs, not exercised in a running host.

## Scope references
- `swe/specs/features/pi-turn-time-row.md` § Acceptance criteria, § TODO(verify)
- `swe/specs/features/omp-native-turn-time.md` § Acceptance criteria, § TODO(verify)
- `swe/specs/architecture/host-compat-and-packaging.md` § Acceptance criteria
- `swe/specs/overview.md` § Open questions

## What to build
Manual runs (use a tmux/pty session), recording observations in the task summary:
- **pi 1.5.0** (`pi -e <repo>`): no load error; prompt with tool use → one dim `Turn time …` row under the final assistant message, time ≈ wall clock; Escape mid-run → `(aborted)`; trigger a retry/compaction path if feasible → one row; resume the session → rows redrawn at correct positions; confirm entries are `custom` and absent from the provider context.
- **omp 18.19.0** (`omp -e <repo>`): no load error; with `display.showTokenUsage: true` and `display.showTurnTime` unset → turn time shown in the last assistant message's usage row (final message only); `display.showTurnTime: false` in config → nothing shown; subagent session performs no override.
- Update the spec TODO(verify) checkboxes with the findings; fix the code and tests if reality differs.

## Out of scope
Automating TUI tests.

## Acceptance criteria
- [ ] Each bullet above observed and recorded as pass/fail in the summary.
- [ ] Any failures fixed or filed as blocked tasks with reasons.
- [ ] Spec TODO(verify) items updated.

## Test / verification plan
- `npm test` and `npm run typecheck` pass after any fixes; manual observations as listed.

## Notes
If a TUI cannot be driven non-interactively, state the limit explicitly rather than claiming a pass.
