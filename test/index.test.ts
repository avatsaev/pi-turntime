import test from "node:test";
import assert from "node:assert/strict";
import factory from "../src/index.ts";

function fakeApi(withRenderer: boolean) {
	const events: string[] = [];
	const renderers: string[] = [];
	const api: any = {
		pi: { settings: {} },
		on(name: string) {
			events.push(name);
			return () => {};
		},
		appendEntry() {
			throw new Error("appendEntry must not be called at load");
		},
	};
	if (withRenderer) api.registerEntryRenderer = (type: string) => void renderers.push(type);
	return { api, events, renderers };
}

test("index: pi-shaped api gets the pi adapter", () => {
	const f = fakeApi(true);
	assert.equal(factory(f.api), undefined);
	assert.deepEqual(f.renderers, ["pi-turntime.run"]);
	assert.ok(f.events.includes("agent_start") && f.events.includes("agent_settled"));
	assert.ok(f.events.includes("session_start") && f.events.includes("session_shutdown"));
});

test("index: omp-shaped api gets only the omp session_start handler", () => {
	const f = fakeApi(false);
	factory(f.api);
	assert.deepEqual(f.events, ["session_start"]);
	assert.deepEqual(f.renderers, []);
});
