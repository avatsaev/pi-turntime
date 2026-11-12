# Task 003 — README

- **Sprint:** sprints/sprint-003-hardening-and-docs
- **Status:** done
- **Type:** docs
- **Area:** docs
- **Priority:** P3
- **Estimated size:** XS
- **Depends on:** task-004 (sprint-002)

## Goal
A concise `README.md` covering install, behavior and opt-out on both hosts.

## Scope references
- `swe/specs/overview.md` § Purpose, § External integrations & configuration, § Build / run / test / deploy
- `swe/specs/architecture/host-compat-and-packaging.md` § Install paths
- `README.md` (create)

## What to build
Sections: what it does; omp behavior (enables `display.showTurnTime` + `display.showTokenUsage` only when unconfigured; set `display.showTurnTime: false` to opt out; row needs `showTokenUsage`); pi behavior (dim `Turn time …` row, persisted as a non-context `custom` entry); install commands per host; how to disable per host; development (`npm test`, `npm run typecheck`).

## Out of scope
Changelog, screenshots.

## Acceptance criteria
- [ ] Every install/opt-out command in the README matches the commands in the specs (or was re-verified in task-004).
- [ ] States the pi row/omp native split clearly.

## Test / verification plan
- Re-read for accuracy against the specs; no commands to run.

## Notes
Finalize wording after task-004 so documented behavior matches what was actually observed.
