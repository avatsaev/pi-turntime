export const ENTRY_TYPE = "pi-turntime.run";

export interface RunRecord {
	elapsedMs: number;
	startedAt: number;
	aborted: boolean;
}

/**
 * Measures one prompt-to-yield window. A window opens on the first start() and closes on stop();
 * nested start() calls (retries, continuations) are ignored so the whole span is timed.
 */
export class RunTimer {
	private readonly now: () => number;
	private startedAt: number | undefined;

	constructor(now: () => number = Date.now) {
		this.now = now;
	}

	get isOpen(): boolean {
		return this.startedAt !== undefined;
	}

	start(): void {
		if (this.startedAt !== undefined) return;
		this.startedAt = this.now();
	}

	stop(aborted: boolean): RunRecord | undefined {
		if (this.startedAt === undefined) return undefined;
		const startedAt = this.startedAt;
		this.startedAt = undefined;
		return { elapsedMs: Math.max(0, this.now() - startedAt), startedAt, aborted };
	}

	reset(): void {
		this.startedAt = undefined;
	}
}

const pad2 = (n: number): string => String(n).padStart(2, "0");

/** Format a duration; floors to the unit shown. Non-finite or negative input clamps to 0. */
export function formatElapsed(ms: number): string {
	const safe = Number.isFinite(ms) && ms > 0 ? ms : 0;
	if (safe < 60_000) {
		const tenths = Math.floor(safe / 100);
		return `${Math.floor(tenths / 10)}.${tenths % 10}s`;
	}
	const totalSeconds = Math.floor(safe / 1000);
	const seconds = totalSeconds % 60;
	const totalMinutes = Math.floor(totalSeconds / 60);
	if (totalMinutes < 60) return `${totalMinutes}m ${pad2(seconds)}s`;
	return `${Math.floor(totalMinutes / 60)}h ${pad2(totalMinutes % 60)}m ${pad2(seconds)}s`;
}
