# Task 001 — pi adapter: lifecycle wiring & persistence — Summary

- **Sprint:** sprints/sprint-002-host-adapters
- **Completed:** 2026-11-12
- **Status:** done

## What was implemented
`registerPi(api, now?)` in `src/pi.ts`: `agent_start` opens the window, `agent_settled` closes it and appends one `pi-turntime.run` custom entry (errors swallowed), `session_start`/`session_shutdown` reset. Timer is created per call (no module state). Type-only import of pi's `ExtensionAPI`.

## Files created / changed
| File | Change |
|------|--------|
| `src/pi.ts` | created |
| `test/pi.test.ts` | created (7 tests) |

## How it satisfies the scope
Matches `specs/features/pi-turn-time-row.md` § Behavior. Event names/signatures checked against `~/DEV/pi/packages/coding-agent/src/core/extensions/types.ts` (`agent_start` L1646, `agent_settled` L1652, `session_start` L1606, `session_shutdown` L1622, `appendEntry` L1751).

## Build & test results
```
$ npm test
tests 16, pass 16, fail 0
```

## Acceptance criteria
- [x] start, +3 s, settle → one `appendEntry` with `{3000, startedAt, false}`
- [x] nested starts → one entry spanning both
- [x] settle without start → none
- [x] session_start/shutdown mid-window → none
- [x] appendEntry throwing does not propagate
- [x] aborted recorded
- [x] independent state per call

## Follow-ups / TODO(verify)
- Not yet typechecked against real pi types (sprint-003 task-002); not yet run in a live pi (task-004).
