/**
 * Controls the overall Content Data Migration each World needs, for Legitamine Games official content
 * Evaluates whether Migration is required for the Metanthropes System and Premium Modules
 * Updates the migration setting for the system once it's all complete
 *
 * Migration will always trigger, if the 'Force Data migration' setting is enabled
 * This setting will reset upon a succesful application of updates from a module
 * It will also run every time a new version of the System is detected
 * It will also rename the first active GM user from the default 'Gamemaster' to 'The Narrator' (if applicable, localized)
 *
 * todo do a round of checks first, totaling number of migrations that need to happen, then start over doing them once all checks complete.
 * todo this should be an even better way to control if a migration should proceed, when it would otherwise hang before ? like a test ?
 *
 * @export
 * @async
 * @returns {Promise<void>}
 */
export async function metaMigration() {
	if (!game.user.isActiveGM) return;
	const mL = metanthropes.utils.metaLog;
	mL(0, "Migration", "Data Migration Engine Initialized");
	const modules = await metaInitializeModules();
	if (!modules) return mL(2, "Migration", "Error could not initialize Modules!");
	const progressMessage = `${_loc("METANTHROPES.MIGRATION.World")}`;
	const progress = ui.notifications.info(progressMessage, { progress: true });
	let progressCompletedSteps = 1;
	let progressTotalSteps = 2 + 2 * modules.length;
	function updateProgress(message) {
		progress.update({
			pct: ++progressCompletedSteps / progressTotalSteps,
			message,
		});
	}
	let metaMigrateModulesResult = null; //? If we receive no updates whatsoever, we'll end up not requiring migration.
	const isMigrationForced = await game.settings.get("metanthropes", "forceMigration");
	const currentSystemVersion = await game.system.version;
	let migrationData = await game.settings.get("metanthropes", "migration");
	//* Migration Engine Engaged, will update the migration game setting only if it doesn't end unexpectedly
	try {
		if (!migrationData) {
			mL(0, "Migration", "New World Detected");
			migrationData = {};
			if (game.users.activeGM.name === "Gamemaster") {
				mL(0, "Migration", "Renaming Gamemaster");
				progressTotalSteps++;
				updateProgress(
					`${progressMessage} | ${_loc("METANTHROPES.MIGRATION.NarratorRename")} | ${_loc("METANTHROPES.COMMON.Narrator")}`,
				);
				await game.users.activeGM.update({ name: _loc("METANTHROPES.COMMON.Narrator") });
			}
		}
		//* For each module I expect to get back either false (no migration) or the migrationDataUpdate for that module
		//todo do I want to further modularize this? //const moduleMigrationResult = await metaMigrateModules(migrationData, modules);
		mL(0, "Migration", "Initializing Data Migration for", modules.length, `Module${modules.length > 1 ? "s" : ""}`);
		for (const [module, moduleName] of modules) {
			//? contributes +2 to total counter for each module
			mL(0, "Migration", "Initializing", module, "Data Migration");
			const moduleMessage = `${progressMessage} | ${_loc(moduleName)} |`;
			updateProgress(`${moduleMessage} ${_loc("METANTHROPES.MIGRATION.Data")}`);
			const lastMigratedVersion = migrationData[module]?.lastMigrationVersion || 0;
			const isMigrationRequired = foundry.utils.isNewerVersion(currentSystemVersion, lastMigratedVersion);
			if (isMigrationRequired || isMigrationForced) {
				mL(3, "Migration", module, "World Data Migration is required or is being forced");
				updateProgress(`${moduleMessage} ${_loc("METANTHROPES.MIGRATION.Migrating")}`);
				const moduleMigrationResult = await metaMigrateModuleData(
					module,
					migrationData,
					currentSystemVersion,
					moduleName,
				);
				if (!moduleMigrationResult) {
					mL(0, "Migration", module, "Finished without Migration Data");
					continue;
				}
				mL(0, "Migration", "Finished for", module);
				metaMigrateModulesResult = {
					...(metaMigrateModulesResult ?? {}), //? needs !null to work
					...moduleMigrationResult,
				};
				mL(3, "Migration", module, "Finished Result:", metaMigrateModulesResult);
				continue;
			} else {
				mL(0, "Migration", module, "Migration is not required");
				updateProgress(`${moduleMessage} ${_loc("METANTHROPES.MIGRATION.NoUpdate")}`);
				continue;
			}
		}
	} catch (error) {
		mL(
			2,
			"Migration",
			"Encountered unexpected error:",
			error,
			"Aborting without finalizing",
			"Migration will retry on the next World load",
		);
		progress.update({
			pct: 1,
			message: `${progressMessage} | ${_loc("METANTHROPES.MIGRATION.Error")}`,
		});
		return;
	}
	//* Consolidate migrationDataUpdate results and do the game.settings update
	//? contributes + 1 to to total counter
	if (!metaMigrateModulesResult) {
		mL(0, "Migration", "World Data Migration not required");
		progress.update({
			pct: 1,
			message: `${progressMessage} | ${_loc("METANTHROPES.MIGRATION.NoUpdate")}`,
		});
	} else {
		updateProgress(`${progressMessage} | ${_loc("METANTHROPES.MIGRATION.Finalizing")}`);
		mL(0, "Migration", "Updating Game Settings with Data Migration Results");
		await game.settings.set("metanthropes", "migration", {
			...migrationData,
			...metaMigrateModulesResult,
		});
		//* Force migration flag will reset if we do an update
		mL(0, "Migration", "Reseting Force Migration setting");
		await game.settings.set("metanthropes", "forceMigration", false);
		progress.update({
			pct: 1,
			message: `${progressMessage} | ${_loc("METANTHROPES.MIGRATION.Finished")}`,
		});
	}
	const migrationDataResults = await game.settings.get("metanthropes", "migration");
	mL(3, "Migration", "New Migration Data Results", migrationDataResults);
	mL(0, "Migration", "Data Migration Engine Finished");
}

/**
 * Initializes the order of Data Migration according to active and enabled Modules
 * Only enabled Modules under Metanthropes game settings will trigger Data Migration
 *
 * todo: review how to gracefuly handle a module that was enabled (the setting was set) but disabled as a module afterwards
 *
 * @async
 * @returns {*} modules - an array with the enabled Modules for Data Migration
 */
async function metaInitializeModules() {
	let modules = [["System", "METANTHROPES.MODULES.System"]];
	const intro = await game.settings.get("metanthropes", "metaIntroductory");
	if (intro) modules.push(["Introductory", "METANTHROPES.MODULES.Introductory"]);
	const core = await game.settings.get("metanthropes", "metaCore");
	if (core) modules.push(["Core", "METANTHROPES.MODULES.Core"]);
	const homebrew = await game.settings.get("metanthropes", "metaHomebrew");
	if (homebrew) modules.push(["Homebrew", "METANTHROPES.MODULES.Homebrew"]);
	const aether = await game.settings.get("metanthropes", "metaAether");
	if (aether) modules.push(["Aether", "METANTHROPES.MODULES.Aether"]);
	const astral = await game.settings.get("metanthropes", "metaAstral");
	if (astral) modules.push(["Astral", "METANTHROPES.MODULES.Astral"]);
	const nether = await game.settings.get("metanthropes", "metaNether");
	if (nether) modules.push(["Nether", "METANTHROPES.MODULES.Nether"]);
	return modules;
}

//async function metaMigrateModules(migrationData, modules) {}

/**
 * Module Migration goes through each enabled Module to apply specific migration logic to each content
 *
 * Returns a valid moduleDataUpdate if it received updates
 * Returns false if it didn't receive any updates
 *
 * Modules that are disabled from the Metanthropes Settings will not trigger a migration of their Data, even if the respective Module is Active.
 * todo: improve on modular approach
 *
 * @async
 * @param {*} module
 * @param {*} migrationData
 * @param {*} currentSystemVersion
 * @param {*} moduleName
 * @returns {*}
 */
async function metaMigrateModuleData(module, migrationData, currentSystemVersion, moduleName) {
	const mL = metanthropes.utils.metaLog;
	let moduleDataUpdate = null;
	//todo: I could make it even more modular with upcoming Anthologies without the switch
	//todo: but rather it takes the module itself and use it as migration[handlername]();
	//todo: callin each modules' dedicated function more cleanly
	switch (module) {
		case "System":
			//* Migrate Prototype Token Defaults
			const prototypeTokenDefaults = await metaMigrateDataPrototypeTokenDefaults(
				migrationData,
				currentSystemVersion,
			);
			if (prototypeTokenDefaults) moduleDataUpdate = prototypeTokenDefaults;
			break;
		case "Introductory":
			const introDataMigrationResults = await metaMigrateDataIntroductory(migrationData, currentSystemVersion);
			if (introDataMigrationResults) moduleDataUpdate = introDataMigrationResults;
			break;
		case "Core":
			const coreDataMigrationResults = await metaMigrateDataCore(migrationData, currentSystemVersion);
			if (coreDataMigrationResults) moduleDataUpdate = coreDataMigrationResults;
			break;
		case "Homebrew":
			//* Placeholder for Metanthropes: Homebrew specific migrations
			break;
		case "Aether":
			//* Placeholder for Metanthropes: Anthologies - Aether specific migrations
			break;
		case "Astral":
			//* Placeholder for Metanthropes: Anthologies - Astral specific migrations
			break;
		case "Nether":
			//* Placeholder for Metanthropes: Anthologies - Nether specific migrations
			break;
		default:
			mL(2, "Migration", "Encountered an error trying to process module:", module);
			throw `Error trying to process Module: ${module}`;
	}
	//* Finalize Module Data Migration Results
	const prevMigration = migrationData[module] || {};
	if (moduleDataUpdate) {
		const moduleMigrationResult = {
			[module]: {
				...prevMigration,
				lastMigrationVersion: currentSystemVersion,
				...moduleDataUpdate,
			},
		};
		mL(3, "metaMigrateModuleData", module, "Returning Migration Results");
		return moduleMigrationResult;
	} else {
		mL(4, "metaMigrateModuleData", module, "Did not receive valid Migration Data or Update not required");
		return false;
	}
}

/**
 * Calls the Core Data Migration
 * todo: modularity for upcoming modules
 *
 * @async
 * @param {*} migrationData
 * @param {*} currentSystemVersion
 * @returns {updateData}
 */
async function metaMigrateDataCore(migrationData, currentSystemVersion) {
	const mL = metanthropes.utils.metaLog;
	mL(0, "System", "Migration", "Initializing Core Data Migration");
	//todo better error handling if API is unavailable needed?
	const coreUpdateData = await metanthropes.utils?.metaCoreMigration(migrationData, currentSystemVersion);
	if (coreUpdateData) {
		mL(0, "System", "Migration", "Finished Core Data Migration");
		return coreUpdateData;
	} else {
		mL(
			0,
			"System",
			"Migration",
			"Canceled",
			"Did not receive valid Core Migration Data",
			"OR",
			"Update was not required",
		);
		return false;
	}
}

/**
 * Calls the Core Data Migration
 * todo: modularity for upcoming modules
 *
 * @async
 * @param {*} migrationData
 * @param {*} currentSystemVersion
 * @returns {updateData}
 */
async function metaMigrateDataIntroductory(migrationData, currentSystemVersion) {
	const mL = metanthropes.utils.metaLog;
	mL(0, "System", "Migration", "Initializing Introductory Data Migration");
	//todo better error handling if API is unavailable needed?
	const introUpdateData = await metanthropes.utils?.metaIntroductoryMigration(migrationData, currentSystemVersion);
	if (introUpdateData) {
		mL(0, "System", "Migration", "Finished Introductory Data Migration");
		return introUpdateData;
	} else {
		mL(
			0,
			"System",
			"Migration",
			"Canceled",
			"Did not receive valid Introductory Migration Data",
			"OR",
			"Update was not required",
		);
		return false;
	}
}
/**
 * Manages updating the overrides for the default Prototype Token Defauls introduced with v13
 *
 * @async
 * @param {*} migrationData Migration Data object
 * @param {*} currentSystemVersion
 * @returns {updateData}
 */
async function metaMigrateDataPrototypeTokenDefaults(migrationData, currentSystemVersion) {
	const mL = metanthropes.utils.metaLog;
	const settingApplied = migrationData?.System?.prototypeTokenOverridesApplied ?? null;
	const settingAppliedVersion = migrationData?.System?.prototypeTokenOverridesAppliedVersion ?? 0;
	const settingRequiredVersion = "0.13.26"; //? version # is to be entered manually when a feature is introduced
	const isNewerVersion = foundry.utils.isNewerVersion(settingRequiredVersion, settingAppliedVersion);
	if (settingApplied && !isNewerVersion) {
		mL(0, "Migration", "System", "Default Token Overrides already established");
		return false;
	} else {
		mL(0, "Migration", "System", "Establishing New Default Token Overrides");
		const newTokenDefaults = metanthropes.system.TOKENDEFAULTS;
		await game.settings.set("core", "prototypeTokenOverrides", newTokenDefaults);
		const updateData = {
			prototypeTokenOverridesApplied: true,
			prototypeTokenOverridesAppliedVersion: currentSystemVersion,
		};
		return updateData;
	}
}

//! Unused - Deprecated Migrations

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
			mL(3, `metaMigrateData`, `_metaTemplateChanges`, `Migrating Item Target Type Selections for:`, item.name);
			item.update({ "system.Execution.TargetsType.selections": newSelections });
		}
		if (item.system.Execution.TargetsType.value === "Living") {
			item.update({ "system.Execution.TargetsType.value": "Organism" });
			mL(3, `metaMigrateData`, `_metaTemplateChanges`, `Migrated Item:`, item.name);
		}
	}
}

//* Helper function to migrate Items
async function _metaMigrateItems() {
	const currentVersion = await game.system.data.version;
	mL(3, `metaMigrateData`, `_metaMigrateItems`, `Migrating Items to version`, currentVersion);
	const worldItems = await game.items.contents;
	for (let item of worldItems) {
		if (item.system.Effects.EffectDescription.label === "Effect Description") {
			mL(4, `metaMigrateData`, `_metaMigrateItems`, `Migrating Item:`, item.name, item);
			await item.update({ "system.Effects.EffectDescription.label": "Effect" });
		}
		if (item.system.Effects.PermanentEffectDescription.label === "Permanent Effect") {
			mL(4, `metaMigrateData`, `_metaMigrateItems`, `Migrating Item:`, item.name, item);
			await item.update({ "system.Effects.PermanentEffectDescription.label": "Permanent Effects" });
		}
		if (item.system.Execution.AreaEffectType) {
			mL(4, `metaMigrateData`, `_metaMigrateItems`, `Migrating Item:`, item.name, item);
			await item.update({ "system.Execution.-=AreaEffectType": null });
		}
	}
}

//* Helper function to check for invalid actors
async function _metaInvalidData() {
	//* from: https://foundryvtt.com/article/v10-data-model/
	//? Retrieve the data for an invalid document
	//! this is giving an error
	const invalidActorIds = Array.from(game.actors._invalidActorIds) || null;
	mL(3, "metaMigrateData", "_metaInvalidData", "Invalid Actor IDs:", invalidActorIds);
	const invalidId = await game.actors._invalidActorIds.first();
	mL(3, "metaMigrateData", "_metaInvalidData", "Invalid Actor ID:", invalidId);
	const invalidActor = await game.actors.getInvalid(invalidId);
	mL(3, "metaMigrateData", "_metaInvalidData", "Invalid Actor:", invalidActor);
	mL(3, "metaMigrateData", "_metaInvalidData", "Invalid Actor:", invalidActor);
	//* Other methods
	// //? Correct an invalid document
	// await invalidActor.update(correctedData);
	// //? Delete an invalid document
	// await invalidActor.delete();
}
