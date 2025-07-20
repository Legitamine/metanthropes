/**
 * Migrates data from older versions of the system to newer versions
 * @returns {Promise<void>}
 */
export async function metaMigrateData() {
	metanthropes.utils.metaLog(3, "metaMigrateData", "Initializing Migration Checks");
	//* Check if we have run the migration or we are forced to run.
	const forcedMigration = await game.settings.get("metanthropes", "forceMigration");
	const currentSystemVersion = await game.system.version;
	const migrationData = await game.settings.get("metanthropes", "migration");
	const lastMigratedVersion = migrationData.lastMigrationVersion ?? null;
	const migrationTest = foundry.utils.isNewerVersion(currentSystemVersion, lastMigratedVersion);
	if (migrationTest || forcedMigration) {
		metanthropes.utils.metaLog(3, "metaMigrateData", "World Data Migration is required");
		await metaMigrateDoMigration(migrationData, currentSystemVersion);
	} else {
		metanthropes.utils.metaLog(3, "metaMigrateData", "World Data Migration is not required");
	}
}

export async function metaMigrateDoMigration(migrationData, currentSystemVersion) {
	const progress = ui.notifications.info("System Migration: Migrating World Data", { progress: true });
	progress.update({ pct: 0.1, message: "System Migration: Migrating World Data, please wait." });
	//* Migrate Prototype Token Defauls
	progress.update({ pct: 0.2, message: "System Migration: Migrating World Data, please wait." });
	await metaMigratePrototypeTokenDefaults(migrationData, currentSystemVersion);
	//* Migrate Metapowers from Core
	//* Migrate Possessions from Core
	//progress.update({ pct: 0.2, message: "System Migration: Migrating World Data, please wait." });
	//await metaMigratePrototypeTokenDefaults(migrationData, currentSystemVersion);
	//* Migration wrapping up
	progress.update({ pct: 0.7, message: "System Migration: Migrating World Data, please wait.." });
	const prevMigration = (await game.settings.get("metanthropes", "migration")) || {};
	progress.update({ pct: 0.8, message: "System Migration: Migrating World Data, please wait..." });
	await game.settings.set("metanthropes", "migration", {
		...prevMigration,
		lastMigrationVersion: currentSystemVersion,
	});
	progress.update({ pct: 0.9, message: "System Migration: Migrating World Data, please wait...." });
	await game.settings.set("metanthropes", "forceMigration", false);
	progress.update({ pct: 1, message: "System Migration: Finished Migrating World Data" });
}

export async function metaMigratePrototypeTokenDefaults(migrationData, currentSystemVersion) {
	//* Override Protype Token Defaults
	const settingApplied = migrationData.prototypeTokenOverridesApplied ?? null;
	const settingAppliedVersion = migrationData.prototypeTokenOverridesAppliedVersion ?? null;
	const settingRequiredVersion = "0.13.26";
	const isNewerVersion = foundry.utils.isNewerVersion(settingRequiredVersion, settingAppliedVersion);
	if (settingApplied && !isNewerVersion) {
		metanthropes.utils.metaLog(0, "System", "Migration", "System Default Token Overrides already established");
	} else {
		metanthropes.utils.metaLog(0, "System", "Migration", "Establishing New System Default Token Overrides");
		const progress = ui.notifications.info("Updating Prototype Token Default Settings", { progress: true });
		const newTokenDefaults = metanthropes.system.TOKENDEFAULTS;
		progress.update({ pct: 0.25, message: "Updating, please do not refresh! ." });
		await game.settings.set("core", "prototypeTokenOverrides", newTokenDefaults);
		progress.update({ pct: 0.5, message: "Updating, please do not refresh! .." });
		const prevMigration = (await game.settings.get("metanthropes", "migration")) || {};
		progress.update({ pct: 0.75, message: "Updating, please do not refresh! ..." });
		await game.settings.set("metanthropes", "migration", {
			...prevMigration,
			prototypeTokenOverridesApplied: true,
			prototypeTokenOverridesAppliedVersion: currentSystemVersion,
		});
		progress.update({ pct: 1.0, message: "Finished Updating Prototype Token Defaults" });
	}
}

//? We check if the current game version is higher and whether the flags have been already set for each setting
//game.settings.set("metanthropes", "testobject", { objectkey: "objectvalue" });
//await metaMigratePrototypeTokenDefaults();
//const prototypeTokenOverridesApplied = await game.settings.get("metanthropes", "prototypeTokenOverridesApplied");
//const prototypeTokenOverridesVersion = "0.13.26"
//const lastMigrationVersionCheck = await game.settings.get("metanthropes", "migrationVersion");
//if (isNewerVersion(prototypeTokenOverridesVersion, lastMigrationVersionCheck) )
//isNewerVersion("0.13.6", migrationVersion);
//metanthropes.utils.metaLog(3, "metaMigrateData", "No Migration Needed");
//	const migrationVersion = game.settings.get("metanthropes", "migrationVersion");
//	const isNewerVersion = foundry.utils.isNewerVersion;
//	if (!isNewerVersion(game.system.version, migrationVersion)) return;
//	metanthropes.utils.metaLog(0, "Migrating World to latest version");
//	// if (isNewerVersion("0.7.21", migrationVersion)) _metaMigrateItems();
//	if (isNewerVersion("0.8.21", migrationVersion)) _metaTemplateChanges();
//	//	game.settings.set("metanthropes", "migrationVersion", game.system.version);
//_metaMigrateItems();
//metanthropes.utils.metaLog(3, "metaMigrateData", "Finished");

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
			metanthropes.utils.metaLog(
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
			metanthropes.utils.metaLog(3, `metaMigrateData`, `_metaTemplateChanges`, `Migrated Item:`, item.name);
		}
	}
}

//* Helper function to migrate Items
async function _metaMigrateItems() {
	const currentVersion = await game.system.data.version;
	metanthropes.utils.metaLog(3, `metaMigrateData`, `_metaMigrateItems`, `Migrating Items to version`, currentVersion);
	const worldItems = await game.items.contents;
	for (let item of worldItems) {
		if (item.system.Effects.EffectDescription.label === "Effect Description") {
			metanthropes.utils.metaLog(4, `metaMigrateData`, `_metaMigrateItems`, `Migrating Item:`, item.name, item);
			await item.update({ "system.Effects.EffectDescription.label": "Effect" });
		}
		if (item.system.Effects.PermanentEffectDescription.label === "Permanent Effect") {
			metanthropes.utils.metaLog(4, `metaMigrateData`, `_metaMigrateItems`, `Migrating Item:`, item.name, item);
			await item.update({ "system.Effects.PermanentEffectDescription.label": "Permanent Effects" });
		}
		if (item.system.Execution.AreaEffectType) {
			metanthropes.utils.metaLog(4, `metaMigrateData`, `_metaMigrateItems`, `Migrating Item:`, item.name, item);
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
	metanthropes.utils.metaLog(3, "metaMigrateData", "_metaInvalidData", "Invalid Actor IDs:", invalidActorIds);
	const invalidId = await game.actors._invalidActorIds.first();
	metanthropes.utils.metaLog(3, "metaMigrateData", "_metaInvalidData", "Invalid Actor ID:", invalidId);
	const invalidActor = await game.actors.getInvalid(invalidId);
	metanthropes.utils.metaLog(3, "metaMigrateData", "_metaInvalidData", "Invalid Actor:", invalidActor);
	metanthropes.utils.metaLog(3, "metaMigrateData", "_metaInvalidData", "Invalid Actor:", invalidActor);
	//* Other methods
	// //? Correct an invalid document
	// await invalidActor.update(correctedData);
	// //? Delete an invalid document
	// await invalidActor.delete();
}
