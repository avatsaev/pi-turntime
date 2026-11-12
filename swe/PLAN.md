# Implementation Plan — pi-turntime

> Derived from the specs in `swe/specs/` (greenfield; no existing source). Sprints and tasks are in
> implementation order. Execute with `av-swe implement`, one sprint at a time.
> **Version:** 1 · **Updated:** 2026-11-12

## Strategy
Bottom-up. Sprint 001 produces a runnable package with a green `npm test` on Node 24 (native TS type
stripping, no build) plus the pure, host-neutral core (`RunTimer`, `formatElapsed`). Sprint 002 adds
the two thin host adapters on top of the core (pi: measure + persist + render; omp: enable the
native setting) and the feature-detection dispatch that picks one. Sprint 003 hardens: a guard
against host runtime imports (the main cross-host regression risk), a typecheck gate against the real
host types, the README, and live verification in real pi and omp TUIs, which closes the spec
TODO(verify) items.

## Sprint overview
| # | Sprint | Goal | Tasks |
|---|--------|------|-------|
| 001 | `sprints/sprint-001-skeleton-and-core` | Runnable package, green tests, tested timer + formatter | 3 |
| 002 | `sprints/sprint-002-host-adapters` | pi row and omp enablement wired and dispatched by host | 4 |
| 003 | `sprints/sprint-003-hardening-and-docs` | Import guard, typecheck, README, live host verification | 4 |

## Task index
### sprints/sprint-001-skeleton-and-core
| Task | Title | Type | Area | Depends on | Covers (specs + source) |
|------|-------|------|------|-----------|------------------------|
| task-001 | Package scaffold & green test harness | chore | packaging | none | architecture/host-compat-and-packaging.md · `package.json`, `index.ts`, `src/index.ts`, `test/smoke.test.ts` |
| task-002 | RunTimer state machine | feature | core | task-001 | features/turn-timer.md · `src/core.ts` |
| task-003 | formatElapsed | feature | core | task-002 | features/turn-timer.md · `src/core.ts` |

### sprints/sprint-002-host-adapters
| Task | Title | Type | Area | Depends on | Covers (specs + source) |
|------|-------|------|------|-----------|------------------------|
| task-001 | pi adapter: lifecycle wiring & persistence | feature | pi adapter | sprint-001/task-002 | features/pi-turn-time-row.md · `src/pi.ts` |
| task-002 | pi adapter: entry renderer | feature | pi adapter | task-001, sprint-001/task-003 | features/pi-turn-time-row.md · `src/pi.ts` |
| task-003 | omp adapter: enable native turn time | feature | omp adapter | sprint-001/task-001 | features/omp-native-turn-time.md · `src/omp.ts` |
| task-004 | Host detection & dispatch | feature | packaging | task-002, task-003 | architecture/host-compat-and-packaging.md · `src/index.ts` |

### sprints/sprint-003-hardening-and-docs
| Task | Title | Type | Area | Depends on | Covers (specs + source) |
|------|-------|------|------|-----------|------------------------|
| task-001 | Guard test: no host runtime imports | test | packaging | sprint-002/task-004 | architecture/host-compat-and-packaging.md · `test/imports.test.ts` |
| task-002 | Typecheck gate | chore | tooling | sprint-002/task-004 | architecture/host-compat-and-packaging.md (TODO verify) · `tsconfig.json`, `package.json`, `swe/av-swe.config.json` |
| task-003 | README | docs | docs | sprint-002/task-004 | overview.md · `README.md` |
| task-004 | Live verification on pi and omp | test | acceptance | task-002, sprint-002/task-004 | all feature specs' acceptance + TODO(verify) |

## Coverage check
| Spec / module | Covered by |
|---------------|-----------|
| specs/overview.md | s003/task-003 (README), s003/task-004 (open questions) |
| specs/features/turn-timer.md | s001/task-002, s001/task-003 |
| specs/features/pi-turn-time-row.md | s002/task-001, s002/task-002, s003/task-004 |
| specs/features/omp-native-turn-time.md | s002/task-003, s003/task-004 |
| specs/architecture/host-compat-and-packaging.md | s001/task-001, s002/task-004, s003/task-001, s003/task-002, s003/task-004 |

No gaps. Not planned (spec "not in scope"): per-turn token stats on pi, config file, commands, fallback
renderer on omp versions lacking `display.showTurnTime`.

## Open questions — TODO(verify)
- [ ] omp's `display.showTurnTime` is undocumented (found in the 18.19.0 binary); confirm acceptable and that it shows on the final assistant message only (s003/task-004).
- [ ] pi `agent_settled` fires exactly once per prompt-to-yield window in abort/error/retry/compaction paths (s003/task-004).
- [ ] omp `pi.pi.settings` / `config/registry` resolve for a user-directory extension in 18.19.0 (s002/task-003, s003/task-004).
- [ ] Both host type packages are installable from npm for typechecking (s003/task-002).
- [ ] Row wording `Turn time 2m 05s` is the desired taste.

## Planning notes
- Corrections made to the specs while planning: test command is `node --test "test/**/*.test.ts"` (a bare `test/` directory argument fails on Node 24); the pi row renderer is an inline `Component` with no runtime `@earendil-works/pi-tui` import, because a runtime host import would break loading on omp.
- No `swe/av-swe.config.json` yet: sprints 001–002 gate on `npm test` from `package.json`; the typecheck gate is added in s003/task-002.
