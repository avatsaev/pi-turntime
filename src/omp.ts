import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";

const SETTING_IDS = ["display.showTokenUsage", "display.showTurnTime"] as const;

/**
 * omp adapter: omp renders total prompt-to-yield time natively in the usage row of the last
 * assistant message (`display.showTurnTime`, which needs `display.showTokenUsage`). This only turns
 * those settings on in the in-memory runtime layer, and only when the user has not configured them.
 *
 * The registry is imported dynamically so pi never evaluates an omp-only module at load time.
 */
export function registerOmp(
	api: ExtensionAPI,
	load: () => Promise<{ lookup: (id: string) => any }> = () =>
		import("@oh-my-pi/pi-coding-agent/config/registry") as Promise<{ lookup: (id: string) => any }>,
): void {
	api.on("session_start", async (_event, ctx) => {
		if (ctx.agent.kind !== "main") return;
		try {
			const { lookup } = await load();
			if (!lookup("display.showTurnTime")) {
				ctx.ui.notify("pi-turntime: this omp has no display.showTurnTime setting; nothing to enable", "warning");
				return;
			}
			const settings = api.pi.settings;
			for (const id of SETTING_IDS) {
				const handle = lookup(id);
				if (handle && !handle.isConfigured(settings)) handle.override(settings, true);
			}
		} catch (error) {
			try {
				(api as any).logger?.warn?.(`pi-turntime: could not enable turn time: ${String(error)}`);
			} catch {
				// Logging is best-effort.
			}
		}
	});
}
