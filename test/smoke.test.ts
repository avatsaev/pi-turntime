import test from "node:test";
import assert from "node:assert/strict";
import factory from "../src/index.ts";

test("default export is a factory function", () => {
	assert.equal(typeof factory, "function");
});
