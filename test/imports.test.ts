import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Source-text guard: a top-level runtime import of one host's package would break loading on the
// other host. The invariant is about module syntax, so it can only be checked on the source.
const root = join(import.meta.dirname, "..");
const files = [
	join(root, "index.ts"),
	...readdirSync(join(root, "src")).filter((f) => f.endsWith(".ts")).map((f) => join(root, "src", f)),
];
const HOST = /@(?:earendil-works|oh-my-pi)\//;
const ALLOWED_DYNAMIC = '"@oh-my-pi/pi-coding-agent/config/registry"';

test("no runtime imports of host packages outside the allowed dynamic omp registry import", () => {
	const offenders: string[] = [];
	for (const file of files) {
		const src = readFileSync(file, "utf8");
		const rel = file.slice(root.length + 1);
		// Static imports/exports (side-effect, default, named, `export … from`), type-only excluded.
		const staticRe = /^\s*(import|export)\s+(type\s+)?([^;]*?\s+from\s+)?["']([^"']+)["']/gm;
		for (const m of src.matchAll(staticRe)) {
			if (HOST.test(m[4]!) && !m[2]) offenders.push(`${rel}: static ${m[0].trim()}`);
		}
		// Dynamic imports / require.
		for (const m of src.matchAll(/(?:\bimport|\brequire)\s*\(\s*(["'][^"']+["'])/g)) {
			if (HOST.test(m[1]!) && !(rel === "src/omp.ts" && m[1] === ALLOWED_DYNAMIC)) {
				offenders.push(`${rel}: dynamic ${m[0]}`);
			}
		}
	}
	assert.deepEqual(offenders, []);
});
