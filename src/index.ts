import type { ExtensionAPI as OmpApi } from "@oh-my-pi/pi-coding-agent";
import type { ExtensionAPI as PiApi } from "@earendil-works/pi-coding-agent";
import { registerOmp } from "./omp.ts";
import { registerPi } from "./pi.ts";

/**
 * Loaded by both omp and pi. pi's API has `registerEntryRenderer`; omp's does not, so that is the
 * host probe. Registration is synchronous; all runtime work happens inside event handlers.
 */
export default function (api: PiApi | OmpApi): void {
	if (typeof (api as Partial<PiApi>).registerEntryRenderer === "function") {
		registerPi(api as PiApi);
	} else {
		registerOmp(api as OmpApi);
	}
}
