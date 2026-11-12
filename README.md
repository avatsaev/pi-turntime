# pi-turntime

Shows the **total time of an agent turn** — from prompt submitted until the agent yields, including
every model request, tool call, retry and automatic continuation — in the stats row of the last
assistant message. One package, two hosts:

| Host | How the time is shown |
|------|-----------------------|
| **omp** (`@oh-my-pi/pi-coding-agent`) | omp already renders it natively (`display.showTurnTime`, off by default). The extension only turns that setting on for the session. It draws nothing itself. |
| **pi** (`@earendil-works/pi-coding-agent`) | pi has no per-message stats row, so the extension adds one: a dim `Turn time 2m 05s` line under the last assistant message (`(aborted)` is appended when you interrupted the run). |

## Behavior

### omp

On session start (main agent only) the extension sets `display.showTokenUsage` and
`display.showTurnTime` to `true` in omp's **in-memory** runtime settings layer, and only for settings
you have not configured yourself (env var, project, global or `--config` layers all win). Nothing is
written to disk, so removing the extension restores your persisted config.

The turn time is a field of omp's usage row, so the row must be on: if you set
`display.showTokenUsage: false`, no turn time is shown. To opt out while keeping the extension, set
`display.showTurnTime: false`.

`display.showTurnTime` is not described in omp's docs; it exists in omp 18.19.0. On an omp without
it the extension shows one warning and does nothing.

### pi

Each settled run appends one `custom` session entry (`pi-turntime.run`: `elapsedMs`, `startedAt`,
`aborted`). Custom entries are not part of the model's context. A registered entry renderer draws
the row live and again when the session is resumed. Retries and continuations are one turn, so you
get one row per prompt, not one per request.

Duration format: `0.8s`, `12.3s`, `2m 05s`, `1h 02m 05s`.

## Install

Repository: https://github.com/avatsaev/pi-turntime

### pi

```
pi install https://github.com/avatsaev/pi-turntime
```

### omp

Clone, then install from the local directory:

```
git clone https://github.com/avatsaev/pi-turntime.git
omp install ./pi-turntime
```

Or add the clone's path to the `extensions:` list in `~/.omp/agent/config.yml`, or place it under
`~/.omp/agent/extensions/`. Restart omp or open a new session to pick it up.

### Single run (either host)

```
git clone https://github.com/avatsaev/pi-turntime.git
pi  -e ./pi-turntime
omp -e ./pi-turntime
```

The package root has both an `omp.extensions` and `pi.extensions` manifest entry and a root
`index.ts`, so either host loads it as-is. No build step: both hosts load the `.ts` files directly.

## Disable

- pi: `pi remove https://github.com/avatsaev/pi-turntime` (or drop `-e`).
- omp: remove it from `extensions:` / drop `-e`, or set `display.showTurnTime: false`.
- Either host: `--no-extensions` starts without discovered extensions.

## Development

```
npm install
npm test            # node --test on Node >= 22.6 (native TypeScript type stripping)
npm run typecheck   # tsc --noEmit against the real host types
```

Source layout: `src/core.ts` (timer + formatter, no host imports), `src/pi.ts`, `src/omp.ts`,
`src/index.ts` (picks an adapter by checking for `registerEntryRenderer`, which only pi has). Host
packages are type-only `devDependencies`; a test fails if `src/` gains a runtime import of either
host, since that would break loading on the other.
