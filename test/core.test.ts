import test from "node:test";
import assert from "node:assert/strict";
import { RunTimer, formatElapsed } from "../src/core.ts";

function clock(start = 1_000) {
	let t = start;
	return { now: () => t, set: (v: number) => void (t = v), advance: (d: number) => void (t += d) };
}

test("RunTimer: records elapsed time for one window", () => {
	const c = clock();
	const timer = new RunTimer(c.now);
	timer.start();
	c.advance(12_340);
	assert.deepEqual(timer.stop(false), { elapsedMs: 12_340, startedAt: 1_000, aborted: false });
});

test("RunTimer: nested start keeps the first startedAt, yields one record", () => {
	const c = clock();
	const timer = new RunTimer(c.now);
	timer.start();
	c.advance(2_000);
	timer.start();
	c.advance(3_000);
	assert.deepEqual(timer.stop(false), { elapsedMs: 5_000, startedAt: 1_000, aborted: false });
	assert.equal(timer.stop(false), undefined);
});

test("RunTimer: stop without start returns undefined", () => {
	assert.equal(new RunTimer(clock().now).stop(false), undefined);
});

test("RunTimer: reset drops the open window", () => {
	const timer = new RunTimer(clock().now);
	timer.start();
	assert.equal(timer.isOpen, true);
	timer.reset();
	assert.equal(timer.isOpen, false);
	assert.equal(timer.stop(false), undefined);
});

test("RunTimer: clock going backwards clamps to 0", () => {
	const c = clock(5_000);
	const timer = new RunTimer(c.now);
	timer.start();
	c.set(1_000);
	assert.equal(timer.stop(false)?.elapsedMs, 0);
});

test("RunTimer: aborted flag is recorded; timer is reusable afterwards", () => {
	const c = clock();
	const timer = new RunTimer(c.now);
	timer.start();
	c.advance(10);
	assert.equal(timer.stop(true)?.aborted, true);
	timer.start();
	c.advance(20);
	assert.equal(timer.stop(false)?.elapsedMs, 20);
});

test("formatElapsed: units and flooring", () => {
	const cases: Array<[number, string]> = [
		[0, "0.0s"],
		[800, "0.8s"],
		[12_340, "12.3s"],
		[59_999, "59.9s"],
		[60_000, "1m 00s"],
		[125_000, "2m 05s"],
		[3_599_999, "59m 59s"],
		[3_725_000, "1h 02m 05s"],
	];
	for (const [ms, expected] of cases) assert.equal(formatElapsed(ms), expected, `ms=${ms}`);
});

test("formatElapsed: invalid input clamps to 0", () => {
	for (const ms of [-5, Number.NaN, Number.POSITIVE_INFINITY]) assert.equal(formatElapsed(ms), "0.0s");
});
