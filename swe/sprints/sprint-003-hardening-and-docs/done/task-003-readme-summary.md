# Task 003 — README — Summary

- **Sprint:** sprints/sprint-003-hardening-and-docs
- **Completed:** 2026-11-12
- **Status:** done

## What was implemented
`README.md`: what it does, omp vs pi behavior, install, disable, development.

## Files created / changed
| File | Change |
|------|--------|
| `README.md` | created |

## How it satisfies the scope
Commands checked against `pi --help` (`install`, `remove`, `-e`, `--no-extensions`) and `omp --help` (`-e`, `--no-extensions`). Behavior statements come from the specs; the omp `extensions:` config key and `~/.omp/agent/extensions/` directory are from the specs/omp docs and are not yet exercised (task-004).

## Build & test results
No commands to run (docs).

## Acceptance criteria
- [x] install/opt-out commands match specs or `--help` output
- [x] pi row vs omp native split stated clearly

## Follow-ups / TODO(verify)
- Re-check README after task-004: `extensions:` config key, directory-copy install, and "final message only" rendering on omp.
