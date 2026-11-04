import { settings } from "../config/settings.mjs";
import registerQueries from "../helpers/register-queries.mjs";

Hooks.once("init", function () {
	console.log(metanthropes.system.ASCII);

	//* Register System Settings
	metanthropes.utils.metaRegisterGameSettings(settings); //todo review sync change impact
	metanthropes.utils.metaLog(0, "System", "Initializing", "Game Settings Registered");
	//* Call Modules to Register their Settings
	Hooks.callAll("metanthropes-init");

  // Register queries.
  registerQueries();

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

	//* Alpha & Beta Testing
	const alphaTestingEnabled = metanthropes.utils.metaCheckSetting("homebrew", "metaAlphaTesting") ?? false;
	const betaTestingEnabled = metanthropes.utils.metaCheckSetting("core", "metaBetaTesting") ?? false;
	if (alphaTestingEnabled) metanthropes.utils.metaLog(1, "System", "Initializing", "Alpha Testing Enabled");
	if (betaTestingEnabled) metanthropes.utils.metaLog(1, "System", "Initializing", "Beta Testing Enabled");

	//* Register Data Models
	//todo DM Migration
	//? during Early Access, access to the new data models is reserved for Homebrew owners with Alpha Testing enabled
	if (alphaTestingEnabled) {
		CONFIG.Actor.dataModels = {
			metaActor: metanthropes.models.MetaActor,
			"metanthropes-homebrew.metaActor": metanthropes.models.MetaActor,
			character: metanthropes.data.actors.CharacterData,
			"metanthropes-homebrew.character": metanthropes.data.actors.CharacterData,
		};
		CONFIG.Item.dataModels = {
			metaSpecies: metanthropes.models.MetaSpecies,
			"metanthropes-homebrew.metaSpecies": metanthropes.models.MetaSpecies,
			metaTemplate: metanthropes.models.MetaTemplate,
			"metanthropes-homebrew.metaTemplate": metanthropes.models.MetaTemplate,
			metaBuild: metanthropes.models.MetaBuild,
			"metanthropes-homebrew.metaBuild": metanthropes.models.MetaBuild,
			ability: metanthropes.data.items.AbilityData,
			"metanthropes-homebrew.ability": metanthropes.data.items.AbilityData,
			metapower: metanthropes.data.items.MetapowerData,
			"metanthropes-homebrew.metapower": metanthropes.data.items.MetapowerData,
		};
	}

	//* Register Document Classes
	CONFIG.Actor.documentClass = metanthropes.documents.MetanthropesActor; //todo DM migration deprecate v1
	CONFIG.Item.documentClass = metanthropes.documents.MetanthropesItem; //todo DM migration deprecate v1
	CONFIG.ActiveEffect.documentClass = metanthropes.documents.MetanthropesActiveEffect;
	CONFIG.Combat.documentClass = metanthropes.documents.MetanthropesCombat;
	CONFIG.Region.documentClass = metanthropes.documents.MetanthropesRegionDocument;
  CONFIG.ChatMessage.dataModels.resolution = metanthropes.data.messages.ResolutionData;

  CONFIG.Actor.dataModels.character = metanthropes.data.actors.CharacterData;
  CONFIG.Item.dataModels.ability = metanthropes.data.items.AbilityData;
  CONFIG.Item.dataModels.metapower = metanthropes.data.items.MetapowerData;

	//* Register Metapowers Compendium
	CONFIG.Item.compendiumIndexFields.push(...metanthropes.registry.metapowers.COMPENDIUM_FIELDS);

	//* Register Application Sheets
	//? AppV1 - To be deprecated
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
	//? AppV1 - Actors
	foundry.documents.collections.Actors.registerSheet(
		"metanthropes",
		metanthropes.applications.MetanthropesActorSheet,
		{
			makeDefault: true,
			types: actorV1Types,
			label: "METANTHROPES.SHEET.ACTOR.LABEL",
		},
	);
	//? AppV1 - Items
	foundry.documents.collections.Items.registerSheet("metanthropes", metanthropes.applications.MetanthropesItemSheet, {
		makeDefault: true,
		label: "METANTHROPES.SHEET.ITEM.LABEL",
	});
	//? AppV2 - Alpha Testing
	//? Actor Sheet V2
	if (alphaTestingEnabled) {
		const actorV2Types = [
			//todo DM Migration
			"metaActor",
			"character",
			"metanthropes-homebrew.metaActor",
			"metanthropes-homebrew.character",
		];
		foundry.documents.collections.Actors.registerSheet(
			"metanthropes",
			metanthropes.applications.MetanthropesActorSheetV2,
			{
				makeDefault: true,
				types: actorV2Types,
				label: "METANTHROPES.SHEET.ACTORV2.LABEL",
			},
		);
	}
	//? Item Sheet V2
	if (alphaTestingEnabled) {
		const itemV2Types = [
			//todo DM Migration
			"metaSpecies",
			"metaTemplate",
			"metaBuild",
			"metanthropes-homebrew.metaSpecies",
			"metanthropes-homebrew.metaTemplate",
			"metanthropes-homebrew.metaBuild",
			"ability",
			"metapower",
			"metanthropes-homebrew.ability",
			"metanthropes-homebrew.metapower"
		];
		foundry.documents.collections.Items.registerSheet(
			"metanthropes",
			metanthropes.applications.MetanthropesSpeciesSheetV2,
			{
				makeDefault: true,
				types: itemV2Types, //todo DM migration
				label: "METANTHROPES.SHEET.ITEMV2.LABEL",
			},
		);
	}
	//? Active Effect V2
	foundry.applications.apps.DocumentSheetConfig.registerSheet(
		ActiveEffect,
		"metanthropes",
		metanthropes.applications.MetanthropesActiveEffectSheetV2,
		{
			makeDefault: true,
			label: "METANTHROPES.SHEET.AE.LABEL",
		},
	);
	//? Adventure Sheet - forcing AppV2
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

	//* Active Effect Expiration
	CONFIG.ActiveEffect.expiryAction = "update"; //? setting this to "delete" will remove the AE

	//* Register Movement Types
	CONFIG.Token.movement.actions = metanthropes.system.TABLES.MOVEMENTS;

	//* Round Duration (in seconds)
	CONFIG.time.roundTime = 30;

	//* Metanthropes Pause Application
	CONFIG.ui.pause = metanthropes.applications.MetanthropesPause;

	//* Register Status Effects
	metanthropes.utils.metaRegisterStatusEffects();

	//* Register Custom Text Enrichers
	metanthropes.utils.metaRegisterCustomEnrichers();

	//* Preload Handlebars templates.
	metanthropes.utils.preloadHandlebarsTemplates();

	//* V14 VFX
	//! EXPERIMENTAL
	if (alphaTestingEnabled) {
		metanthropes.utils.metaLog(1, "System", "Initializing", "Experimental VFX Engine Enabled");
		CONFIG.Canvas.vfx.enabled = true;
	}

	//* Register the socket listener
	game.socket.on("system.metanthropes", async (payload) => {
		metanthropes.logic.metaHandleSocketEvents(payload);
	});
	metanthropes.utils.metaLog(0, "System", "Initializing", "Metanthropes Socket Listener Ready");

	//* Finished Initializing the Metanthropes System
	metanthropes.utils.metaLog(0, "System", "Initialized");
});
