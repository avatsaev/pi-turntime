import test from "node:test";
import assert from "node:assert/strict";
import { registerPi, renderRow } from "../src/pi.ts";

type Handler = (event: any, ctx?: any) => unknown;

function fakePi(opts: { appendThrows?: boolean } = {}) {
	const handlers = new Map<string, Handler>();
	const appended: Array<{ type: string; data: unknown }> = [];
	const renderers = new Map<string, (...args: any[]) => any>();
	const api: any = {
		registerEntryRenderer(type: string, r: (...args: any[]) => any) {
			renderers.set(type, r);
		},
		on(name: string, h: Handler) {
			handlers.set(name, h);
			return () => {};
		},
		appendEntry(type: string, data: unknown) {
			if (opts.appendThrows) throw new Error("disk full");
			appended.push({ type, data });
		},
	};
	const fire = (name: string, event: unknown = {}) => handlers.get(name)?.(event);
	return { api, appended, fire, renderers };
}

function clock(start = 1_000) {
	let t = start;
	return { now: () => t, advance: (d: number) => void (t += d) };
}

test("pi: one entry per settled run with elapsed time", () => {
	const c = clock();
	const p = fakePi();
	registerPi(p.api, c.now);
	p.fire("agent_start");
	c.advance(3_000);
	p.fire("agent_settled", { aborted: false });
	assert.deepEqual(p.appended, [
		{ type: "pi-turntime.run", data: { elapsedMs: 3_000, startedAt: 1_000, aborted: false } },
	]);
});

test("pi: nested agent_start spans the whole turn, one entry", () => {
	const c = clock();
	const p = fakePi();
	registerPi(p.api, c.now);
	p.fire("agent_start");
	c.advance(1_000);
	p.fire("agent_start");
	c.advance(2_000);
	p.fire("agent_settled", { aborted: false });
	assert.equal(p.appended.length, 1);
	assert.equal((p.appended[0]!.data as any).elapsedMs, 3_000);
});

test("pi: settle without start emits nothing", () => {
	const p = fakePi();
	registerPi(p.api, clock().now);
	p.fire("agent_settled", { aborted: false });
	assert.equal(p.appended.length, 0);
});

test("pi: session_start and session_shutdown drop an open window", () => {
	for (const ev of ["session_start", "session_shutdown"]) {
		const p = fakePi();
		registerPi(p.api, clock().now);
		p.fire("agent_start");
		p.fire(ev);
		p.fire("agent_settled", { aborted: false });
		assert.equal(p.appended.length, 0, ev);
	}
});

test("pi: appendEntry failure does not propagate", () => {
	const p = fakePi({ appendThrows: true });
	registerPi(p.api, clock().now);
	p.fire("agent_start");
	assert.doesNotThrow(() => p.fire("agent_settled", { aborted: false }));
});

test("pi: aborted runs are recorded as aborted", () => {
	const p = fakePi();
	registerPi(p.api, clock().now);
	p.fire("agent_start");
	p.fire("agent_settled", { aborted: true });
	assert.equal((p.appended[0]!.data as any).aborted, true);
});

test("pi: each registerPi call has independent timer state", () => {
	const c = clock();
	const a = fakePi();
	const b = fakePi();
	registerPi(a.api, c.now);
	registerPi(b.api, c.now);
	a.fire("agent_start");
	b.fire("agent_settled", { aborted: false });
	assert.equal(b.appended.length, 0);
});

const theme = { fg: (color: string, text: string) => `<${color}>${text}</${color}>` };
const entryOf = (data: unknown) => ({ type: "custom", customType: "pi-turntime.run", data });

test("pi: renderer registered once for the entry type", () => {
	const p = fakePi();
	registerPi(p.api, clock().now);
	assert.deepEqual([...p.renderers.keys()], ["pi-turntime.run"]);
	const row = p.renderers.get("pi-turntime.run")!(entryOf({ elapsedMs: 125_000, aborted: false }), { expanded: false }, theme);
	assert.deepEqual(row.render(80), [" <dim>Turn time 2m 05s</dim>"]);
});

test("pi: aborted row is labelled", () => {
	const row = renderRow(entryOf({ elapsedMs: 800, aborted: true }), theme)!;
	assert.deepEqual(row.render(80), [" <dim>Turn time 0.8s (aborted)</dim>"]);
});

test("pi: malformed entry data renders nothing and never throws", () => {
	for (const data of [undefined, null, {}, { elapsedMs: "5" }, { elapsedMs: -1 }, { elapsedMs: Number.NaN }, 42]) {
		assert.doesNotThrow(() => renderRow(entryOf(data), theme));
		assert.equal(renderRow(entryOf(data), theme), undefined);
	}
});

test("pi: row never exceeds the viewport width", () => {
	const row = renderRow(entryOf({ elapsedMs: 3_725_000, aborted: true }), { fg: (_c, t) => t })!;
	for (const w of [2, 5, 10, 20]) {
		for (const line of row.render(w)) assert.ok(line.length <= w, `w=${w} line=${JSON.stringify(line)}`);
	}
	assert.deepEqual(row.render(1), []);
});
