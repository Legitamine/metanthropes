import { settings } from "../config/settings.mjs";

Hooks.once("init", async function () {
	console.log(metanthropes.system.ASCII);

	//* Configure System
	globalThis.SYSTEM = metanthropes.system;

	//* Register System Settings
	await metanthropes.utils.metaRegisterGameSettings(settings);
	const alphaTestingEnabled = (await game.settings.get("metanthropes", "metaAlphaTesting")) || false;
	if (alphaTestingEnabled) metanthropes.utils.metaLog(1, "System", "Initializing", "Alpha Testing Enabled");
	const betaTestingEnabled = (await game.settings.get("metanthropes", "metaBetaTesting")) || false;
	if (betaTestingEnabled) metanthropes.utils.metaLog(1, "System", "Initializing", "Beta Testing Enabled");

	//* Register Data Models
	if (alphaTestingEnabled) {
		CONFIG.Actor.dataModels = {
			MetanthropesActorV2: metanthropes.models.MetanthropesActorV2,
		};

		CONFIG.Item.dataModels = {
			species: metanthropes.models.species,
			template: metanthropes.models.template,
		};
	}

	//* Register Document Classes
	CONFIG.Actor.documentClass = metanthropes.documents.MetanthropesActor;
	CONFIG.Item.documentClass = metanthropes.documents.MetanthropesItem;
	CONFIG.ActiveEffect.documentClass = metanthropes.documents.MetanthropesActiveEffect;
	CONFIG.Combat.documentClass = metanthropes.documents.MetanthropesCombat;

	//* Register Application Sheets
	foundry.documents.collections.Actors.registerSheet(
		"metanthropes",
		metanthropes.applications.MetanthropesActorSheet,
		{
			makeDefault: true,
			types: [
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
			],
			label: "METANTHROPES.SHEET.ACTOR.LABEL",
		},
	);

	if (alphaTestingEnabled) {
		foundry.documents.collections.Actors.registerSheet(
			"metanthropes",
			metanthropes.applications.MetanthropesActorSheetV2,
			{
				makeDefault: true,
				types: ["MetanthropesActorV2"],
				label: "METANTHROPES.SHEET.ACTORV2.LABEL",
			},
		);
	}
	foundry.documents.collections.Items.registerSheet("metanthropes", metanthropes.applications.MetanthropesItemSheet, {
		makeDefault: true,
		label: "METANTHROPES.SHEET.ITEM.LABEL",
	});

	if (alphaTestingEnabled) {
		foundry.documents.collections.Items.registerSheet(
			"metanthropes",
			metanthropes.applications.MetanthropesItemSheetV2,
			{
				makeDefault: true,
				types: ["species", "template"],
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

	//* Metanthropes Initiative System
	//todo: revisit as part of Combat rework
	CONFIG.Combat.initiative = {
		formula: "1d100 + @RollStats.Reflexes",
		decimals: 2,
	};

	//* Round Duration (in seconds)
	CONFIG.time.roundTime = 30;

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
