console.log("Metanthropes RPG System | ====================================");
console.log("Metanthropes RPG System | Awakened");
console.log("Metanthropes RPG System | ====================================");
//? Import Combat Modules.
import { MetanthropesCombat } from "./metanthropes/combat.mjs";
import { MetaCombatTracker } from "./metanthropes/combattracker.mjs";
import { MetaCombatant } from "./metanthropes/combatant.mjs";
//? Import document classes.
import { MetanthropesActor } from "./documents/actor.mjs";
import { MetanthropesItem } from "./documents/item.mjs";
//? Import sheet classes.
import { MetanthropesActorSheet } from "./sheets/actor-sheet.mjs";
import { MetanthropesItemSheet } from "./sheets/item-sheet.mjs";
//? Pre-load Handlebars templates
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
//? Import helpers
import { MetaEvaluateReRoll } from "./helpers/metaeval.mjs";
import { Rolld10ReRoll } from "./helpers/extrasroll.mjs";
import { MetaInitiativeReRoll } from "./helpers/metainitiative.mjs";
import { MetaExecute } from "./helpers/metaexecute.mjs";
import { metaMigrateData } from "./metanthropes/metamigration.mjs";
//? Handlebars helpers
//! Supposedly Foundry includes its own select helper, but I couldn't get it to work properly.
Handlebars.registerHelper("selected", function (option, value) {
	return option === value ? "selected" : "";
});
//? Used to join an array into a single string with a space between each item ex: {{join this.value ', '}}
Handlebars.registerHelper("join", function (array, separator) {
	return array.join(separator);
});
//? Used to check if a value is an array
Handlebars.registerHelper("isArray", function (value) {
	return Array.isArray(value);
});
//! Deprecated - I don't think I'm using this anymore, but I'm not sure
// //? Handlebars helper for displaying actor values on the item sheets.
//	//! I don't recall where this is being used exactly
//	Handlebars.registerHelper("getStatValue", function (statName) {
//		console.log("Metanthropes RPG System | DEBUG: ARE WE USING THIS? | Handlebars helper statName:", statName);
//		return actor.system.RollStats[statName];
//	});
//	//? this allows me to use an each loop to list stuff unless the key is...
//	Handlebars.registerHelper("unless_key_is", function (key, value, options) {
//		if (key !== value) {
//			return options.fn(this);
//		}
//	});
//	//? Handlebars helper for joining an array into a single value

//	//? Handlebars helper for checking if the value is included in the array
//	Handlebars.registerHelper("includes", function (array, value) {
//		return Array.isArray(array) && array.includes(value);
//	});
//? System Initialization.
Hooks.once("init", async function () {
	console.log("Metanthropes RPG System | ====================================");
	console.log("Metanthropes RPG System | Initializing");
	// add our classes so they are more easily accessible
	game.metanthropes = {
		MetanthropesActor,
		MetanthropesItem,
		rollItemMacro,
		createItemMacro,
	};
	// Metanthropes Initiative System
	//! should I remove this?
	CONFIG.Combat.initiative = {
		formula: "1d100 + @RollStats.Reflexes",
		decimals: 2,
	};
	// Metanthropes Combat System
	CONFIG.Combat.documentClass = MetanthropesCombat;
	//setup custom combatant
	CONFIG.Actor.entityClass = MetaCombatant;
	// setup custom combat tracker
	CONFIG.ui.combat = MetaCombatTracker;
	// time in seconds for Round Duration
	// CONFIG.time.roundTime = 120;
	// Define custom Entity classes.
	CONFIG.Actor.documentClass = MetanthropesActor;
	CONFIG.Item.documentClass = MetanthropesItem;
	// Register sheet application classes instead of defaults.
	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("metanthropes", MetanthropesActorSheet, {
		makeDefault: true,
	});
	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("metanthropes", MetanthropesItemSheet, {
		makeDefault: true,
	});
	// Preload Handlebars templates.
	console.log("Metanthropes RPG System | Initialized");
	console.log("Metanthropes RPG System | ====================================");
	return preloadHandlebarsTemplates();
});
/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */
/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
//do I need this here? Could it instead be inside a helper file that I import here and call from here?
async function createItemMacro(data, slot) {
	// First, determine if this is a valid owned item.
	if (data.type !== "Item") return;
	if (!data.uuid.includes("Actor.") && !data.uuid.includes("Token.")) {
		return ui.notifications.warn("You can only create macro buttons for owned Items");
	}
	// If it is, retrieve it based on the uuid.
	const item = await Item.fromDropData(data);
	// Create the macro command using the uuid.
	const command = `game.metanthropes.rollItemMacro("${data.uuid}");`;
	let macro = game.macros.find((m) => m.name === item.name && m.command === command);
	if (!macro) {
		macro = await Macro.create({
			name: item.name,
			type: "script",
			img: item.img,
			command: command,
			flags: { "metanthropes.itemMacro": true },
		});
	}
	game.user.assignHotbarMacro(macro, slot);
	return false;
}
/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
	// Reconstruct the drop data so that we can load the item.
	const dropData = {
		type: "Item",
		uuid: itemUuid,
	};
	// Load the item from the uuid.
	Item.fromDropData(dropData).then((item) => {
		// Determine if the item loaded and if it's an owned item.
		if (!item || !item.parent) {
			const itemName = item?.name ?? itemUuid;
			return ui.notifications.warn(
				`Could not find item ${itemName}. You may need to delete and recreate this macro.`
			);
		}
		// Trigger the item roll
		item.roll();
	});
}
/* -------------------------------------------- */
//*Hooks
/* -------------------------------------------- */
/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */
// dragable macros
Hooks.once("ready", async function () {
	//? Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
	Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
	//* Migration section
	console.log("Metanthropes RPG System | Starting Migration");
	await metaMigrateData();
	console.log("Metanthropes RPG System | Finished Migration");
	//? Add support for Moulinette: Free modules with artwork & sounds are indexable by Moulinette
	if (game.moulinette) {
		game.moulinette.sources.push({
			type: "images",
			publisher: "Metanthropes RPG",
			pack: "Metapowers",
			source: "data",
			path: "systems/metanthropes-system/artwork/metapowers",
		});
		game.moulinette.sources.push({
			type: "images",
			publisher: "Metanthropes RPG",
			pack: "Masculine Tokens",
			source: "data",
			path: "systems/metanthropes-system/artwork/tokens/portraits/masculine",
		});
		game.moulinette.sources.push({
			type: "images",
			publisher: "Metanthropes RPG",
			pack: "Feminine Tokens",
			source: "data",
			path: "systems/metanthropes-system/artwork/tokens/portraits/feminine",
		});
		game.moulinette.sources.push({
			type: "sounds",
			publisher: "Dark Raven",
			pack: "Free Soundscapes Module",
			source: "data",
			path: "modules/darkraven-games-soundscapes-free/audio",
		});
		game.moulinette.sources.push({
			type: "images",
			publisher: "Fragmaps",
			pack: "Fragmaps Free Images",
			source: "data",
			path: "modules/fragmaps-free/images",
		});
		game.moulinette.sources.push({
			type: "images",
			publisher: "Fragmaps",
			pack: "Fragmaps Free Tiles",
			source: "data",
			path: "modules/fragmaps-free/images/tiles",
		});
		game.moulinette.sources.push({
			type: "sounds",
			publisher: "Ivan Duch",
			pack: "Free Music Packs",
			source: "data",
			path: "modules/ivan-duch-music-packs/audio",
		});
		game.moulinette.sources.push({
			type: "sounds",
			publisher: "Michael Ghelfi",
			pack: "Free Ambience",
			source: "data",
			path: "modules/michaelghelfi/ambience",
		});
		game.moulinette.sources.push({
			type: "sounds",
			publisher: "Michael Ghelfi",
			pack: "Free Music",
			source: "data",
			path: "modules/michaelghelfi/music",
		});
		game.moulinette.sources.push({
			type: "sounds",
			publisher: "Hologrounds Free",
			pack: "Audio",
			source: "data",
			path: "modules/hologrounds-free-module/audio",
		});
		game.moulinette.sources.push({
			type: "images",
			publisher: "Hologrounds Free",
			pack: "Maps",
			source: "data",
			path: "modules/hologrounds-free-module/maps",
		});
		game.moulinette.sources.push({
			type: "images",
			publisher: "Miska Free",
			pack: "Maps",
			source: "data",
			path: "modules/miskasmaps/maps",
		});
		game.moulinette.sources.push({
			type: "images",
			publisher: "MAD Free",
			pack: "Journal",
			source: "data",
			path: "modules/mad-freecontent/images/journal",
		});
		game.moulinette.sources.push({
			type: "images",
			publisher: "MAD Free",
			pack: "Maps",
			source: "data",
			path: "modules/mad-freecontent/images/maps",
		});
		game.moulinette.sources.push({
			type: "images",
			publisher: "MAD Free",
			pack: "Tiles",
			source: "data",
			path: "modules/mad-freecontent/images/tiles",
		});
		game.moulinette.sources.push({
			type: "sounds",
			publisher: "MAD Free",
			pack: "Audio",
			source: "data",
			path: "modules/mad-freecontent/audio",
		});
		game.moulinette.sources.push({
			type: "images",
			publisher: "Coriolis",
			pack: "AI Portraits",
			source: "data",
			path: "modules/coriolis-kbender-ai-art-pack/portraits",
		});
		game.moulinette.sources.push({
			type: "images",
			publisher: "Coriolis",
			pack: "AI Tokens",
			source: "data",
			path: "modules/coriolis-kbender-ai-art-pack/tokens",
		});
		game.moulinette.sources.push({
			type: "sounds",
			publisher: "Metanthropes RPG",
			pack: "Music",
			source: "data",
			path: "systems/metanthropes-system/audio/music",
		});
		game.moulinette.sources.push({
			type: "sounds",
			publisher: "Metanthropes RPG",
			pack: "Sound Effects",
			source: "data",
			path: "systems/metanthropes-system/audio/sound-effects",
		});
	}
});
//	//? Enhanced Terrain Layer Integration - disabled until post v0.9
//	Hooks.once("enhancedTerrainLayer.ready", (RuleProvider) => {
//		console.log("Metanthropes RPG System | ====================================");
//		console.log("Metanthropes RPG System | Enhanced Terrain Layer Integration Started");
//		class MetanthropesRuleProvider extends RuleProvider {
//			calculateCombinedCost(terrain, options) {
//				//? I want to reduce movement by 1 for every 2 points of terrain (?)
//				let cost = terrain - 1;
//				return cost;
//			}
//		}
//		enhancedTerrainLayer.registerSystem("metanthropes-system", MetanthropesRuleProvider);
//		console.log("Metanthropes RPG System | Enhanced Terrain Layer Integration Finished");
//		console.log("Metanthropes RPG System | ====================================");
//	});
//? Drag Ruler Integration
Hooks.once("dragRuler.ready", (SpeedProvider) => {
	console.log("Metanthropes RPG System | ====================================");
	console.log("Metanthropes RPG System | Drag Ruler Integration Started");
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
			//todo	I can add special modifiers to speed (like flying, etc)
			// Example: Characters that aren't wearing armor are allowed to run with three times their speed
			//		if (!token.actor.data.isWearingArmor) {
			//			ranges.push({range: baseSpeed * 3, color: "dash"})
			//		}
			return ranges;
		}
	}
	dragRuler.registerSystem("metanthropes-system", MetanthropesSystemSpeedProvider);
	console.log("Metanthropes RPG System | Drag Ruler Integration Finished");
	console.log("Metanthropes RPG System | ====================================");
});
//? Chat Message Event Listeners
Hooks.on("renderChatMessage", async (message, html) => {
	//? Get the actor from the message - all our messages have the actoruuid flag set, so if it's not our message, return.
	const actorUUID = message.getFlag("metanthropes-system", "actoruuid");
	if (!actorUUID) return;
	const actor = await fromUuid(actorUUID);
	const metaowner = actor.system.metaowner.value || null;
	//? Proceed only if the current user is the owner of the actor, or a GM
	if (game.user.name === metaowner || game.user.isGM) {
		//? Unhide the buttons - assumes DF Chat Enhancements module is installed (provides hidden class that works)
		html.find(".hide-button").removeClass("hidden");
		//? Handle Main Chat Buttons (all the buttons that will be displayed if any of them is clicked)
		html.on("click", ".metanthropes-main-chat-button", function (event) {
			const button = $(event.currentTarget);
			if (button.hasClass("metaeval-reroll")) {
				MetaEvaluateReRoll(event);
			} else if (button.hasClass("metainitiative-reroll")) {
				MetaInitiativeReRoll(event);
			} else if (button.hasClass("metapower-activate")) {
				MetaExecute(event);
			} else if (button.hasClass("possession-use")) {
				MetaExecute(event);
			}
			//? Disable all main chat buttons
			html.find(".metanthropes-main-chat-button").prop("disabled", true);
		});
		//? Handle secondary chat buttons (all the buttons that will disable only themselves when clicked)
		html.on("click", ".metanthropes-secondary-chat-button", function (event) {
			const button = $(event.currentTarget);
			if (button.hasClass("rolld10-reroll")) {
				Rolld10ReRoll(event);
			}
			//? Disable only the clicked secondary chat button
			button.prop("disabled", true);
		});
	}
});
