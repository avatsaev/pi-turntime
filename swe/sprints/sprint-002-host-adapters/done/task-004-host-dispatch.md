# Task 004 — Host detection & dispatch

- **Sprint:** sprints/sprint-002-host-adapters
- **Status:** done
- **Type:** feature
- **Area:** packaging
- **Priority:** P1
- **Estimated size:** XS
- **Depends on:** task-002, task-003 (sprint-002)

## Goal
`src/index.ts` selects the pi or omp adapter by feature detection.

## Context / why
One package must load in both hosts and register exactly one adapter.

## Scope references
- `swe/specs/architecture/host-compat-and-packaging.md` § Behavior & algorithms, § Error handling
- `src/index.ts` (replace stub), `test/index.test.ts` (create), `test/smoke.test.ts` (keep or fold in)

## What to build
`export default function (api: ExtensionAPI)`: `typeof api.registerEntryRenderer === "function"` → `registerPi(api)`, else `registerOmp(api)`. Synchronous, no awaits at load. Use a loose structural type for `api` here (union or `any`-free minimal interface) so no host type import is required in this file.

## Out of scope
Anything inside adapters.

## Acceptance criteria
- [ ] Fake api with `registerEntryRenderer` → pi handlers registered (`agent_start`, `agent_settled`), no omp loader invoked.
- [ ] Fake api without it → only `session_start` handler registered; no `appendEntry` ever called.
- [ ] Calling the factory never throws and returns synchronously.

## Test / verification plan
- Tests: `test/index.test.ts`; `npm test` all pass.

## Notes
Detection misfire is safe: the omp adapter is inert on failure (task-003).
