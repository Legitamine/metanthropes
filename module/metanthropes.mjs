/**
 * Metanthropes - Early Access for Foundry VTT
 * Author: The Orchestrator (qp)
 * Discord: qp#8888 ; q_._p
 *
 * If you would like to contribute to this project, please feel free to reach out to me via Discord
 *
 * Throughtout this project, I use the following syntax for comments:
 ** //! Marks a special comment that stands out (in Red) for critical notes/issues.
 ** //* Marks a comment that is used as a section header (in Green) for better section visibility.
 ** //? Marks a comment that is used for sub-sections and for elaborating my intent (in Blue) for better readability.
 ** //todo Marks a comment that is used for marking (in Orange) potential optimization notes.
 *** // comments without any special syntax are used for quick clarification of specific options.
 *
 * To get automatic colloring for these comments in VSCode, you can use this extension:
 * aaron-bond.better-comments
 *
 */

//* Imports
//? Custom classes
import {
	MetaSidebar,
	metaSceneDirectory,
	metaActorDirectory,
	metaItemDirectory,
	metaJournalDirectory,
	metaRollTableDirectory,
	metaPlaylistDirectory,
	metaCompendiumDirectory,
} from "./metaclasses/metaclasses.mjs";
//? Combat Modules
import { MetanthropesCombat } from "./metanthropes/combat.mjs";
import { MetaCombatTracker } from "./metanthropes/combattracker.mjs";
import { MetaCombatant } from "./metanthropes/combatant.mjs";
//? Document classes
import { MetanthropesActor } from "./documents/actor.mjs";
import { MetanthropesItem } from "./documents/item.mjs";
import { MetanthropesActiveEffect } from "./documents/active-effect.mjs";
//? Sheet classes
import { MetanthropesActorSheet } from "./sheets/actor-sheet.mjs";
import { MetanthropesItemSheet } from "./sheets/item-sheet.mjs";
import { MetanthropesActiveEffectSheet } from "./sheets/active-effect-sheet.mjs";
//? Handlebars templates
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
//? Helpers
import { metaEvaluateReRoll } from "./metarollers/metaeval.mjs";
import { metaRolld10ReRoll, metaHungerReRoll, metaCoverReRoll } from "./metarollers/metarollextras.mjs";
import { metaInitiativeReRoll } from "./metarollers/metainitiative.mjs";
import { metaExecute } from "./metarollers/metaexecute.mjs";
import { metaMigrateData } from "./metanthropes/metamigration.mjs";
import { metaLog, metaLogDocument } from "./helpers/metahelpers.mjs";
//? System Configuration
import { SYSTEM } from "./config/system.mjs";
//? Data Models
import * as models from "./models/_data-models.mjs";
//? AppV2 Sheets
import { MetanthropesActorSheetV2 } from "./sheets/actor-sheet-v2.mjs";
//? Register Game Settings
import { metaRegisterGameSettings } from "./config/settings.mjs";
import { metaRegisterStatusEffects } from "./config/status-effects.mjs";
//? Handlebars Helpers
import { metaRegisterHandlebarHelpers } from "./config/handlebar-helpers.mjs";

//* Register Handlebars Helpers
metaRegisterHandlebarHelpers();

//* System Initialization.
Hooks.once("init", async function () {

	//? Configure System
	globalThis.SYSTEM = SYSTEM;
	
	game.metanthropes = {
		MetanthropesActor,
		MetanthropesItem,
	};

	//? Register Status Effects
	metaRegisterStatusEffects();

	//? Metanthropes Initiative System
	//! should I remove this? - removing it seems to break initiative, as we are 'highjacking' the formula method for metainitiative rolls
	CONFIG.Combat.initiative = {
		formula: "1d100 + @RollStats.Reflexes",
		decimals: 2,
	};

	//? Register Data Models
	CONFIG.Actor.dataModels = {
		base: models.MetanthropesActorBase,
	};

	//? Configure Active Effect Legacy Transferral
	CONFIG.ActiveEffect.legacyTransferral = false;
	
	//? Metanthropes Combat System
	CONFIG.Combat.documentClass = MetanthropesCombat;
	
	//? setup custom combatant
	//! CONFIG.Combatant.documentClass = MetaCombatant; instead?
	CONFIG.Actor.entityClass = MetaCombatant;
	
	//? setup custom combat tracker
	//CONFIG.ui.combat = MetaCombatTracker;
	
	//? replace sidebar
	CONFIG.ui.sidebar = MetaSidebar;
	
	//? Replace Sidebar Directories
	CONFIG.ui.scenes = metaSceneDirectory;
	CONFIG.ui.actors = metaActorDirectory;
	CONFIG.ui.items = metaItemDirectory;
	CONFIG.ui.journal = metaJournalDirectory;
	CONFIG.ui.tables = metaRollTableDirectory;
	CONFIG.ui.playlists = metaPlaylistDirectory;
	CONFIG.ui.compendium = metaCompendiumDirectory;
	
	//? time in seconds for Round Duration
	//todo: review how we plan to handle
	//CONFIG.time.roundTime = 30;
	
	//? Define custom document classes.
	CONFIG.Actor.documentClass = MetanthropesActor;
	CONFIG.Item.documentClass = MetanthropesItem;
	CONFIG.ActiveEffect.documentClass = MetanthropesActiveEffect;
	
	//? Register sheet application classes instead of default
	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("metanthropes", MetanthropesActorSheet, {
		makeDefault: true,
	});

	Actors.registerSheet("metanthropes", MetanthropesActorSheetV2, {
		makeDefault: false,
		label: "METANTHROPES.SHEET.ACTOR.LABEL",
	});

	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("metanthropes", MetanthropesItemSheet, {
		makeDefault: true,
	});

	DocumentSheetConfig.registerSheet(ActiveEffect, "metanthropes", MetanthropesActiveEffectSheet, {
		makeDefault: true,
	});

	//? Register System Settings
	metaRegisterGameSettings(game.settings);
	
	//? Preload Handlebars templates.
	return preloadHandlebarsTemplates();
});

//* Ready Hook
Hooks.once("ready", async function () {
	//? Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
	//todo: review if we would want this type of functionality
	//Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
	//* Migration section
	metaLog(3, "System", "Starting Migration");
	await metaMigrateData();
	metaLog(3, "System", "Finished Migration");
	//* Add support for Moulinette
	if (game.moulinette) {
		//* Metanthropes Content Moulinette Integration
		//? Add Metanthropes Metapowers Artwork to Moulinette
		game.moulinette.sources.push({
			type: "images",
			publisher: "Metanthropes",
			pack: "Metapowers",
			source: "data",
			path: "systems/metanthropes/artwork/metapowers",
		});
		//? Add Metanthropes Portraits (Masculine) Artwork to Moulinette
		game.moulinette.sources.push({
			type: "images",
			publisher: "Metanthropes",
			pack: "Masculine Tokens",
			source: "data",
			path: "systems/metanthropes/artwork/portraits/protagonist/masculine",
		});
		//? Add Metanthropes Portraits (Feminine) Artwork to Moulinette
		game.moulinette.sources.push({
			type: "images",
			publisher: "Metanthropes",
			pack: "Feminine Tokens",
			source: "data",
			path: "systems/metanthropes/artwork/portraits/protagonist/feminine",
		});
		// //? Add Metanthropes Music to Moulinette
		// game.moulinette.sources.push({
		// 	type: "sounds",
		// 	publisher: "Metanthropes",
		// 	pack: "Music",
		// 	source: "data",
		// 	path: "modules/metanthropes-ost/audio/music",
		// });
		// //? Add Metanthropes Sound Effects to Moulinette
		// game.moulinette.sources.push({
		// 	type: "sounds",
		// 	publisher: "Metanthropes",
		// 	pack: "Sound Effects",
		// 	source: "data",
		// 	path: "modules/metanthropes-ost/audio/sound-effects",
		// });
		//* Free Content that we use in our Closed Alpha playtests
		//? Add Dark Raven's Free Soundscapes to Moulinette (Free Module)
		game.moulinette.sources.push({
			type: "sounds",
			publisher: "Dark Raven",
			pack: "Free Soundscapes Module",
			source: "data",
			path: "modules/darkraven-games-soundscapes-free/audio",
		});
		//? Add Fragmaps' Free Images to Moulinette (Free Module)
		game.moulinette.sources.push({
			type: "images",
			publisher: "Fragmaps",
			pack: "Fragmaps Free Images",
			source: "data",
			path: "modules/fragmaps-free/images",
		});
		//? Add Fragmaps' Free Tiles to Moulinette (Free Module)
		game.moulinette.sources.push({
			type: "images",
			publisher: "Fragmaps",
			pack: "Fragmaps Free Tiles",
			source: "data",
			path: "modules/fragmaps-free/images/tiles",
		});
		//? Add Ivan Duch's Free Music Packs to Moulinette (Free Module)
		game.moulinette.sources.push({
			type: "sounds",
			publisher: "Ivan Duch",
			pack: "Free Music Packs",
			source: "data",
			path: "modules/ivan-duch-music-packs/audio",
		});
		//? Add Michael Ghelfi's Free Ambience to Moulinette (Free Module)
		game.moulinette.sources.push({
			type: "sounds",
			publisher: "Michael Ghelfi",
			pack: "Free Ambience",
			source: "data",
			path: "modules/michaelghelfi/ambience",
		});
		//? Add Michael Ghelfi's Free Music to Moulinette (Free Module)
		game.moulinette.sources.push({
			type: "sounds",
			publisher: "Michael Ghelfi",
			pack: "Free Music",
			source: "data",
			path: "modules/michaelghelfi/music",
		});
		//? Add Hologrounds' Free Audio to Moulinette (Free Module)
		game.moulinette.sources.push({
			type: "sounds",
			publisher: "Hologrounds Free",
			pack: "Audio",
			source: "data",
			path: "modules/hologrounds-free-module/audio",
		});
		//? Add Hologrounds' Free Maps to Moulinette (Free Module)
		game.moulinette.sources.push({
			type: "images",
			publisher: "Hologrounds Free",
			pack: "Maps",
			source: "data",
			path: "modules/hologrounds-free-module/maps",
		});
		//? Add Miska's Free Maps to Moulinette (Free Module)
		game.moulinette.sources.push({
			type: "images",
			publisher: "Miska Free",
			pack: "Maps",
			source: "data",
			path: "modules/miskasmaps/maps",
		});
		//? Add Coriolis' AI Portraits Art Pack to Moulinette (Free Module)
		game.moulinette.sources.push({
			type: "images",
			publisher: "Coriolis",
			pack: "AI Portraits",
			source: "data",
			path: "modules/coriolis-kbender-ai-art-pack/portraits",
		});
		//? Add Coriolis' AI Tokens Art Pack to Moulinette (Free Module)
		game.moulinette.sources.push({
			type: "images",
			publisher: "Coriolis",
			pack: "AI Tokens",
			source: "data",
			path: "modules/coriolis-kbender-ai-art-pack/tokens",
		});
	}
	//? Display Welcome Screen
	const welcome = await game.settings.get("metanthropes", "metaWelcome");
	if (welcome) {
		const systemWelcome = await fromUuid("Compendium.metanthropes.welcome.JournalEntry.dP9LgZVr6QDQrI4K");
		systemWelcome.sheet.render(true);
	}
	//? Display Demo Installation Guide
	const installGuide = await game.settings.get("metanthropes", "metaInstall");
	if (installGuide) {
		const metaInstall = await fromUuid("Compendium.metanthropes.install-system.JournalEntry.LtDAG4iDlxFwGo8N");
		metaInstall.sheet.render(true);
		game.settings.set("metanthropes", "metaInstall", false);
	}
	//? Done Loading Metanthropes System
	metaLog(0, "System", "Initialized");
	//? Un-pause the World
	const metaPause = await game.settings.get("metanthropes", "metaPause");
	if (metaPause) {
		metaLog(0, "System", "Un-pausing the World after initialization");
		game.togglePause(false);
	}
});

//* Drag Ruler Integration
Hooks.once("dragRuler.ready", (SpeedProvider) => {
	metaLog(3, "Drag Ruler Integration Started");
	class MetanthropesSystemSpeedProvider extends SpeedProvider {
		get colors() {
			return [
				{ id: "movement", default: 0x00ff00, name: "physical.movement.value" },
				{ id: "additional", default: 0xffff00, name: "physical.movement.additional" },
				{ id: "sprint", default: 0xff8000, name: "physical.movement.sprint" },
			];
		}
		getRanges(token) {
			const baseSpeed = token.actor.system.physical.movement.value;
			// A character can choose to move an additional lenght equal to their base movement, and sprint up to 5 times their base movement
			const ranges = [
				{ range: baseSpeed * 2, color: "movement" },
				{ range: baseSpeed * 4, color: "additional" },
				{ range: baseSpeed * 10, color: "sprint" },
			];
			//todo	I can add special modifiers to speed (like flying, etc) - perhaps Metapowers that affect Movement directly?
			// Example: Characters that aren't wearing armor are allowed to run with three times their speed
			//		if (!token.actor.data.isWearingArmor) {
			//			ranges.push({range: baseSpeed * 3, color: "dash"})
			//		}
			return ranges;
		}
	}
	dragRuler.registerSystem("metanthropes", MetanthropesSystemSpeedProvider);
	metaLog(3, "Drag Ruler Integration Finished");
});

//* Chat Message Event Listeners
Hooks.on("renderChatMessage", async (message, html) => {
	//? Get the actor from the message - all our messages have the actoruuid flag set, so if it's not our message, return.
	const actorUUID = await message.getFlag("metanthropes", "actoruuid");
	if (!actorUUID) return;
	const actor = await fromUuid(actorUUID);
	if (!actor) return;
	const metaowner = actor.system?.metaowner?.value || null;
	//? Proceed only if the current user is the owner of the actor, or a GM
	if (game.user.name === metaowner || game.user.isGM) {
		//? Unhide the buttons
		html.find(".hide-button").removeClass("hidden");
		//? Handle Main Chat Buttons (all the buttons that will be disabled if any of them is clicked)
		html.on("click", ".metanthropes-main-chat-button", function (event) {
			const button = $(event.currentTarget);
			if (button.hasClass("metaeval-reroll")) {
				metaEvaluateReRoll(event);
			} else if (button.hasClass("metainitiative-reroll")) {
				metaInitiativeReRoll(event);
			} else if (button.hasClass("metapower-activate")) {
				metaExecute(event);
			} else if (button.hasClass("possession-use")) {
				metaExecute(event);
			} else if (button.hasClass("hunger-reroll")) {
				metaHungerReRoll(event);
			} else if (button.hasClass("cover-reroll")) {
				metaCoverReRoll(event);
			}
			//? Disable all main chat buttons
			html.find(".metanthropes-main-chat-button").prop("disabled", true);
		});
		//? Handle secondary chat buttons (all the buttons that will disable only themselves when clicked)
		html.on("click", ".metanthropes-secondary-chat-button", function (event) {
			const button = $(event.currentTarget);
			if (button.hasClass("rolld10-reroll")) {
				metaRolld10ReRoll(event);
			}
			//? Disable only the clicked secondary chat button
			button.prop("disabled", true);
		});
	}
});

//* New Actor Event Listener
Hooks.on("createActor", async (actor) => {
	//* Duplicate Self Metapower Activation Detection - Rename to Duplicate & Remove Items & Effects from Duplicates
	if (actor.name.includes("Copy") && actor.isDuplicatingSelf) {
		const newName = actor.name.replace("Copy", "Duplicate");
		await actor.update({
			name: newName,
			"prototypeToken.name": newName,
			"prototypeToken.actorLink": false,
			"prototypeToken.appendNumber": true,
			"prototypeToken.prependAdjective": false,
		});
		const itemsToDelete = actor.items.filter((item) => item.name !== "Strike");
		await actor.deleteEmbeddedDocuments(
			"Item",
			itemsToDelete.map((item) => item.id)
		);
		metaLog(3, "New Actor Event Listener", "Removed Items from Duplicate", actor.name);
		const effectsToDelete = actor.effects.filter((effect) => effect.label !== "Duplicate");
		await actor.deleteEmbeddedDocuments(
			"ActiveEffect",
			effectsToDelete.map((effect) => effect.id)
		);
		metaLog(3, "New Actor Event Listener", "Removed Effects from Duplicate", actor.name);
	}
});

//* Hook to add header buttons on the Actor, Item & Effect sheets
//? from TyphonJS (Michael) on Discord
//? In system entry point. You may have to get specific for particular sheets as some don't invoke hooks for the whole hierarchy.
Hooks.on(`getActorSheetHeaderButtons`, metaLogDocument);
Hooks.on(`getItemSheetHeaderButtons`, metaLogDocument);
Hooks.on(`getActiveEffectConfigHeaderButtons`, metaLogDocument);
Hooks.on(`getActiveEffectSheetHeaderButtons`, metaLogDocument);

//* Customize Pause Logo
Hooks.on("renderPause", (app, html, options) => {
	if (options.paused) {
		const img = html.find("img")[0];
		img.src = "systems/metanthropes/artwork/ui/logos/metanthropes-logo.webp";
	}
});
