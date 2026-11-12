# Task 001 — Package scaffold & green test harness

- **Sprint:** sprints/sprint-001-skeleton-and-core
- **Status:** done
- **Type:** chore
- **Area:** packaging
- **Priority:** P1
- **Estimated size:** XS
- **Depends on:** none

## Goal
A loadable package skeleton with a working `npm test` that runs TypeScript tests directly on Node 24.

## Context / why
Every later task is gated on a runnable test command. Hosts load `.ts` directly, so there is no build step.

## Scope references
- `swe/specs/architecture/host-compat-and-packaging.md` § Public contract (manifest)
- `swe/specs/overview.md` § Tech stack, § Build / run / test
- `package.json` (create), `src/index.ts` (create stub), `index.ts` (create re-export), `test/smoke.test.ts` (create), `.gitignore` (create)

## What to build
- `package.json`: `name: pi-turntime`, `type: module`, `private: true`, `keywords: ["pi-package"]`, `omp.extensions` and `pi.extensions` both `["./src/index.ts"]`, `scripts.test = node --test "test/**/*.test.ts"`. No runtime dependencies.
- `src/index.ts`: `export default function (_api: unknown): void {}` (stub; real dispatch lands in sprint-002 task-004).
- Root `index.ts`: `export { default } from "./src/index.ts";` so a plain directory copy loads on both hosts.
- `test/smoke.test.ts`: one trivial `node:test` assertion that imports `../src/index.ts` and checks the default export is a function.
- `.gitignore`: `node_modules/`.
- Note: use relative imports **with the `.ts` extension** everywhere (Node type stripping requires it). Quote the test glob; `node --test test/` does NOT work on Node 24.

## Out of scope
Typecheck setup (sprint-003 task-002), any real logic.

## Acceptance criteria
- [ ] `npm test` exits 0 and reports the smoke test passing.
- [ ] `package.json` contains both `omp.extensions` and `pi.extensions`.
- [ ] `index.ts` at root re-exports the default factory.

## Test / verification plan
- Tests: `npm test` — 1 test, pass.

## Notes
Node v24.22.2 is installed; `bun` is not on PATH. Type stripping rejects TS-only runtime syntax (enums, parameter properties, namespaces) — keep to erasable syntax throughout the project.
