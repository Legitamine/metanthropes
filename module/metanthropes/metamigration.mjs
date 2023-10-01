/**
 * Migrates data from older versions of the system to newer versions
 * @returns {Promise<void>}
 */
export async function metaMigrateData() {
	const currentVersion = game.system.data.version;
	console.log("Metanthropes | Migrating Items to version", currentVersion);
	const worldItems = game.items.contents;
	for (let item of worldItems) {
		if (item.system.Execution.ActionSlot.label === "⏱ Action") {
			console.log("Metanthropes | Migrating Item:", item.name, item);
			await item.update({ "system.Execution.ActionSlot.label": "⏱ Activation" });
		}
	}
}

//* Helper function to compare version numbers 
//!unused
export function isNewerVersion(version, oldVersion) {
	return version
		.split(".")
		.map(Number)
		.some((v, i) => v > (oldVersion.split(".")[i] || 0));
}
