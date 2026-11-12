# Task 003 — omp adapter: enable native turn time

- **Sprint:** sprints/sprint-002-host-adapters
- **Status:** done
- **Type:** feature
- **Area:** omp adapter
- **Priority:** P1
- **Estimated size:** S
- **Depends on:** task-001 (sprint-001)

## Goal
`src/omp.ts` exports `registerOmp(api)` which, on main-session start, turns on `display.showTokenUsage` and `display.showTurnTime` in the runtime settings layer unless the user already configured them.

## Context / why
omp 18.19.0 already renders turn time natively; the extension only flips the settings, respecting explicit user choices.

## Scope references
- `swe/specs/features/omp-native-turn-time.md` (all)
- omp docs: `omp://extensions.md` § Runtime setting overrides (read it first to confirm `lookup`, `isConfigured`, `override`, `pi.pi.settings`, `ctx.agent.kind`)
- `src/omp.ts` (create), `test/omp.test.ts` (create)

## What to build
- `export function registerOmp(api: ExtensionAPI, load = () => import("@oh-my-pi/pi-coding-agent/config/registry")): void` — the loader is injectable for tests; the default is the **dynamic** import (never top-level).
- `session_start` handler (async): return if `ctx.agent.kind !== "main"`; load registry; `lookup("display.showTurnTime")` undefined → one `ctx.ui.notify(..., "warning")` and return; for ids `display.showTokenUsage`, `display.showTurnTime`: if handle exists and `!handle.isConfigured(api.pi.settings)` → `handle.override(api.pi.settings, true)`.
- Whole handler in try/catch; on failure log via `api.logger.warn` (verify it exists in omp docs; otherwise swallow) and never throw.
- `import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent"` only.

## Out of scope
Fallback renderer for omp versions lacking the setting; any persisted setting writes.

## Acceptance criteria
- [ ] Both unconfigured → both `override(..., true)` called once each.
- [ ] `display.showTurnTime` configured → not overridden; `showTokenUsage` still handled independently.
- [ ] `lookup("display.showTurnTime")` undefined → exactly one warning, zero overrides.
- [ ] `ctx.agent.kind === "sub"` → registry never loaded.
- [ ] Loader rejecting → handler resolves without throwing.

## Test / verification plan
- Tests: `test/omp.test.ts` with fake api/ctx/registry; `npm test` all pass.

## Notes
TODO(verify) from spec: confirm `api.pi.settings` is the right scope argument in a live omp (sprint-003 task-004).
