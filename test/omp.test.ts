import test from "node:test";
import assert from "node:assert/strict";
import { registerOmp } from "../src/omp.ts";

const SETTINGS = { tag: "settings" };

function handle(configured: boolean) {
	const overrides: unknown[][] = [];
	return {
		overrides,
		isConfigured: (scope: unknown) => (assert.equal(scope, SETTINGS), configured),
		override: (...args: unknown[]) => void overrides.push(args),
	};
}

function setup(registry: Record<string, ReturnType<typeof handle> | undefined>, opts: { loadFails?: boolean; kind?: string } = {}) {
	let session: ((e: unknown, ctx: any) => Promise<void>) | undefined;
	const notes: Array<[string, string]> = [];
	let loads = 0;
	const api: any = {
		pi: { settings: SETTINGS },
		on(name: string, h: any) {
			if (name === "session_start") session = h;
			return () => {};
		},
	};
	registerOmp(api, async () => {
		loads++;
		if (opts.loadFails) throw new Error("no registry");
		return { lookup: (id: string) => registry[id] };
	});
	const ctx = { agent: { kind: opts.kind ?? "main" }, ui: { notify: (m: string, l: string) => notes.push([m, l]) } };
	return { start: () => session!({}, ctx), notes, loads: () => loads };
}

test("omp: unconfigured settings are both overridden to true", async () => {
	const usage = handle(false);
	const turn = handle(false);
	await setup({ "display.showTokenUsage": usage, "display.showTurnTime": turn }).start();
	assert.deepEqual(usage.overrides, [[SETTINGS, true]]);
	assert.deepEqual(turn.overrides, [[SETTINGS, true]]);
});

test("omp: user-configured settings are never overridden, others still handled", async () => {
	const usage = handle(false);
	const turn = handle(true);
	await setup({ "display.showTokenUsage": usage, "display.showTurnTime": turn }).start();
	assert.equal(turn.overrides.length, 0);
	assert.equal(usage.overrides.length, 1);
});

test("omp: missing display.showTurnTime warns once and overrides nothing", async () => {
	const usage = handle(false);
	const s = setup({ "display.showTokenUsage": usage });
	await s.start();
	assert.equal(s.notes.length, 1);
	assert.equal(s.notes[0]![1], "warning");
	assert.equal(usage.overrides.length, 0);
});

test("omp: subagent sessions never load the registry", async () => {
	const s = setup({}, { kind: "sub" });
	await s.start();
	assert.equal(s.loads(), 0);
});

test("omp: loader failure is swallowed", async () => {
	const s = setup({}, { loadFails: true });
	await assert.doesNotReject(s.start());
});
