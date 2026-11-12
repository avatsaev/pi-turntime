# Feature — omp: enable the native turn-time display

> Part of: [overview.md](../overview.md)
> Dependencies: [../architecture/host-compat-and-packaging.md](../architecture/host-compat-and-packaging.md)

## Purpose

omp 18.19.0 already draws total prompt-to-yield time in the usage row of the last assistant message
when `display.showTokenUsage` and `display.showTurnTime` are both on. Re-implementing it would
duplicate a built-in and fight its layout. This adapter only ensures the settings are on, **without
overriding anything the user configured**. (On the dev machine `display.showTokenUsage: true` is set
in `~/.omp/agent/config.yml` and `display.showTurnTime` is unset, so installing the extension is the
whole change needed.)

## Public contract

omp APIs used (documented in `omp://extensions.md`, "Runtime setting overrides"):

| API | Use |
|-----|-----|
| `pi.on("session_start", (e, ctx) => …)` | run once per main session |
| `ctx.agent.kind` | skip subagents (`"sub"`); only `"main"` acts |
| `await import("@oh-my-pi/pi-coding-agent/config/registry")` → `lookup(id)` | resolve typed setting handles; dynamic so pi never evaluates it |
| `handle.isConfigured(pi.pi.settings)` | `true` when env/project/global/overlay/runtime layer already supplies a value |
| `handle.override(pi.pi.settings, value)` | in-memory runtime layer, never persisted |
| `ctx.ui.notify(msg, level)` | one warning when the native setting does not exist |

Settings touched:

| Id | Value set | Condition |
|----|-----------|-----------|
| `display.showTokenUsage` | `true` | handle exists **and** `!isConfigured` |
| `display.showTurnTime` | `true` | handle exists **and** `!isConfigured` |

## Behavior & algorithms

```
on session_start(_, ctx):
    if ctx.agent.kind != "main": return
    try:
        { lookup } = await import("@oh-my-pi/pi-coding-agent/config/registry")
        turn = lookup("display.showTurnTime")
        if turn is undefined:
            ctx.ui.notify("pi-turntime: this omp has no display.showTurnTime; nothing to enable", "warning")
            return
        for id in ["display.showTokenUsage", "display.showTurnTime"]:
            h = lookup(id)
            if h and not h.isConfigured(pi.pi.settings):
                h.override(pi.pi.settings, true)
    catch err:
        pi.logger.warn(...)   # never throw out of the handler
```

Rationale for also forcing `showTokenUsage`: the turn time is a field of the usage row; with the row
off there is nothing to display it in. Because both writes respect `isConfigured`, an explicit
`false` in the user's settings (or env) always wins and the extension then does nothing visible.

Overrides live in the in-memory runtime layer only, so uninstalling the extension returns omp to the
user's persisted config on the next start. Re-running on every `session_start` is idempotent.

## Data & persistence touchpoints

None. No session entries, no files written.

## Error handling & edge cases

| Condition | Expected behavior |
|-----------|-------------------|
| Older omp lacking `display.showTurnTime` | One `warning` notification, no further action |
| `config/registry` subpath fails to import | Caught, logged via `pi.logger`, session continues |
| User set `display.showTurnTime: false` explicitly | `isConfigured` is true → untouched; no row |
| User set `display.showTokenUsage: false` explicitly | Left off; turn time cannot show; documented in README |
| Subagent / `/tan` clone session | Skipped via `ctx.agent.kind` |
| Non-TUI modes (print/rpc) | Override is harmless; `ctx.ui.notify` is a no-op/default |
| Hook already active elsewhere | Idempotent: `override` of the same value is a no-op in effect |

## Dependencies on other specs

- [host-compat-and-packaging.md](../architecture/host-compat-and-packaging.md) — selects this adapter; mandates dynamic import.

## Acceptance criteria

- [ ] Given omp 18.19.0 with `display.showTokenUsage: true` and `display.showTurnTime` unset, when a turn completes, then the last assistant message's usage row includes the turn time.
- [ ] Given `display.showTurnTime: false` in config, then the extension changes nothing and no turn time shows.
- [ ] Given the extension is removed and omp restarted, then behavior reverts to the persisted config (the override was never saved).
- [ ] Given a task-tool subagent session, then the extension performs no lookup/override.
- [ ] Given a fake omp whose `lookup("display.showTurnTime")` returns `undefined`, then exactly one warning is emitted and no override is attempted.

## TODO(verify)

- [ ] Confirm in a live omp 18.19.0 TUI which row actually carries the time (observed in the binary: usage row of an assistant message gated by `showTokenUsage && showTurnTime`) and that it shows on the final message only.
- [ ] Confirm `pi.pi.settings` is the correct scope argument for `lookup(...).override` in 18.19.0 (documented in `omp://extensions.md`; not exercised yet).
