export async function metaMigrateData() {
	// Get the current version
	const currentVersion = game.system.data.version;
	console.log("Metanthropes RPG System | Migrating Items to version", currentVersion);
	const worldItems = game.items.contents;
	for (let item of worldItems) {
		if (item.system.Execution.ActionSlot.label === "⏱ Action") {
			console.log("Metanthropes RPG System | Migrating Item:", item.name, item);
			await item.update({ "system.Execution.ActionSlot.label": "⏱ Activation" });
		}
	}
}

// Helper function to compare version numbers !unused
export function isNewerVersion(version, oldVersion) {
	return version
		.split(".")
		.map(Number)
		.some((v, i) => v > (oldVersion.split(".")[i] || 0));
}
