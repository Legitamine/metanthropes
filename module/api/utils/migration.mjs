/**
 * Migrates data from older versions of the system to newer versions
 * @returns {Promise<void>}
 */
export async function metaMigration(module) {
	metanthropes.utils.metaLog(3, "metaMigration", "Initializing " + module + " Migration Checks");
	const forcedMigration = await game.settings.get("metanthropes", "forceMigration");
	const currentSystemVersion = await game.system.version;
	const migrationData = (await game.settings.get("metanthropes", "migration")) || {};
	const lastMigratedVersion = migrationData[module]?.lastMigrationVersion || 0;
	const migrationTest = foundry.utils.isNewerVersion(currentSystemVersion, lastMigratedVersion);
	if (migrationTest || forcedMigration) {
		metanthropes.utils.metaLog(3, "metaMigration", module + " World Data Migration is required");
		await _metaMigrateData(module, migrationData, currentSystemVersion);
	} else {
		metanthropes.utils.metaLog(3, "metaMigration", module + " World Data Migration is not required");
	}
}

/**
 * Description placeholder
 *
 * @async
 * @param {*} migrationData
 * @param {*} currentSystemVersion
 * @returns {*}
 */
async function _metaMigrateData(module, migrationData, currentSystemVersion) {
	const progress = ui.notifications.info(module + " Data Migration: Migrating World Data", { progress: true });
	progress.update({ pct: 0.1, message: module + " Data Migration: Migrating World Data, please wait." });
	let updateData = {};
	if (module === "System") {
		//* Migrate Prototype Token Defauls
		progress.update({ pct: 0.2, message: module + " Data Migration: Migrating World Data, please wait.." });
		const prototypeTokenDefaults = await _metaMigratePrototypeTokenDefaults(migrationData, currentSystemVersion);
		if (prototypeTokenDefaults) updateData = prototypeTokenDefaults;
		progress.update({ pct: 0.3, message: module + " Data Migration: Migrating World Data, please wait..." });
		//todo Placeholder for further migrations
		// progress.update({ pct: 0.4, message: module + " Data Migration: Migrating World Data, please wait.." });
		// await _metaMigrateSomething(migrationData, currentSystemVersion);
		// progress.update({ pct: 0.5, message: module + " Data Migration: Migrating World Data, please wait.." });
	}
	if (module === "Core") {
		progress.update({ pct: 0.4, message: module + " Data Migration: Migrating World Data, please wait...." });
		//todo more graceful error handling
		await _metaMigrateCoreData(migrationData, currentSystemVersion);
		//edw kanw await to updatedata apo core? or false?
		progress.update({ pct: 0.5, message: module + " Data Migration: Migrating World Data, please wait....." });
	}
	//* Migration wrapping up
	progress.update({ pct: 0.7, message: module + " Data Migration: Migrating World Data, please wait......." });
	const prevMigration = migrationData[module] || {};
	progress.update({ pct: 0.8, message: module + " Data Migration: Migrating World Data, please wait........" });
	await game.settings.set("metanthropes", "migration", {
		...migrationData,
		[module]: {
			...prevMigration,
			lastMigrationVersion: currentSystemVersion,
			...updateData,
		},
	});
	progress.update({ pct: 0.9, message: module + " Data Migration: Migrating World Data, please wait........." });
	await game.settings.set("metanthropes", "forceMigration", false);
	progress.update({ pct: 1, message: module + " Data Migration: Finished Migrating World Data" });
}

async function _metaMigrateCoreData(migrationData, currentSystemVersion) {
	metanthropes.utils.metaLog(0, "System", "Migration", "Initializing Core Migration Engine");
	const progress = ui.notifications.info("Core Data Migration", { progress: true });
	progress.update({ pct: 0.2, message: "Updating, please do not refresh! ." });
	const core = await game.settings.get("metanthropes", "metaCore");
	if (!core) {
		ui.notifications.warn("Metanthropes: Core is not Enabled, please activate it in the game settings.");
		progress.update({ pct: 1, message: "No Data Migrated" });
		metanthropes.utils.metaLog(2, "System", "Migration", "Unable to complete Core Data Miration");
		return;
	}
	progress.update({ pct: 0.3, message: "Updating, please do not refresh! .." });
	await metanthropes.utils.metaCoreMigration(migrationData, currentSystemVersion);
	progress.update({ pct: 0.9, message: "Finalizing..." });
	metanthropes.utils.metaLog(0, "System", "Migration", "Finished Core Data Migration");
	progress.update({ pct: 1, message: "Finished updating!" });
}
/**
 * Description placeholder
 *
 * @async
 * @param {*} migrationData
 * @param {*} currentSystemVersion
 * @returns {*}
 */
async function _metaMigratePrototypeTokenDefaults(migrationData, currentSystemVersion) {
	//* Override Protype Token Defaults
	const settingApplied = migrationData?.System?.prototypeTokenOverridesApplied ?? null;
	const settingAppliedVersion = migrationData?.System?.prototypeTokenOverridesAppliedVersion ?? 0;
	const settingRequiredVersion = "0.13.26";
	const isNewerVersion = foundry.utils.isNewerVersion(settingRequiredVersion, settingAppliedVersion);
	if (settingApplied && !isNewerVersion) {
		metanthropes.utils.metaLog(0, "System", "Migration", "System Default Token Overrides already established");
		return false;
	} else {
		metanthropes.utils.metaLog(0, "System", "Migration", "Establishing New System Default Token Overrides");
		const progress = ui.notifications.info("Updating Prototype Token Default Settings", { progress: true });
		const newTokenDefaults = metanthropes.system.TOKENDEFAULTS;
		progress.update({ pct: 0.25, message: "Updating, please do not refresh! ." });
		await game.settings.set("core", "prototypeTokenOverrides", newTokenDefaults);
		progress.update({ pct: 0.5, message: "Updating, please do not refresh! .." });
		const updateData = {
			prototypeTokenOverridesApplied: true,
			prototypeTokenOverridesAppliedVersion: currentSystemVersion,
		};
		progress.update({ pct: 1.0, message: "Finished Updating Prototype Token Defaults" });
		return updateData;
		const prevMigration = migrationData.System || {};
		//const prevMigration = (await game.settings.get("metanthropes", "migration", "System")) || {};
		progress.update({ pct: 0.75, message: "Updating, please do not refresh! ..." });
		await game.settings.set("metanthropes", "migration", {
			...migrationData,
			System: {
				...prevMigration,
				prototypeTokenOverridesApplied: true,
				prototypeTokenOverridesAppliedVersion: currentSystemVersion,
			},
		});
		// await game.settings.set("metanthropes", "migration", "System", {
		// 	...prevMigration,
		// 	prototypeTokenOverridesApplied: true,
		// 	prototypeTokenOverridesAppliedVersion: currentSystemVersion,
		// });
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
