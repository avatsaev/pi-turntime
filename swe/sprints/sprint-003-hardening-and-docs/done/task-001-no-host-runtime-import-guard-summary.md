# Task 001 — Guard test: no host runtime imports — Summary

- **Sprint:** sprints/sprint-003-hardening-and-docs
- **Completed:** 2026-11-12
- **Status:** done

## What was implemented
`test/imports.test.ts` scans root `index.ts` and `src/*.ts` and fails on any static non-type import/export-from, or dynamic import/require, of `@earendil-works/*` or `@oh-my-pi/*`, except the dynamic `config/registry` import in `src/omp.ts`.

## Files created / changed
| File | Change |
|------|--------|
| `test/imports.test.ts` | created |

## How it satisfies the scope
`specs/architecture/host-compat-and-packaging.md` § Acceptance criteria (no non-type host import). Deliberate source-text test: the invariant is about module syntax.

## Build & test results
```
$ npm test
tests 28, pass 28, fail 0
```
Negative check (injected into `src/pi.ts`, then reverted; each run alone against the guard): static `import { Text } from "@earendil-works/pi-tui"`, side-effect `import "@oh-my-pi/pi-coding-agent"`, and `await import("@earendil-works/pi-tui")` each failed the guard. Tree reverted; guard passes again.

## Acceptance criteria
- [x] passes on the current tree
- [x] injected runtime host import makes it fail (verified manually, reverted)

## Follow-ups / TODO(verify)
- Regex scanner, not an AST; multi-line import specifiers are covered because `[^;]*?` spans lines, but unusual formatting is untested.
