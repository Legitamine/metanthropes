/**
 * Controls the overall Content Data Migration each World needs, for Legitamine Games official content
 * Evaluates whether Migration is required for the Metanthropes System and Premium Modules
 * todo Displays an overall progress bar
 * Updates the migration setting for the system once it's all complete
 *
 * Migration will always trigger, if the 'Force Data migration' setting is enabled
 * This setting will reset upon a succesful application of updates from a module
 * It will also run every time a new version of the System is detected
 *
 * If running on a new World, it will also rename the default Gamemaster user to 'The Narrator'
 *
 * todo we could theoretically end up with multiple modules triggering it at the same time and it might unravel
 * todo in such a way that that the migrationData it grabs could have changed already
 * !to go around this, we could iterrate over modules enabled list that could propagate from the enabled settings of modules
 * todo review the above fixes and also review if having a force data migration flag set could be prevented (bad ux to have it persist)
 * ! this should be the only one responsible for manipulating the migration setting
 * todo give this a progress bar
 * ? having it control the grabbing and updating could help control it / pace it better
 * ? however it might be best to have it store data for each module in a separate object under each module?
 * ? this should control it though
 * todo do a round of checks first, totaling number of migrations that need to happen, then start over doing them once all checks complete.
 * todo this should be an even better way to control if a migration should proceed, when it would otherwise hang before ? like a test ?
 * ! bug progress.update percentage can go higher than 100% in some cases, which makes it look weird
 * ! this is because it will accumulate from both the good and the bad loops :/
 * @returns {Promise<void>}
 */
export async function metaMigration() {
	if (!game.user.isActiveGM) return;
	const mL = metanthropes.utils.metaLog;
	mL(0, "Migration", "Data Migration Engine Initialized");
	const modules = await metaInitializeModules();
	if (!modules) return mL(2, "Migration", "Error could not initialize Modules!");
	const progressMessage = `${game.i18n.localize("METANTHROPES.MIGRATION.World")}`;
	const progress = ui.notifications.info(progressMessage, { progress: true });
	let progressCompletedSteps = 1;
	const progressTotalSteps = 6 + modules.length;
	function updateProgress(message) {
		progressCompletedSteps++;
		progress.update({
			pct: ++progressCompletedSteps / progressTotalSteps,
			message,
		});
	}
	let metaMigrateModulesResult = null; //? If we receive no updates whatsoever, we'll end up not requiring migration.
	const isMigrationForced = await game.settings.get("metanthropes", "forceMigration");
	const currentSystemVersion = await game.system.version;
	let migrationData = await game.settings.get("metanthropes", "migration");
	const progressBarUpdate = null;
	//* Migration Engine Engaged, will update the migration game setting only if it doesn't end unexpectedly
	try {
		if (!migrationData) {
			mL(0, "Migration", "New World Detected", "Renaming Gamemaster");
			await game.users.activeGM.update({ name: game.i18n.localize("METANTHROPES.COMMON.Narrator") });
			migrationData = {};
			updateProgress(`${progressMessage}: ${game.i18n.localize("METANTHROPES.MIGRATION.Narrator")}`);
		}
		//* For each module I expect to get back either false (no migration) or the migrationDataUpdate for that module
		//todo do I want to further modularize this? //const moduleMigrationResult = await metaMigrateModules(migrationData, modules);
		mL(0, "Migration", "Initializing Data Migration for", modules.length, `Module${modules.length > 1 ? "s" : ""}`);
		for (const [module, moduleName] of modules) {
			mL(0, "Migration", "Initializing", module, "Data Migration");
			const moduleMessage = `${progressMessage}: ${game.i18n.localize(moduleName)}`;
			updateProgress(`${moduleMessage} ${game.i18n.localize("METANTHROPES.MIGRATION.Data")}`);
			const lastMigratedVersion = migrationData[module]?.lastMigrationVersion || 0;
			const isMigrationRequired = foundry.utils.isNewerVersion(currentSystemVersion, lastMigratedVersion);
			if (isMigrationRequired || isMigrationForced) {
				mL(0, "Migration", module, "World Data Migration is required or is being forced");
				updateProgress(`${moduleMessage} ${game.i18n.localize("METANTHROPES.MIGRATION.Migrating")}`);
				const moduleMigrationResult = await metaMigrateModuleData(
					module,
					migrationData,
					currentSystemVersion,
					moduleName
				);
				updateProgress(`${moduleMessage} ${game.i18n.localize("METANTHROPES.MIGRATION.DataFinalizing")}`);
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
				updateProgress(`${moduleMessage} ${game.i18n.localize("METANTHROPES.MIGRATION.NoUpdate")}`);
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
			"Migration will retry on the next World load"
		);
		progress.update({
			pct: 1,
			message: `${progressMessage}: ${game.i18n.localize("METANTHROPES.MIGRATION.Error")}`,
		});
		return;
	}
	//* Consolidate migrationDataUpdate results and do the game.settings update
	updateProgress(`${progressMessage}: ${game.i18n.localize("METANTHROPES.MIGRATION.Finalizing")}`);
	if (!metaMigrateModulesResult) {
		mL(0, "Migration", "World Data Migration not required");
		progress.update({
			pct: 1,
			message: `${progressMessage}: ${game.i18n.localize("METANTHROPES.MIGRATION.NoUpdate")}`,
		});
	} else {
		updateProgress(`${progressMessage}: ${game.i18n.localize("METANTHROPES.MIGRATION.Finalizing")}`);
		mL(0, "Migration", "Updating Game Settings with Data Migration Results");
		await game.settings.set("metanthropes", "migration", {
			...migrationData,
			...metaMigrateModulesResult,
		});
		//* Force migration flag will reset if we do an update
		mL(0, "Migration", "Reseting Force Migration setting");
		updateProgress(`${progressMessage}: ${game.i18n.localize("METANTHROPES.MIGRATION.Finalizing")}`);
		await game.settings.set("metanthropes", "forceMigration", false);
		progress.update({
			pct: 1,
			message: `${progressMessage}: ${game.i18n.localize("METANTHROPES.MIGRATION.Finished")}`,
		});
	}
	mL(0, "Migration", "Data Migration Engine Finished");
}

/**
 * Initializes the order of Data Migration according to active and enabled Modules
 * Only enabled Modules under Metanthropes game settings will trigger Data Migration
 *
 * @async
 * @returns {*} modules - an array with the enabled Modules for Data Migration
 */
async function metaInitializeModules() {
	let modules = [["System", "METANTHROPES.MODULES.System"]];
	const core = await game.settings.get("metanthropes", "metaCore");
	if (core) modules.push(["Core", "METANTHROPES.MODULES.Core"]);
	const homebrew = await game.settings.get("metanthropes", "metaHomebrew");
	if (homebrew) modules.push(["Homebrew", "METANTHROPES.MODULES.Homebrew"]);
	const intro = await game.settings.get("metanthropes", "metaIntroductory");
	if (intro) modules.push(["Introductory", "METANTHROPES.MODULES.Introductory"]);
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
 * Returns a valid moduleDataUpdate if it received updates from child functions
 * Returns false if it didn't receive any updates
 *
 * Modules that are disabled from the Metanthropes Settings will not trigger a migration of their Data
 *
 * todo: would be cool to have a more modular functionality and ability to display the % of loading bar dynamically
 * todo: => this should be moved to parent function to enable the loading bar % dynamically
 * todo consolidate the progress message and trim where able
 * todo: better error handling/logging of edge cases
 *
 * @async
 * @param {*} module
 * @param {*} migrationData
 * @param {*} currentSystemVersion
 * @returns {*} moduleMigrationResult
 */
async function metaMigrateModuleData(module, migrationData, currentSystemVersion, moduleName) {
	const mL = metanthropes.utils.metaLog;
	const progressMessage = `${game.i18n.localize(moduleName)} ${game.i18n.localize(
		"METANTHROPES.MIGRATION.Initialize"
	)}`;
	const progress = ui.notifications.info(`${progressMessage}`, { progress: true });
	progress.update({
		pct: 0.1,
		message: `${progressMessage} ${game.i18n.localize("METANTHROPES.MIGRATION.Wait")}`,
	});
	let moduleDataUpdate = null;
	//todo: I could make it even more modular with upcoming Anthologies without the switch
	//todo: but rather it takes the module itself and use it as migration[handlername]();
	//todo: callin each modules' dedicated function more cleanly
	switch (module) {
		case "System":
			//* Migrate Prototype Token Defaults
			progress.update({
				pct: 0.2,
				message: `${progressMessage} ${game.i18n.localize("METANTHROPES.MIGRATION.PrototypeTokens")}`,
			});
			const prototypeTokenDefaults = await metaMigrateDataPrototypeTokenDefaults(
				migrationData,
				currentSystemVersion
			);
			if (prototypeTokenDefaults) moduleDataUpdate = prototypeTokenDefaults;
			progress.update({
				pct: 0.7,
				message: `${progressMessage} ${game.i18n.localize("METANTHROPES.MIGRATION.Finalizing")}`,
			});
			break;
		case "Core":
			progress.update({
				pct: 0.2,
				message: `${progressMessage} ${game.i18n.localize("METANTHROPES.MIGRATION.Content")}`,
			});
			const coreDataMigrationResults = await metaMigrateDataCore(migrationData, currentSystemVersion);
			if (coreDataMigrationResults) moduleDataUpdate = coreDataMigrationResults;
			progress.update({
				pct: 0.7,
				message: `${progressMessage} ${game.i18n.localize("METANTHROPES.MIGRATION.Finalizing")}`,
			});
			break;
		case "Homebrew":
			//* Placeholder for Metanthropes: Homebrew specific migrations
			break;
		case "Introductory":
			//* Placeholder for Metanthropes: Introductory specific migrations
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
			progress.update({
				pct: 1,
				message: `${progressMessage} ${game.i18n.localize("METANTHROPES.MIGRATION.ModuleError")}`,
			});
			throw `Error trying to process Module: ${module}`;
	}
	//* Finalize Module Data Migration Results
	progress.update({
		pct: 0.8,
		message: `${progressMessage} ${game.i18n.localize("METANTHROPES.MIGRATION.DataFinalizing")}`,
	});
	const prevMigration = migrationData[module] || {};
	if (moduleDataUpdate) {
		const moduleMigrationResult = {
			[module]: {
				...prevMigration,
				lastMigrationVersion: currentSystemVersion,
				...moduleDataUpdate,
			},
		};
		progress.update({
			pct: 1,
			message: `${progressMessage} ${game.i18n.localize("METANTHROPES.MIGRATION.Finished")}`,
		});
		mL(0, "metaMigrateModuleData", module, "Returning Migration Results");
		return moduleMigrationResult;
	} else {
		progress.update({
			pct: 1,
			message: `${progressMessage} ${game.i18n.localize("METANTHROPES.MIGRATION.Failed")}`,
		});
		mL(0, "metaMigrateModuleData", module, "Did not receive valid Migration Data or Update not required");
		return false;
	}
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
async function metaMigrateDataCore(migrationData, currentSystemVersion) {
	const mL = metanthropes.utils.metaLog;
	mL(0, "System", "Migration", "Initializing Core Data Migration");
	//const progress = ui.notifications.info("Core Data Migration", { progress: true });
	// //todo don't need this check with the new modular version
	// progress.update({ pct: 0.2, message: "Core Data Migration: Confirming requirements before updating.." });
	// const core = await game.settings.get("metanthropes", "metaCore");
	// if (!core) {
	// 	ui.notifications.warn("Metanthropes: Core is not Enabled, please activate it in the game settings.");
	// 	progress.update({
	// 		pct: 1,
	// 		message: "Core Data Migration Canceled: requirements not met - Core is not Enabled",
	// 	});
	// 	mL(2, "System", "Migration", "Unable to complete Core Data Miration");
	// 	return false;
	// }
	//todo error handling if API is unavailable?
	//	progress.update({ pct: 0.3, message: "Core Data Migration: Updating, please do not refresh! .." });
	const coreUpdateData = await metanthropes.utils?.metaCoreMigration(migrationData, currentSystemVersion);
	//	progress.update({ pct: 0.7, message: "Core Data Migration: Updating, please do not refresh! ......." });
	if (coreUpdateData) {
		//		progress.update({ pct: 0.9, message: "Core Data Migration: Finalizing..." });
		mL(0, "System", "Migration", "Finished Core Data Migration");
		//		progress.update({ pct: 1, message: "Core Data Migration: Finished Updating!" });
		return coreUpdateData;
	} else {
		//		progress.update({ pct: 0.9, message: "Core Data Migration: Error while Finalizing..." });
		mL(
			0,
			"System",
			"Migration",
			"Canceled",
			"Did not receive valid Core Migration Data",
			"OR",
			"Update was not required"
		);
		//		progress.update({ pct: 1, message: "Core Data Migration: Migration Canceled" });
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
