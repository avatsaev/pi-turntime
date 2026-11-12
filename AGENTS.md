# AGENTS.md

Guidance for AI coding agents working in this repo.

## What this is

`pi-turntime` is one extension package that loads in both **omp** (`@oh-my-pi/pi-coding-agent`) and
**pi** (`@earendil-works/pi-coding-agent`). It shows the total prompt-to-yield time of an agent turn in
the stats row of the last assistant message.

- **omp**: omp already renders this natively (`display.showTurnTime`, which needs
  `display.showTokenUsage`). The extension only turns those settings on at runtime, and only when the
  user has not configured them.
- **pi**: no such row exists, so the extension measures the turn, persists a `custom` session entry
  (`pi-turntime.run`), and renders a dim `Turn time 2m 05s` row with an entry renderer.

## Commands

```
npm install
npm test            # node --test "test/**/*.test.ts"
npm run typecheck   # tsc --noEmit against the real host types
```

Run both before calling a change done. There is no build step and no linter. Hosts load the `.ts`
files directly.

## Layout

| Path | Role |
|------|------|
| `index.ts` | Re-export of `src/index.ts`, so a plain directory copy loads |
| `src/index.ts` | Default factory; picks an adapter with `typeof api.registerEntryRenderer === "function"` (pi has it, omp does not) |
| `src/core.ts` | `RunTimer`, `formatElapsed`, `ENTRY_TYPE`. Pure: no host imports |
| `src/pi.ts` | pi adapter: `registerPi`, `renderRow` |
| `src/omp.ts` | omp adapter: `registerOmp` |
| `test/*.test.ts` | `node:test` tests against hand-rolled fake host APIs |
| `swe/` | av-swe plan: `PLAN.md`, `specs/`, `sprints/` |

## Rules that are easy to break

1. **No runtime imports of host packages.** `@earendil-works/*` and `@oh-my-pi/*` may only be
   imported with `import type`. The one exception is the dynamic
   `import("@oh-my-pi/pi-coding-agent/config/registry")` in `src/omp.ts`. A top-level runtime import
   breaks loading on the other host. `test/imports.test.ts` enforces this. Because of it, the pi row is
   an inline `{ render, invalidate }` component, not pi-tui's `Text`.
2. **No module-level mutable state.** omp rebinds the same factory to subagent sessions, so all state
   lives inside the `registerPi` / `registerOmp` call.
3. **Erasable TypeScript only.** Node strips types at runtime and `tsconfig.json` sets
   `erasableSyntaxOnly`: no enums, namespaces, or constructor parameter properties. Relative imports
   must include the `.ts` extension.
4. **Never throw out of a host event handler.** `appendEntry` failures and omp registry failures are
   swallowed on purpose.
5. **Respect user config on omp.** Only override a setting when `!handle.isConfigured(api.pi.settings)`.
   Overrides are in-memory and must never be persisted.
6. **Quote the test glob.** `node --test test/` fails on Node 24; the glob in `package.json` works.

## Turn-time semantics

A window opens at the first `agent_start` and closes at `agent_settled`, not `agent_end`, so retries,
compaction continuations, and queued follow-ups count as one turn. Nested `agent_start` calls are
ignored. `formatElapsed` floors (`59_999` ms is `59.9s`) and uses integer math, not `toFixed`.

## Testing notes

- Tests use fake `api` objects and injected clocks; do not add real network or host dependencies.
- Typecheck is the only check that validates the host API shapes, so run it after touching adapters.
- Live behavior was checked in a real pi 1.5.0 TUI (row renders under the final assistant message).
  omp live verification is still open; see `swe/PLAN.md` (sprint-003 task-004).

## Working with the plan

Work is tracked with av-swe under `swe/`. A task's folder (`backlog/`, `in_progress/`, `blocked/`,
`done/`) is its state; move files rather than editing `Status:` alone, keep `swe/PLAN.md` in sync,
and keep a `.gitkeep` in every state folder. Specs in `swe/specs/` are the source of truth for
behavior; update them if you change behavior.

## Local install (omp)

`omp install "$PWD"` links this directory into omp. Restart omp or open a new session to pick up
changes; the extension acts on `session_start`.
