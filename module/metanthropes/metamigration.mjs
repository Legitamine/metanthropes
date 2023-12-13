import { metaLog } from "../helpers/metahelpers.mjs";

/**
 * Migrates data from older versions of the system to newer versions
 * @returns {Promise<void>}
 */
export function metaMigrateData() {
	//metaLog(3, "metaMigrateData", "Started");
	metaLog(3, "metaMigrateData", "No Migration Needed");
	//	const migrationVersion = game.settings.get("metanthropes-system", "migrationVersion");
	//	const isNewerVersion = foundry.utils.isNewerVersion;
	//	if (!isNewerVersion(game.system.version, migrationVersion)) return;
	//	metaLog(0, "Migrating World to latest version");
	//	// if (isNewerVersion("0.7.21", migrationVersion)) _metaMigrateItems();
	//	if (isNewerVersion("0.8.21", migrationVersion)) _metaTemplateChanges();
	//	//	game.settings.set("metanthropes-system", "migrationVersion", game.system.version);
	//_metaMigrateItems();
	//metaLog(3, "metaMigrateData", "Finished");
}
//* Handle template deprecations
function _metaTemplateChanges() {
	const worldItems = game.items.contents;
	for (let item of worldItems) {
		if (item.system.Execution.TargetsType.selections) {
			const newSelections = {
				Animal: "Animal",
				Human: "Human",
				Metanthrope: "Metanthrope",
				Extradimensional: "Extradimensional",
				Extraterrestrial: "Extraterrestrial",
				Metatherion: "Metatherion",
				Organism: "Organism",
				Dead: "Dead",
				Plant: "Plant",
				Object: "Object",
				Character: "Character",
				Metapowered: "Metapowered",
			};
			metaLog(
				3,
				`metaMigrateData`,
				`_metaTemplateChanges`,
				`Migrating Item Target Type Selections for:`,
				item.name
			);
			item.update({ "system.Execution.TargetsType.selections": newSelections });
		}
		if (item.system.Execution.TargetsType.value === "Living") {
			item.update({ "system.Execution.TargetsType.value": "Organism" });
			metaLog(3, `metaMigrateData`, `_metaTemplateChanges`, `Migrated Item:`, item.name);
		}
	}
}
//* Helper function to compare version numbers
//! Unused -- Foundry should come with it's own utility for this
async function _metaIsNewerVersion(version, oldVersion) {
	return version
		.split(".")
		.map(Number)
		.some((v, i) => v > (oldVersion.split(".")[i] || 0));
}
//* Helper function to migrate Items
async function _metaMigrateItems() {
	const currentVersion = await game.system.data.version;
	metaLog(3, `metaMigrateData`, `_metaMigrateItems`, `Migrating Items to version`, currentVersion);
	const worldItems = await game.items.contents;
	for (let item of worldItems) {
		if (item.system.Effects.EffectDescription.label === "Effect Description") {
			metaLog(4, `metaMigrateData`, `_metaMigrateItems`, `Migrating Item:`, item.name, item);
			await item.update({ "system.Effects.EffectDescription.label": "Effect" });
		}
		if (item.system.Effects.PermanentEffectDescription.label === "Permanent Effect") {
			metaLog(4, `metaMigrateData`, `_metaMigrateItems`, `Migrating Item:`, item.name, item);
			await item.update({ "system.Effects.PermanentEffectDescription.label": "Permanent Effects" });
		}
		if (item.system.Execution.AreaEffectType) {
			metaLog(4, `metaMigrateData`, `_metaMigrateItems`, `Migrating Item:`, item.name, item);
			await item.update({ "system.Execution.-=AreaEffectType": null });
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
	metaLog(3, "metaMigrateData", "_metaInvalidData", "Invalid Actor:", invalidActor);
	metaLog(3, "metaMigrateData", "_metaInvalidData", "Invalid Actor:", invalidActor);
	//* Other methods
	// //? Correct an invalid document
	// await invalidActor.update(correctedData);
	// //? Delete an invalid document
	// await invalidActor.delete();
}
