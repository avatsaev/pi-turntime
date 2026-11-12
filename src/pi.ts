import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { ENTRY_TYPE, RunTimer, formatElapsed } from "./core.ts";

interface Theme {
	fg(color: string, text: string): string;
}

interface RowComponent {
	render(width: number): string[];
	invalidate(): void;
}

/**
 * Builds the dim stats-style row. Returns a plain pi-tui `Component` shape inline so this module
 * needs no runtime pi-tui import (which would break loading under omp).
 */
export function renderRow(entry: { data?: unknown }, theme: Theme): RowComponent | undefined {
	const data = entry.data as { elapsedMs?: unknown; aborted?: unknown } | undefined;
	if (!data || typeof data.elapsedMs !== "number" || !Number.isFinite(data.elapsedMs) || data.elapsedMs < 0) {
		return undefined;
	}
	const text = `Turn time ${formatElapsed(data.elapsedMs)}${data.aborted === true ? " (aborted)" : ""}`;
	return {
		render(width: number): string[] {
			if (width < 2) return [];
			return [` ${theme.fg("dim", text.slice(0, width - 1))}`];
		},
		invalidate() {},
	};
}

/**
 * pi adapter: times each prompt-to-yield window and persists one non-context `custom` entry per
 * settled run. All state lives inside this call so child sessions get independent timers.
 */
export function registerPi(api: ExtensionAPI, now?: () => number): void {
	const timer = new RunTimer(now);

	api.registerEntryRenderer(ENTRY_TYPE, (entry, _options, theme) => renderRow(entry, theme));

	api.on("agent_start", () => {
		timer.start();
	});

	api.on("agent_settled", (event) => {
		const record = timer.stop(event.aborted);
		if (!record) return;
		try {
			api.appendEntry(ENTRY_TYPE, record);
		} catch {
			// Never let a persistence failure break the session.
		}
	});

	api.on("session_start", () => {
		timer.reset();
	});

	api.on("session_shutdown", () => {
		timer.reset();
	});
}
