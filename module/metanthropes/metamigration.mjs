import { metaLog } from "../helpers/metahelpers.mjs";

/**
 * Migrates data from older versions of the system to newer versions
 * @returns {Promise<void>}
 */
export async function metaMigrateData() {
	metaLog(0, "metaMigrateData", "Started");
	//? Migrate Items: replace "⏱ Action" with "⏱ Activation"
	// await _metaMigrateItems();
	//? Check for Invalid Actors
	// await _metaInvalidData();
	metaLog(0, "metaMigrateData", "Finished");
}
//* Helper function to compare version numbers
//! Unused
async function _metaIsNewerVersion(version, oldVersion) {
	return version
		.split(".")
		.map(Number)
		.some((v, i) => v > (oldVersion.split(".")[i] || 0));
}
//* Helper function to migrate Items
//! Unused
async function _metaMigrateItems() {
	const currentVersion = await game.system.data.version;
	metaLog(0, `metaMigrateData`, `_metaMigrateItems`, `Migrating Items to version`, currentVersion);
	const worldItems = await game.items.contents;
	for (let item of worldItems) {
		if (item.system.Execution.ActionSlot.label === "⏱ Action") {
			console.log("Metanthropes | _metaMigrateItems | Migrating Item:", item.name, item);
			await item.update({ "system.Execution.ActionSlot.label": "⏱ Activation" });
		}
	}
}
//* Helper function to check for invalid actors
//! Unused
async function _metaInvalidData() {
	//* from: https://foundryvtt.com/article/v10-data-model/
	//? Retrieve the data for an invalid document
	//! this is giving an error
	const invalidActorIds = Array.from(game.actors._invalidActorIds) || null;
	metaLog(3, "metaMigrateData", "_metaInvalidData", "Invalid Actor IDs:", invalidActorIds);
	const invalidId = await game.actors._invalidActorIds.first();
	metaLog(3, "metaMigrateData", "_metaInvalidData", "Invalid Actor ID:", invalidId);
	const invalidActor = await game.actors.getInvalid(invalidId);
	console.error("Metanthropes | MetaMigration | _metaInvalidData | Invalid Actor:", invalidActor);
	metaLog(3, "metaMigrateData", "_metaInvalidData", "Invalid Actor:", invalidActor);
	//* Other methods
	// //? Correct an invalid document
	// await invalidActor.update(correctedData);
	// //? Delete an invalid document
	// await invalidActor.delete();
}
