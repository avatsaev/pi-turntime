# Task 004 — Host detection & dispatch — Summary

- **Sprint:** sprints/sprint-002-host-adapters
- **Completed:** 2026-11-12
- **Status:** done

## What was implemented
`src/index.ts` default factory: `typeof api.registerEntryRenderer === "function"` → `registerPi`, else `registerOmp`. Synchronous, returns `undefined`; only type-only host imports.

## Files created / changed
| File | Change |
|------|--------|
| `src/index.ts` | replaced stub |
| `test/index.test.ts` | created (2 tests) |

## How it satisfies the scope
Per `specs/architecture/host-compat-and-packaging.md` § Behavior. Deviation: the api parameter is typed as the union of both hosts' `ExtensionAPI` (type-only imports) rather than a hand-rolled structural type.

## Build & test results
```
$ npm test
tests 27, pass 27, fail 0
```

## Acceptance criteria
- [x] pi-shaped api → pi handlers (`agent_start`, `agent_settled`, session resets) and renderer registered; no omp handler
- [x] omp-shaped api → only `session_start`; no renderer, no `appendEntry`
- [x] factory returns synchronously without throwing

## Follow-ups / TODO(verify)
- Real-host detection checked in sprint-003 task-004.
