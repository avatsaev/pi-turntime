# Task 001 — Guard test: no host runtime imports

- **Sprint:** sprints/sprint-003-hardening-and-docs
- **Status:** done
- **Type:** test
- **Area:** packaging
- **Priority:** P2
- **Estimated size:** XS
- **Depends on:** task-004 (sprint-002)

## Goal
A test that fails if `src/` (or root `index.ts`) gains a runtime import of a host package.

## Context / why
A top-level runtime import of one host's package would break loading on the other host — the single most likely regression.

## Scope references
- `swe/specs/architecture/host-compat-and-packaging.md` § Error handling & edge cases, § Acceptance criteria
- `test/imports.test.ts` (create)

## What to build
Read every file in `src/` and root `index.ts`; assert no static `import`/`export … from` of `@earendil-works/*` or `@oh-my-pi/*` unless it is `import type`; the only allowed runtime reference is a dynamic `import("@oh-my-pi/pi-coding-agent/config/registry")` in `src/omp.ts`.

## Out of scope
Linting rules, AST tooling.

## Acceptance criteria
- [ ] Passes on the current tree.
- [ ] Temporarily adding `import { Text } from "@earendil-works/pi-tui"` to `src/pi.ts` makes it fail (verify manually, then revert).

## Test / verification plan
- `npm test` all pass; perform the manual negative check once.

## Notes
This guard is a source-text test by necessity (the invariant is about module syntax); it is the one deliberate exception to "no source-text tests".
