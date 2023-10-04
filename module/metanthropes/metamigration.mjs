import { metaLog } from "../helpers/metahelpers.mjs";

/**
 * Migrates data from older versions of the system to newer versions
 * @returns {Promise<void>}
 */
export async function metaMigrateData() {
	metaLog(0, "Metamigration", "Engaged", this);
	//? Migrate Items: replace "⏱ Action" with "⏱ Activation"
	await this._metaMigrateItems();
	//? Check for Invalid Actors
	await this._metaInvalidData();
	console.log("Metanthropes | MetaMigration | Finished");
}
//* Helper function to compare version numbers
//!unused
async function _metaIsNewerVersion(version, oldVersion) {
	return version
		.split(".")
		.map(Number)
		.some((v, i) => v > (oldVersion.split(".")[i] || 0));
}
//* Helper function to migrate Items
async function _metaMigrateItems() {
	const currentVersion = await game.system.data.version;
	console.log("Metanthropes | _metaMigrateItems | Migrating Items to version", currentVersion);
	const worldItems = await game.items.contents;
	for (let item of worldItems) {
		if (item.system.Execution.ActionSlot.label === "⏱ Action") {
			console.log("Metanthropes | _metaMigrateItems | Migrating Item:", item.name, item);
			await item.update({ "system.Execution.ActionSlot.label": "⏱ Activation" });
		}
	}
}
//* Helper function to check for invalid actors
async function _metaInvalidData() {
	//* from: https://foundryvtt.com/article/v10-data-model/
	//? Retrieve the data for an invalid document
	const invalidActorIds = Array.from(game.actors._invalidActorIds);
	console.error("Metanthropes | MetaMigration | _metaInvalidData | Invalid Actor IDs:", invalidActorIds);
	const invalidId = await game.actors._invalidActorIds.first();
	console.error("Metanthropes | MetaMigration | _metaInvalidData | Invalid Actor ID:", invalidId);
	const invalidActor = await game.actors.getInvalid(invalidId);
	console.error("Metanthropes | MetaMigration | _metaInvalidData | Invalid Actor:", invalidActor);
	//* Other methods
	// //? Correct an invalid document
	// await invalidActor.update(correctedData);
	// //? Delete an invalid document
	// await invalidActor.delete();
}
