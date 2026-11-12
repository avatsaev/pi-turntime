# Task 003 — omp adapter: enable native turn time — Summary

- **Sprint:** sprints/sprint-002-host-adapters
- **Completed:** 2026-11-12
- **Status:** done

## What was implemented
`registerOmp(api, load?)` in `src/omp.ts`. On `session_start` for the main agent only, it dynamically loads the config registry (injectable loader), warns once if `display.showTurnTime` is unknown, else overrides `display.showTokenUsage` and `display.showTurnTime` to `true` in the runtime layer when `!isConfigured(api.pi.settings)`. Everything is wrapped in try/catch; failures go to `api.logger?.warn?.()` best-effort.

## Files created / changed
| File | Change |
|------|--------|
| `src/omp.ts` | created |
| `test/omp.test.ts` | created (5 tests) |

## How it satisfies the scope
Follows `specs/features/omp-native-turn-time.md`. API shapes (`lookup`, `isConfigured`, `override`, `pi.pi.settings` → `api.pi.settings`, `ctx.agent.kind`) taken from `omp://extensions.md` § Runtime setting overrides. Deviation: `pi.logger` is listed in the docs but its methods are not documented, so it is called optionally.

## Build & test results
```
$ npm test
tests 25, pass 25, fail 0
```

## Acceptance criteria
- [x] both unconfigured → both overridden once
- [x] `showTurnTime` configured → untouched; `showTokenUsage` handled independently
- [x] unknown `showTurnTime` → one warning, zero overrides
- [x] subagent → registry never loaded
- [x] loader rejecting → handler resolves

## Follow-ups / TODO(verify)
- Real `@oh-my-pi/pi-coding-agent/config/registry` resolution from an extension loaded from a user dir, and `display.showTurnTime` behavior: live check in sprint-003 task-004.
- `logger.warn` method name unverified.
