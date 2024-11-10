import { settings } from "../config/settings.mjs";

Hooks.once("init", async function () {
	console.log(metanthropes.system.ASCII);

	//* Configure System
	globalThis.SYSTEM = metanthropes.system;

	//* Register Data Models
	CONFIG.Actor.dataModels = {
		testv12: metanthropes.models.MetanthropesActorNPC,
	};
	CONFIG.Item.dataModels = {
		species: metanthropes.models.MetanthropesItemSpecies,
	};

	//* Register Document Classes
	CONFIG.Actor.documentClass = metanthropes.documents.MetanthropesActor;
	CONFIG.Item.documentClass = metanthropes.documents.MetanthropesItem;
	CONFIG.ActiveEffect.documentClass = metanthropes.documents.MetanthropesActiveEffect;
	CONFIG.Combat.documentClass = metanthropes.documents.MetanthropesCombat;

	//* Register Application Sheets
	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("metanthropes", metanthropes.applications.MetanthropesActorSheet, {
		makeDefault: true,
	});

	Actors.registerSheet("metanthropes", metanthropes.applications.MetanthropesActorSheetV2, {
		makeDefault: false,
		label: "METANTHROPES.SHEET.ACTOR.LABEL",
	});

	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("metanthropes", metanthropes.applications.MetanthropesItemSheet, {
		makeDefault: true,
	});

	Items.registerSheet("metanthropes", metanthropes.applications.MetanthropesItemSheetV2, {
		makeDefault: false,
		label: "METANTHROPES.SHEET.ITEM.LABEL",
	});

	DocumentSheetConfig.registerSheet(
		ActiveEffect,
		"metanthropes",
		metanthropes.applications.MetanthropesActiveEffectSheet,
		{
			makeDefault: true,
		}
	);

	//* Metanthropes Initiative System
	//todo: revisit as part of Combat v12
	CONFIG.Combat.initiative = {
		formula: "1d100 + @RollStats.Reflexes",
		decimals: 2,
	};

	//* Round Duration (in seconds)
	CONFIG.time.roundTime = 30;

	//* Configure Active Effect Legacy Transferral
	//todo: required for v12?
	CONFIG.ActiveEffect.legacyTransferral = false;

	//* Register System Settings
	metanthropes.utils.metaRegisterGameSettings(settings);

	//* Register Status Effects
	metanthropes.utils.metaRegisterStatusEffects();

	//* Finished Initializing the Metanthropes System
	metanthropes.utils.metaLog(0, "System", "Initialized");

	//* Preload Handlebars templates.
	return metanthropes.utils.preloadHandlebarsTemplates();
});
