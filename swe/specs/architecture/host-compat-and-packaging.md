# Architecture — Host compatibility & packaging

> Part of: [overview.md](../overview.md)
> Dependencies: [../features/pi-turn-time-row.md](../features/pi-turn-time-row.md), [../features/omp-native-turn-time.md](../features/omp-native-turn-time.md)

## Purpose

Ship **one package** that loads cleanly in both omp and pi, picks the right adapter at runtime, and
can never break either host at load time.

## Public contract

Both hosts import the module and call the default export with their `ExtensionAPI`:

```ts
export default function (api: ExtensionAPI): void;   // sync; no awaits at load
```

Manifest (`package.json`; both keys are read by their host, the other host ignores them):

```json
{
  "name": "pi-turntime",
  "type": "module",
  "keywords": ["pi-package"],
  "omp": { "extensions": ["./src/index.ts"] },
  "pi":  { "extensions": ["./src/index.ts"] }
}
```

Host detection (feature-based, not process-name based):

| Probe | Meaning |
|-------|---------|
| `typeof api.registerEntryRenderer === "function"` | pi (this method is in pi's `ExtensionAPI`; omp's documented API has no such method) |
| otherwise | omp |

Types: `import type { ExtensionAPI } from "@earendil-works/pi-coding-agent"` in `src/pi.ts` and
`"@oh-my-pi/pi-coding-agent"` in `src/omp.ts`. **Type-only** imports are erased at load; neither host
package is a runtime dependency. The sole runtime host import is the dynamic
`import("@oh-my-pi/pi-coding-agent/config/registry")` inside the omp adapter, executed only under omp.

## Behavior & algorithms

```
default export(api):
    if typeof api.registerEntryRenderer == "function": registerPi(api)
    else:                                                registerOmp(api)
```

Load-time rules (from both hosts' docs): register during the factory; do **not** start timers or
sockets there; perform runtime actions (`appendEntry`, settings overrides, `notify`) only inside event
handlers; keep state per factory invocation (no module-level mutable state), because omp rebinds
the same imported factory to child sessions and pi replaces the runtime on reload.

Install paths:

| Host | Ways |
|------|------|
| pi | `pi install <source>` (package gallery via `pi-package` keyword); or directory in `~/.pi/agent/extensions/turn-time/` (loaded via `index.ts`) |
| omp | `omp -e <dir>`; `extensions:` list in `~/.omp/agent/config.yml`; or directory in `~/.omp/agent/extensions/turn-time/`; omp also accepts the `pi.extensions` manifest key as legacy |

A directory used as an extension needs an `index.ts` at its root **or** a manifest entry; the package
root should therefore also contain `index.ts` re-exporting `./src/index.ts` to support plain
directory copy (TODO(verify) whether the manifest alone suffices on both hosts).

## Data & persistence touchpoints

None beyond what feature specs define.

## Error handling & edge cases

| Condition | Expected behavior |
|-----------|-------------------|
| Both `omp` and `pi` manifest keys present | Hosts read only their own; omp prefers `omp` over `pi` |
| Both hosts installed, same package linked to each | Each loads independently; no shared state |
| Detection misfires (host adds/removes `registerEntryRenderer`) | pi would fall to the omp adapter, whose dynamic import fails inside a try/catch → logged, inert; never a load failure |
| Host package import at top level | Forbidden (would fail load on the other host); enforced by a test that greps `src/` for non-`import type` host imports |
| Extension runs in subagent sessions (omp) | omp adapter filters by `ctx.agent.kind` |

## Dependencies on other specs

- [../features/pi-turn-time-row.md](../features/pi-turn-time-row.md)
- [../features/omp-native-turn-time.md](../features/omp-native-turn-time.md)
- [../features/turn-timer.md](../features/turn-timer.md)

## Acceptance criteria

- [ ] Given the package is loaded by pi 1.5.0, then startup shows no extension load error and the pi adapter is active.
- [ ] Given the package is loaded by omp 18.19.0 (`omp -e <dir>`), then startup shows no extension load error and the omp adapter is active.
- [ ] Given `src/` is scanned, then no non-type import of `@earendil-works/*` or `@oh-my-pi/*` exists except the dynamic registry import in `src/omp.ts`.
- [ ] Given a fake pi `api` (has `registerEntryRenderer`) vs fake omp `api` (lacks it), then `index.ts` registers the pi adapter vs the omp adapter respectively.
- [ ] Given `node --test "test/**/*.test.ts"`, then core, pi-adapter and omp-adapter tests pass on Node 24.

## TODO(verify)

- [ ] Type-only devDependencies: confirm `@earendil-works/pi-coding-agent` and `@oh-my-pi/pi-coding-agent` are installable from npm for typechecking (the former exists in this machine's bun cache; the latter is referenced in omp docs).
- [ ] Whether `pi install` of a plain git repo with the manifest above needs `node_modules` (no runtime deps, so expected not).
