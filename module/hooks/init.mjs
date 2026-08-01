import { settings } from "../config/settings.mjs";

Hooks.once("init", async function () {
	console.log(metanthropes.system.ASCII);
	//* Configure System
	//globalThis.SYSTEM = metanthropes.system;
	//! do I actualy use the SYSTEM somewhere? I'd rather not put it out there if it's not used by us.

	//* Register Fonts
	CONFIG.fontDefinitions = {
		...CONFIG.fontDefinitions,
		Metanthropes: {
			editor: true,
			fonts: [{ urls: ["systems/metanthropes/assets/fonts/metanthropes.ttf"] }],
		},
		Roboto: {
			editor: true,
			fonts: [{ urls: ["systems/metanthropes/assets/fonts/roboto.ttf"] }],
		},
	};

	//* Register System Settings
	await metanthropes.utils.metaRegisterGameSettings(settings);
	const alphaTestingEnabled = metanthropes.utils.metaCheckSetting("homebrew", "metaAlphaTesting") ?? false;
	if (alphaTestingEnabled) metanthropes.utils.metaLog(1, "System", "Initializing", "Alpha Testing Enabled");
	if (metanthropes.utils.metaCheckSetting("core", "metaBetaTesting"))
		metanthropes.utils.metaLog(1, "System", "Initializing", "Beta Testing Enabled");

	//* Register Data Models
	if (alphaTestingEnabled) {
		CONFIG.Actor.dataModels = {
			metaActor: metanthropes.models.MetaActor,
			"metanthropes-homebrew.metaActor": metanthropes.models.MetaActor, //todo DM Migration
		};
		CONFIG.Item.dataModels = {
			metaSpecies: metanthropes.models.MetaSpecies,
			metaTemplate: metanthropes.models.MetaTemplate,
			metaBuild: metanthropes.models.MetaBuild,
		};
	}

	//* Register Document Classes
	CONFIG.Actor.documentClass = metanthropes.documents.MetanthropesActor;
	CONFIG.Item.documentClass = metanthropes.documents.MetanthropesItem;
	CONFIG.ActiveEffect.documentClass = metanthropes.documents.MetanthropesActiveEffect;
	CONFIG.Combat.documentClass = metanthropes.documents.MetanthropesCombat;
	//todo missing MetaChatMessage === didn't register mine as the default so it falls back to the default

	//* Active Effect Expiration
	CONFIG.ActiveEffect.expiryAction = "update"; //? setting this to "delete" will remove the AE

	//* Register Application Sheets
	const actorV1Types = [
		"Protagonist",
		"Metanthrope",
		"Human",
		"Animal",
		"Artificial",
		"Extradimensional",
		"Extraterrestrial",
		"Animated-Cadaver",
		"Animated-Plant",
		"MetaTherion",
	];
	foundry.documents.collections.Actors.registerSheet(
		"metanthropes",
		metanthropes.applications.MetanthropesActorSheet,
		{
			makeDefault: true,
			types: actorV1Types,
			label: "METANTHROPES.SHEET.ACTOR.LABEL",
		},
	);

	if (alphaTestingEnabled) {
		foundry.documents.collections.Actors.registerSheet(
			"metanthropes",
			metanthropes.applications.MetanthropesActorSheetV2,
			{
				makeDefault: true,
				types: ["metaActor", "metanthropes-homebrew.metaActor"], //todo DM Migration
				label: "METANTHROPES.SHEET.ACTORV2.LABEL",
			},
		);
	}
	foundry.documents.collections.Items.registerSheet("metanthropes", metanthropes.applications.MetanthropesItemSheet, {
		makeDefault: true,
		label: "METANTHROPES.SHEET.ITEM.LABEL",
	});

	if (alphaTestingEnabled) {
		const itemV2Types = [
			"metaSpecies",
			"metaTemplate",
			"metaBuild",
			"metanthropes-homebrew.metaSpecies",
			"metanthropes-homebrew.metaTemplate",
			"metanthropes-homebrew.metaBuild",
		];
		foundry.documents.collections.Items.registerSheet(
			"metanthropes",
			metanthropes.applications.MetanthropesItemSheetV2,
			{
				makeDefault: true,
				types: itemV2Types, //todo DM migration
				label: "METANTHROPES.SHEET.ITEMV2.LABEL",
			},
		);
	}

	foundry.applications.apps.DocumentSheetConfig.registerSheet(
		ActiveEffect,
		"metanthropes",
		metanthropes.applications.MetanthropesActiveEffectSheetV2,
		{
			makeDefault: true,
			label: "METANTHROPES.SHEET.AE.LABEL",
		},
	);

	foundry.applications.apps.DocumentSheetConfig.registerSheet(
		Adventure,
		"metanthropes",
		foundry.applications.sheets.AdventureImporter,
		{ makeDefault: true, label: "METANTHROPES.SHEET.ADVENTURE.LABEL" },
	);

	//* Metanthropes Initiative System
	//todo: revisit as part of Combat rework
	CONFIG.Combat.initiative = {
		formula: "1d100 + @RollStats.Reflexes",
		decimals: 2,
	};

	//* Round Duration (in seconds)
	CONFIG.time.roundTime = 30;

	//* Metanthropes Pause Application
	CONFIG.ui.pause = metanthropes.applications.MetanthropesPause;

	//* Register Status Effects
	metanthropes.utils.metaRegisterStatusEffects();

	//* Register Custom Text Enrichers
	metanthropes.utils.metaRegisterCustomEnrichers();

	//* V14 VFX
	//! EXPERIMENTAL
	if (alphaTestingEnabled) {
		metanthropes.utils.metaLog(1, "System", "Initializing", "Enabling Experimental VFX Engine");
		CONFIG.Canvas.vfx.enabled = true;
	}

	//* Register the socket listener
	game.socket.on("system.metanthropes", async (payload) => {
		metanthropes.logic.metaHandleSocketEvents(payload);
	});

	//* Finished Initializing the Metanthropes System
	metanthropes.utils.metaLog(0, "System", "Initialized");

	//* Preload Handlebars templates.
	return metanthropes.utils.preloadHandlebarsTemplates();
});
