# Task 002 — Typecheck gate

- **Sprint:** sprints/sprint-003-hardening-and-docs
- **Status:** done
- **Type:** chore
- **Area:** tooling
- **Priority:** P2
- **Estimated size:** S
- **Depends on:** task-004 (sprint-002)

## Goal
`npm run typecheck` runs `tsc --noEmit` over `src/` and `test/` against the real host type packages.

## Context / why
Type-only imports can silently drift from the hosts' real `ExtensionAPI`; the tests use fakes and won't notice.

## Scope references
- `swe/specs/architecture/host-compat-and-packaging.md` § TODO(verify) (type-only devDependencies)
- `package.json` (modify), `tsconfig.json` (create)

## What to build
- `devDependencies`: `typescript`, `@earendil-works/pi-coding-agent`, `@oh-my-pi/pi-coding-agent`, `@types/node` (confirm both host packages install from npm; if one does not, add a `paths` mapping to a local checkout or a minimal ambient `.d.ts` and record that in Notes).
- `tsconfig.json`: `noEmit`, `strict`, `module/moduleResolution: NodeNext` or `Bundler`, `allowImportingTsExtensions`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, `skipLibCheck`.
- `scripts.typecheck = tsc --noEmit`.
- Fix any type errors surfaced in `src/` (adapter code only; narrow fixes).
- Add a `swe/av-swe.config.json` with `"test": "npm test"`, `"typecheck": "npm run typecheck"`, `"skipGates": ["build","lint"]`.

## Out of scope
Linter, bundling.

## Acceptance criteria
- [ ] `npm run typecheck` exits 0.
- [ ] `npm test` still passes.
- [ ] Both host packages are `devDependencies` only (not `dependencies`).

## Test / verification plan
- `npm install`, `npm run typecheck`, `npm test`.

## Notes
Requires network for `npm install`. If an install is impossible, mark the task blocked with the reason.
