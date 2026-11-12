# Task 001 — Package scaffold & green test harness — Summary

- **Sprint:** sprints/sprint-001-skeleton-and-core
- **Completed:** 2026-11-12
- **Status:** done

## What was implemented
Package manifest with both `omp.extensions` and `pi.extensions`, stub factory, root re-export, smoke test, `.gitignore`.

## Files created / changed
| File | Change |
|------|--------|
| `package.json` | created |
| `src/index.ts` | created (stub) |
| `index.ts` | created (re-export) |
| `test/smoke.test.ts` | created |
| `.gitignore` | created |

## How it satisfies the scope
Matches `specs/architecture/host-compat-and-packaging.md` manifest. Test glob is quoted (bare `test/` fails on Node 24).

## Build & test results
```
$ npm test
tests 1, pass 1, fail 0

$ node -e 'import("./index.ts")...'   # root re-export
function
```

## Acceptance criteria
- [x] `npm test` exits 0 with the smoke test passing
- [x] `package.json` has both `omp.extensions` and `pi.extensions`
- [x] root `index.ts` re-exports the default factory (verified by dynamic import)

## Follow-ups / TODO(verify)
- Whether the manifest alone suffices for directory-copy installs on both hosts (live check, sprint-003 task-004).
