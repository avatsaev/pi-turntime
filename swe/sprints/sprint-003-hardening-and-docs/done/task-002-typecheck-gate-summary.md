# Task 002 — Typecheck gate — Summary

- **Sprint:** sprints/sprint-003-hardening-and-docs
- **Completed:** 2026-11-12
- **Status:** done

## What was implemented
`tsc --noEmit` over `index.ts`, `src/`, `test/` against the real host type packages, plus `swe/av-swe.config.json` declaring the gates.

## Files created / changed
| File | Change |
|------|--------|
| `package.json` | added `scripts.typecheck`, devDependencies |
| `package-lock.json` | created by npm install |
| `tsconfig.json` | created (strict, NodeNext, `allowImportingTsExtensions`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUncheckedIndexedAccess`) |
| `swe/av-swe.config.json` | created |

## How it satisfies the scope
devDependencies only: `typescript@7.0.2`, `@types/node`, `@earendil-works/pi-coding-agent@1.5.2`, `@oh-my-pi/pi-coding-agent@18.19.0` — both host packages install from npm (closes that spec TODO). Existing adapter code typechecked clean with no source changes.

## Build & test results
```
$ npm run typecheck
(no output, exit 0)

$ npm test
tests 28, pass 28, fail 0
```
Negative proof (reverted): `event.aborted`→`event.nope` in `src/pi.ts` gave `TS2339 ... 'AgentSettledEvent'`; `ctx.agent.kind`→`ctx.agent.nope` in `src/omp.ts` gave `TS2339 ... 'ExtensionAgentIdentity'`, so both hosts' real types are being checked.

## Acceptance criteria
- [x] `npm run typecheck` exits 0
- [x] `npm test` still passes
- [x] both host packages are `devDependencies` only

## Follow-ups / TODO(verify)
- Typechecked against pi 1.5.2 types, while the installed pi binary is 1.5.0.
- npm warned about unapproved install scripts of transitive deps (`@google/genai`, `protobufjs`); not needed for typechecking.
- `registerOmp` still uses `any` for the registry handle (registry types not imported to keep that module dynamic).
