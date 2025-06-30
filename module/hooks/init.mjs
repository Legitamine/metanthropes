import { settings } from "../config/settings.mjs";

Hooks.once("init", async function () {
	console.log(metanthropes.system.ASCII);

	//* Configure System
	globalThis.SYSTEM = metanthropes.system;

	//* Register System Settings
	metanthropes.utils.metaRegisterGameSettings(settings);

	// //* Register Data Models
	// const homebrewActive = (await game.settings.get("metanthropes", "metaHomebrew")) || false;
	// if (homebrewActive) {
	CONFIG.Actor.dataModels = {
		foufoutos: metanthropes.models.MetanthropesActorFOUFOU,
	};

	// 	CONFIG.Item.dataModels = {
	// 		species: metanthropes.models.MetanthropesItemSpecies,
	// 	};
	// }

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
			label: "METANTHROPES.SHEET.ACTOR.LABEL",
		}
	);

	// foundry.documents.collections.Actors.registerSheet(
	// 	"metanthropes",
	// 	metanthropes.applications.MetanthropesActorSheetV2,
	// 	{
	// 		makeDefault: false,
	// 		label: "METANTHROPES.SHEET.ACTOR.LABEL",
	// 	}
	// );

	foundry.documents.collections.Items.registerSheet("metanthropes", metanthropes.applications.MetanthropesItemSheet, {
		makeDefault: true,
		label: "METANTHROPES.SHEET.ITEM.LABEL",
	});

	// foundry.documents.collections.Items.registerSheet(
	// 	"metanthropes",
	// 	metanthropes.applications.MetanthropesItemSheetV2,
	// 	{
	// 		makeDefault: false,
	// 		label: "METANTHROPES.SHEET.ITEM.LABEL",
	// 	}
	// );

	foundry.applications.apps.DocumentSheetConfig.registerSheet(
		ActiveEffect,
		"metanthropes",
		metanthropes.applications.MetanthropesActiveEffectSheet,
		{
			makeDefault: true,
			label: "METANTHROPES.SHEET.AAE.LABEL",
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

	//* Register Status Effects
	metanthropes.utils.metaRegisterStatusEffects();

	//* Register the socket listener
	game.socket.on("system.metanthropes", async (payload) => {
		metanthropes.logic.metaHandleSocketEvents(payload);
	});

	//* Finished Initializing the Metanthropes System
	metanthropes.utils.metaLog(0, "System", "Initialized");

	//* Preload Handlebars templates.
	return metanthropes.utils.preloadHandlebarsTemplates();
});
