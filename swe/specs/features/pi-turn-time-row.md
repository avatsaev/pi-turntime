# Feature — pi: turn-time row under the last assistant message

> Part of: [overview.md](../overview.md)
> Dependencies: [turn-timer.md](turn-timer.md), [../architecture/host-compat-and-packaging.md](../architecture/host-compat-and-packaging.md)

## Purpose

pi has no per-message stats row (its footer shows session totals only), so this adapter creates the
closest equivalent: a dim, single-line stats-style row rendered **immediately below the last
assistant message of the turn** showing total turn time. It must survive session resume and must
never enter the model's context.

## Public contract

pi extension APIs used (all verified present in pi 1.5.0 source at `~/DEV/pi/packages/coding-agent`):

| API | Use |
|-----|-----|
| `pi.on("agent_start", h)` | open the timing window |
| `pi.on("agent_settled", h)` — event `{ aborted: boolean }` | close the window, persist the record |
| `pi.on("session_start", h)` | `RunTimer.reset()` (new / resumed / forked / reloaded session) |
| `pi.on("session_shutdown", h)` | `RunTimer.reset()` |
| `pi.appendEntry(customType, data)` | persist a `custom` entry; excluded from LLM context |
| `pi.registerEntryRenderer(customType, renderer)` | draw the row live and on replay |

Entry:

```
customType: "pi-turntime.run"          (ENTRY_TYPE)
data: { elapsedMs: number, startedAt: number, aborted: boolean }
```

Renderer output (a pi-tui `Component` — `{ render(width): string[]; invalidate?(): void }` — implemented inline with **no runtime `@earendil-works/pi-tui` import**, one leading space of padding, theme `dim` foreground, hard-truncated to `width` so it can never overflow the terminal):

```
Turn time 2m 05s              # completed
Turn time 2m 05s (aborted)    # data.aborted === true
```

Per pi's contract the host owns spacing (it adds a one-row spacer above); the renderer returns only
the text line. Returns `undefined` (draws nothing) when `data` is missing/invalid
(`elapsedMs` not a finite number ≥ 0).

## Behavior & algorithms

```
on agent_start:        timer.start()
on agent_settled(e):   rec = timer.stop(e.aborted)
                       if rec: pi.appendEntry(ENTRY_TYPE, rec)
on session_start|session_shutdown: timer.reset()

renderer(entry, opts, theme):
    d = entry.data
    if !valid(d): return undefined
    text = "Turn time " + formatElapsed(d.elapsedMs) + (d.aborted ? " (aborted)" : "")
    return { render(w) { return [" " + theme.fg("dim", truncate(text, w - 1))] }, invalidate() {} }
```

Why `agent_settled` and not `agent_end`: settle fires only after no retry, recovery, compaction retry
or queued continuation will follow, so the entry lands exactly once, after the last assistant message
of the whole turn. `appendEntry` while idle emits `entry_appended`, which interactive mode renders
live via the registered entry renderer; the same renderer runs when entries are replayed on resume.

## Data & persistence touchpoints

- Session JSONL gains one `custom` entry per settled run. Not part of LLM context (pi docs:
  "Custom entries do not participate in LLM context").
- No migrations. Removing the extension leaves inert entries that pi simply does not render.

## Error handling & edge cases

| Condition | Expected behavior |
|-----------|-------------------|
| Non-interactive modes (print/json/rpc) | Entry still appended (cheap, harmless); no UI |
| Run aborted with Escape | Row shows `(aborted)` with time up to abort |
| Very short run (< 1 s) | Row still shown, e.g. `Turn time 0.8s` (no threshold; there is no config) |
| `agent_settled` without matching `agent_start` (e.g. extension loaded mid-run) | `stop` returns `undefined`; nothing emitted |
| Renderer receives malformed data | Draw nothing; never throw |
| Handler throws | Must not happen; handlers are try/catch-free trivial code, but `appendEntry` failure must not break the session — wrap and swallow with `pi.logger`-equivalent if available |
| Multiple runs back to back | One independent row per run |
| Subagent/child sessions | Their own sessions, their own timer instance (state is per factory invocation, no module globals) |

## Dependencies on other specs

- [turn-timer.md](turn-timer.md) — measurement and formatting.
- [host-compat-and-packaging.md](../architecture/host-compat-and-packaging.md) — how this adapter gets selected.

## Acceptance criteria

- [ ] Given a pi session, when a prompt that uses tools completes, then a dim `Turn time …` row appears directly under the final assistant message, once, and `elapsedMs` approximates the wall-clock time between submit and yield (±1 s).
- [ ] Given a run that triggers an automatic retry or compaction continuation, then exactly one row appears and its time spans the whole sequence.
- [ ] Given Escape during a run, then the row reads `… (aborted)`.
- [ ] Given the session is resumed, then every past run's row is redrawn in the same position.
- [ ] Given the session is inspected via `/session` or the JSONL, then the entries are `custom` type and absent from the provider request context.
- [ ] Given the extension is run under omp, then no `appendEntry` call is made (see [omp-native-turn-time.md](omp-native-turn-time.md)).

## TODO(verify)

- [ ] Resume replay position: entry replay path (`addCustomEntryToChat` from `interactive-mode.ts`) was read, not run; confirm the replayed row sits under the right assistant message.
- [ ] Whether `agent_settled` also fires for runs started by `pi.sendMessage(..., { triggerTurn: true })` with no user prompt (expected yes).
- [ ] Optional parity extra: add per-turn token counts (`↑in ↓out`) to the row to mimic omp's usage row. Out of scope unless requested.
