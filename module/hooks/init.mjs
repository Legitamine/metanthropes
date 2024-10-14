import { settings } from "../config/settings.mjs";

Hooks.once("init", async function () {
	//* Configure System
	globalThis.SYSTEM = metanthropes.system;

	//* Register Status Effects
	metanthropes.utils.metaRegisterStatusEffects();

	//* Metanthropes Initiative System
	//! should I remove this? - removing it seems to break initiative, as we are 'highjacking' the formula method for metainitiative rolls
	CONFIG.Combat.initiative = {
		formula: "1d100 + @RollStats.Reflexes",
		decimals: 2,
	};

	//* Register Data Models
	CONFIG.Actor.dataModels = {
		testv12: metanthropes.models.MetanthropesActorNPC,
	};
	CONFIG.Item.dataModels = {
		species: metanthropes.models.MetanthropesItemSpecies,
	};

	//* Configure Active Effect Legacy Transferral
	CONFIG.ActiveEffect.legacyTransferral = false;

	//* Metanthropes Combat System
	CONFIG.Combat.documentClass = metanthropes.combat.MetanthropesCombat;

	//* setup custom combatant
	//! CONFIG.Combatant.documentClass = MetaCombatant; instead?
	CONFIG.Actor.entityClass = metanthropes.combat.MetaCombatant;

	//* setup custom combat tracker
	//CONFIG.ui.combat = metanthropes.combat.MetaCombatTracker;

	//* Replace UI
	CONFIG.ui.sidebar = metanthropes.ui.MetaSidebar;
	CONFIG.ui.scenes = metanthropes.ui.metaSceneDirectory;
	CONFIG.ui.actors = metanthropes.ui.metaActorDirectory;
	CONFIG.ui.items = metanthropes.ui.metaItemDirectory;
	CONFIG.ui.journal = metanthropes.ui.metaJournalDirectory;
	CONFIG.ui.tables = metanthropes.ui.metaRollTableDirectory;
	CONFIG.ui.playlists = metanthropes.ui.metaPlaylistDirectory;
	CONFIG.ui.compendium = metanthropes.ui.metaCompendiumDirectory;

	//* time in seconds for Round Duration
	//todo: review how we plan to handle
	//CONFIG.time.roundTime = 30;

	//* Register Document Classes
	CONFIG.Actor.documentClass = metanthropes.documents.MetanthropesActor;
	CONFIG.Item.documentClass = metanthropes.documents.MetanthropesItem;
	CONFIG.ActiveEffect.documentClass = metanthropes.documents.MetanthropesActiveEffect;

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

	//* Register System Settings
	metanthropes.utils.metaRegisterGameSettings(settings);

	//* Finished Initializing the Metanthropes System
	metanthropes.utils.metaLog(0, "System", "Initialized");

	//* Preload Handlebars templates.
	return metanthropes.utils.preloadHandlebarsTemplates();
});
