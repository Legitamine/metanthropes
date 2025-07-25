/**
 * Evaluates whether Migration is required for the Metanthropes System and Premium Modules
 * 
 * Migration will always trigger, if the 'Force Data migration' setting is enabled
 * It will also run every time a new version of the System is detected
 * How Data will be migrated is decided by _metaMigrateData
 * 
 * !todo: confirm we don't get to a state where we'll update the settings without having actually done things first
 * ?currently multiple modules can trigger it and it might happen that the migrationData it grabs could change already
 * ? having it control the grabbing and updating could help control it / pace it better
 * ? however it might be best to have it store data for each module in a separate object under each module?
 * ? this should control it though
 * @returns {Promise<void>}
 */
export async function metaMigration(module) {
	metanthropes.utils.metaLog(3, "metaMigration", "Initializing", module, "Migration Checks");
	const isMigrationForced = await game.settings.get("metanthropes", "forceMigration");
	const currentSystemVersion = await game.system.version;
	const migrationData = (await game.settings.get("metanthropes", "migration")) || {};
	const lastMigratedVersion = migrationData[module]?.lastMigrationVersion || 0;
	const isMigrationRequired = foundry.utils.isNewerVersion(currentSystemVersion, lastMigratedVersion);
	if (isMigrationRequired || isMigrationForced) {
		metanthropes.utils.metaLog(3, "metaMigration", module, "World Data Migration is required or is being forced");
		await _metaMigrateData(module, migrationData, currentSystemVersion);
		metanthropes.utils.metaLog(3, "metaMigration", module, "World Data Migration completed");
	} else {
		metanthropes.utils.metaLog(3, "metaMigration", module, "World Data Migration is not required");
	}
}

/**
 * Migration Engine controls the overall migration steps, displays progress and updates the game settings
 * 
 * !todo: confirm we don't get to a state where we'll update the settings without having actually done things first
 * todo: progress bar should be localized
 *
 * @async
 * @param {*} module 
 * @param {*} migrationData 
 * @param {*} currentSystemVersion 
 * @returns {*} 
 */
async function _metaMigrateData(module, migrationData, currentSystemVersion) {
	const progress = ui.notifications.info(module + " Data Migration: Updating World Data", { progress: true });
	progress.update({ pct: 0.1, message: module + " Data Migration: Updating World Data, please wait." });
	let updateData = {};
	if (module === "System") {
		//* Migrate Prototype Token Defaults
		progress.update({ pct: 0.2, message: module + " Data Migration: Updating World Data, please wait.." });
		const prototypeTokenDefaults = await _metaMigrateDataPrototypeTokenDefaults(migrationData, currentSystemVersion);
		if (prototypeTokenDefaults) updateData = prototypeTokenDefaults;
		progress.update({ pct: 0.3, message: module + " Data Migration: Updating World Data, please wait..." });
	}
	if (module === "Core") {
		progress.update({ pct: 0.4, message: module + " Data Migration: Updating World Data, please wait...." });
		//todo more graceful error handling
		const coreDataMigrationResults = await _metaMigrateDataCore(migrationData, currentSystemVersion);
		progress.update({ pct: 0.5, message: module + " Data Migration: Updating World Data, please wait....." });
		if (coreDataMigrationResults) updateData = coreDataMigrationResults;
		progress.update({ pct: 0.6, message: module + " Data Migration: Updating World Data, please wait......" });
	}
	//* Migration wrapping up
	progress.update({ pct: 0.7, message: module + " Data Migration: Updating World Data, please wait......." });
	const prevMigration = migrationData[module] || {};
	progress.update({ pct: 0.8, message: module + " Data Migration: Updating World Data, please wait........" });
	await game.settings.set("metanthropes", "migration", {
		...migrationData,
		[module]: {
			...prevMigration,
			lastMigrationVersion: currentSystemVersion,
			...updateData,
		},
	});
	progress.update({ pct: 0.9, message: module + " Data Migration: Updating World Data, please wait........." });
	await game.settings.set("metanthropes", "forceMigration", false);
	progress.update({ pct: 1, message: module + " Data Migration: Finished Updating World Data" });
}

/**
 * Calls the Core Data Migration
 * todo: modularity for upcoming modules
 * todo: progress bar should be localized
 *
 * @async
 * @param {*} migrationData 
 * @param {*} currentSystemVersion 
 * @returns {updateData} 
 */
async function _metaMigrateDataCore(migrationData, currentSystemVersion) {
	metanthropes.utils.metaLog(0, "System", "Migration", "Initializing Core Data Migration");
	const progress = ui.notifications.info("Core Data Migration", { progress: true });
	progress.update({ pct: 0.2, message: "Core Data Migration: Confirming requirements before updating.." });
	const core = await game.settings.get("metanthropes", "metaCore");
	if (!core) {
		ui.notifications.warn("Metanthropes: Core is not Enabled, please activate it in the game settings.");
		progress.update({
			pct: 1,
			message: "Core Data Migration Canceled: requirements not met - Core is not Enabled",
		});
		metanthropes.utils.metaLog(2, "System", "Migration", "Unable to complete Core Data Miration");
		return false;
	}
	//todo error handling if API is unavailable?
	progress.update({ pct: 0.3, message: "Core Data Migration: Updating, please do not refresh! .." });
	const coreUpdateData = await metanthropes.utils?.metaCoreMigration(migrationData, currentSystemVersion);
	progress.update({ pct: 0.7, message: "Core Data Migration: Updating, please do not refresh! ......." });
	if (coreUpdateData) {
		progress.update({ pct: 0.9, message: "Core Data Migration: Finalizing..." });
		metanthropes.utils.metaLog(0, "System", "Migration", "Finished Core Data Migration");
		progress.update({ pct: 1, message: "Core Data Migration: Finished Updating!" });
		return coreUpdateData;
	} else {
		progress.update({ pct: 0.9, message: "Core Data Migration: Error while Finalizing..." });
		metanthropes.utils.metaLog(
			0,
			"System",
			"Migration",
			"Canceled",
			"Did not receive valid Core Migration Data",
			"OR",
			"Update was not required"
		);
		progress.update({ pct: 1, message: "Core Data Migration: Migration Canceled" });
		return false;
	}
}

/**
 * Manages updating the overrides for the default Prototype Token Defauls introduced with v13
 * todo: modularity, better error handling
 *
 * @async
 * @param {*} migrationData Migration Data object 
 * @param {*} currentSystemVersion 
 * @returns {updateData}
 */
async function _metaMigrateDataPrototypeTokenDefaults(migrationData, currentSystemVersion) {
	//* Override Protype Token Defaults
	const settingApplied = migrationData?.System?.prototypeTokenOverridesApplied ?? null;
	const settingAppliedVersion = migrationData?.System?.prototypeTokenOverridesAppliedVersion ?? 0;
	const settingRequiredVersion = "0.13.26"; //? version is to be entered manually when a feature is introduced
	const isNewerVersion = foundry.utils.isNewerVersion(settingRequiredVersion, settingAppliedVersion);
	if (settingApplied && !isNewerVersion) {
		metanthropes.utils.metaLog(0, "System", "Migration", "System Default Token Overrides already established");
		return false;
	} else {
		metanthropes.utils.metaLog(0, "System", "Migration", "Establishing New System Default Token Overrides");
		const progress = ui.notifications.info("Default Token Settings", { progress: true });
		const newTokenDefaults = metanthropes.system.TOKENDEFAULTS;
		progress.update({ pct: 0.25, message: "Default Token Settings: Updating, please do not refresh! ." });
		await game.settings.set("core", "prototypeTokenOverrides", newTokenDefaults);
		progress.update({ pct: 0.5, message: "Default Token Settings: Updating, please do not refresh! .." });
		const updateData = {
			prototypeTokenOverridesApplied: true,
			prototypeTokenOverridesAppliedVersion: currentSystemVersion,
		};
		progress.update({ pct: 1.0, message: "Default Token Settings: Finished Updating Prototype Token Defaults" });
		return updateData;
	}
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

//* Deprecated Migrations

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
