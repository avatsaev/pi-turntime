# pi-turntime — Overview

> Source of truth for what this effort is and how it fits together. Sub-specs describe the details;
> this file ties them together and indexes them.

## Purpose & scope

One extension package that shows the **total time of an agent turn** (prompt submitted → agent
yields) in the **stats row of the last assistant message**, on both hosts:

- **omp** (`@oh-my-pi/pi-coding-agent`, installed: omp 18.19.0)
- **pi** (`@earendil-works/pi-coding-agent`, installed: pi 1.5.0)

"Total turn time" = wall-clock from the moment the run begins to the moment it fully settles, so it
includes every model request, tool call, retry, and automatic continuation in between.

**Key finding (recon):** omp 18.19.0 already renders this natively. Its assistant-message usage row
supports `display.showTurnTime` ("Show the total prompt-to-yield time (including tool calls) on
assistant message usage rows", default `false`, Appearance → Display), and the row only exists when
`display.showTokenUsage` is on. pi 1.5.0 has **no** per-message stats row at all (its only "stats"
are the global footer line `↑in ↓out R W $ ctx%`) and nothing equivalent to `showTurnTime`. So:

| Host | Work required |
|------|---------------|
| omp | No rendering. The extension turns the native setting on, deferring to any explicit user config. |
| pi  | Real implementation: measure the turn, persist it as a non-context session entry, render a dim stats-style row directly under the last assistant message. |

Not in scope: per-request token/cost/throughput stats (omp already has them; pi's footer has totals),
a config file, slash commands, tools, anything model-visible.

## Tech stack & runtime requirements

| Concern | Choice |
|---------|--------|
| Language | TypeScript (ESM), no build step — both hosts load `.ts` directly |
| Run/business logic layers | Pure core (timer state machine + formatter) + two thin host adapters |
| Framework / build | None. `package.json` manifest with `omp.extensions` and `pi.extensions` |
| Persistence | pi: one `custom` session entry per settled run (not in LLM context). omp: none |
| Key external integrations | Host extension APIs only (`ExtensionAPI`); type-only imports, no runtime host imports at module top level |
| Tests | `node --test` with Node 24 native TS type stripping (node v24.22.2 present; `bun` is not on PATH) |

## High-level architecture

```
                 ┌────────────────────────────── src/index.ts ──────────────────────────────┐
 host loads ───▶ │ default export (api)                                                     │
 the module      │   isPi = typeof api.registerEntryRenderer === "function"                 │
                 │        ├── true  ──▶ pi adapter  (src/pi.ts)                             │
                 │        └── false ──▶ omp adapter (src/omp.ts)                            │
                 └──────────────────────────────────────────────────────────────────────────┘

 pi adapter                                         omp adapter
 ──────────                                         ───────────
 agent_start ─┐                                     session_start (main agent only)
              ├─▶ RunTimer (src/core.ts)              └─▶ dynamic import config/registry
 agent_settled┘        │ elapsedMs                         └─▶ lookup("display.showTurnTime")
                       ▼                                        .override(settings, true)   [if !isConfigured]
 api.appendEntry("pi-turntime.run", {...})              lookup("display.showTokenUsage")
                       │                                        .override(settings, true)   [if !isConfigured]
 registerEntryRenderer ─▶ dim row "Turn time 2m 05s"
   (live + on session replay)
```

## Module / directory map

| Path | Responsibility |
|------|----------------|
| `package.json` | name, `omp.extensions` / `pi.extensions` → `./src/index.ts`, `keywords: ["pi-package"]`, `type: module` |
| `src/index.ts` | Default factory; host detection; delegates to one adapter |
| `src/core.ts` | `RunTimer` state machine, `formatElapsed`, entry type constants (no host imports) |
| `src/pi.ts` | pi adapter: lifecycle wiring, `appendEntry`, `registerEntryRenderer` |
| `src/omp.ts` | omp adapter: native-setting enablement |
| `test/*.test.ts` | Unit tests for core + adapters against fake `ExtensionAPI` objects |
| `README.md` | Install on each host, behavior, how to opt out |

## Data model overview

pi only. One session entry per settled run:

```
type: "custom"
customType: "pi-turntime.run"
data: { elapsedMs: number, startedAt: number /* epoch ms */, aborted: boolean }
```

Full shape and rules: [features/pi-turn-time-row.md](features/pi-turn-time-row.md).

## External integrations & configuration

No config file and no env vars. Behavior toggles are the hosts' own settings:

| Name | Host | Meaning |
|------|------|---------|
| `display.showTurnTime` | omp | Native turn-time display. Extension sets it `true` at runtime only if unconfigured |
| `display.showTokenUsage` | omp | Native usage row (prerequisite for the above). Same rule |
| `--no-extensions` / `disabledExtensions: [extension-module:<name>]` | omp | How a user opts out |
| `/extensions` / package filter in `settings.json` | pi | How a user opts out |

## Build / run / test / deploy overview

- Build: none.
- Typecheck: `tsc --noEmit` with host packages as `devDependencies` (type-only) — see TODO(verify).
- Test: `node --test "test/**/*.test.ts"` (Node ≥ 22.6 strips types; local node is 24).
- Install (pi): `pi install <git or npm source>` or copy dir to `~/.pi/agent/extensions/turn-time/`.
- Install (omp): `omp -e <dir>`, `extensions:` in `~/.omp/agent/config.yml`, or copy to `~/.omp/agent/extensions/turn-time/`.
- Manual verification per host is part of acceptance (TUI surface).

## Sub-spec index

| File | Kind | Description |
|------|------|-------------|
| [features/turn-timer.md](features/turn-timer.md) | feature | Host-neutral definition of "total turn time", the `RunTimer` state machine, and the elapsed-time format |
| [features/pi-turn-time-row.md](features/pi-turn-time-row.md) | feature | pi: persisted entry + renderer producing the row under the last assistant message |
| [features/omp-native-turn-time.md](features/omp-native-turn-time.md) | feature | omp: enable the built-in `display.showTurnTime` without overriding user choices |
| [architecture/host-compat-and-packaging.md](architecture/host-compat-and-packaging.md) | architecture | Single package for two hosts: detection, imports, manifest, install paths, failure isolation |

## Open questions — TODO(verify)

- [ ] omp docs (`omp://`) do not document `display.showTurnTime`; it was found in the omp 18.19.0 binary only. Confirm with the user that relying on it is acceptable, and confirm it is shown on the **final** assistant message of a turn only (not on every tool-use message).
- [ ] pi: confirm `agent_settled` fires exactly once per prompt-to-yield window in all paths (abort, error, retry, compaction) by running a real session.
- [ ] pi: confirm the minimum pi version providing `registerEntryRenderer`, `appendEntry`, `agent_settled` (verified present in the 1.5.0 source checkout at `~/DEV/pi`; no earlier version checked).
- [ ] omp: `pi.pi.settings` and `@oh-my-pi/pi-coding-agent/config/registry` are documented in `omp://extensions.md`; confirm both resolve for an extension loaded from a user directory in 18.19.0.
- [ ] Row glyph/wording (`Turn time 2m 05s`) — chosen to avoid ambiguous-width emoji; confirm taste.
- [ ] Older omp without `display.showTurnTime`: spec'd as a no-op with one warning. Say so if a fallback renderer (`registerAssistantTextRenderer`, opt-in setting) is wanted instead.
