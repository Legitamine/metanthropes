console.log("Metanthropes RPG System | ====================================");
console.log("Metanthropes RPG System | Awakened");
console.log("Metanthropes RPG System | ====================================");
// Import modules.
import { MetanthropesCombat } from "./metanthropes/combat.mjs";
import { MetaCombatTracker } from "./metanthropes/combattracker.mjs";
import { MetaCombatant } from "./metanthropes/combatant.mjs";
// Import document classes.
import { MetanthropesActor } from "./documents/actor.mjs";
import { MetanthropesItem } from "./documents/item.mjs";
// Import sheet classes.
import { MetanthropesActorSheet } from "./sheets/actor-sheet.mjs";
import { MetanthropesItemSheet } from "./sheets/item-sheet.mjs";
// Import helpers.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
//? Import Re-Roll helpers
import { MetaEvaluateReRoll } from "./helpers/metaeval.mjs";
import { Rolld10ReRoll } from "./helpers/extrasroll.mjs";
import { MetapowerReRoll } from "./helpers/mprollstat.mjs";
import { PossessionReRoll } from "./helpers/posrollstat.mjs";
import { ReRollTargets } from "./helpers/extrasroll.mjs";
import { ReRollDuration } from "./helpers/extrasroll.mjs";
import { ReRollDamage } from "./helpers/extrasroll.mjs";
import { ReRollHealing } from "./helpers/extrasroll.mjs";
import { MetaInitiativeReRoll } from "./helpers/metainitiative.mjs";
import { PossessionUse } from "./helpers/posuse.mjs";
import { MetapowerActivate } from "./helpers/mpactivate.mjs";
//* Handlebars helpers
//! Supposedly Foundry includes its own select helper, but I couldn't get it to work.
Handlebars.registerHelper("selected", function (option, value) {
	return option === value ? "selected" : "";
});
//? Handlebars helper for displaying actor values on the item sheets.
//! I don't recall where this is being used exactly
Handlebars.registerHelper("getStatValue", function (statName) {
	//handlebars helper console log
	console.log("Handlebars helper statName:", statName);
	return actor.system.RollStats[statName];
});
//? this allows me to use an each loop to list stuff unless the key is...
Handlebars.registerHelper("unless_key_is", function (key, value, options) {
	if (key !== value) {
		return options.fn(this);
	}
});
// Log system initialization.
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
	//? Add support for Moulinette: Free modules with artwork & sounds is available for indexing by Moulinette
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
// Drag Ruler Integration
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
			//	I can add special modifiers to speed (like flying, etc)
			//		// Characters that aren't wearing armor are allowed to run with three times their speed
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
// Hook to look for re-rolls of meta dice in chat
// Add event listener for re-roll button click, hiding the button for non-owners
Hooks.on("renderChatMessage", async (message, html) => {
	//? Get the actor from the message
	const actorId = message.getFlag("metanthropes-system", "actorId");
	//? all our messages have the actorId flag set, so if it's not our message, return.
	if (!actorId) return;
	const actor = game.actors.get(actorId);
	//? Check if the current user is the owner of the actor
	if (game.user.name === actor.system.metaowner.value || game.user.isGM) {
		//? Unhide the buttons - assumes DF Chat Enhancements module is installed (provides hidden class)
		html.find(".hide-button").removeClass("hidden");
		//? Listen for Re-Roll button clicks
		html.find(".rolld10-reroll").on("click", Rolld10ReRoll);
		html.find(".metaeval-reroll").on("click", MetaEvaluateReRoll);
		html.find(".metapower-re-roll").on("click", MetapowerReRoll);
		html.find(".possession-re-roll").on("click", PossessionReRoll);
		html.find(".re-roll-targets").on("click", ReRollTargets);
		html.find(".re-roll-duration").on("click", ReRollDuration);
		html.find(".re-roll-damage").on("click", ReRollDamage);
		html.find(".re-roll-healing").on("click", ReRollHealing);
		//? Listen for metainitiative re-roll
		html.find(".metainitiative-re-roll").on("click", MetaInitiativeReRoll);
		//? Listen for activations
		html.find(".metapower-activate").on("click", MetapowerActivate);
		html.find(".possession-use").on("click", PossessionUse);
	}
});
//*listen for stat changes, this should enable metapower sheet to update correctly when a stat changes
//!this issue also occurs when rolling something
//! not working properly atm
Hooks.on("updateActor", (actor, data, options, userId) => {
	if (data.hasOwnProperty("system")) {
		// Get the actor's sheet
		const sheet = actor.sheet;
		// Check if the sheet is an instance of MetanthropesActorSheet
		if (sheet instanceof MetanthropesActorSheet || sheet instanceof MetanthropesItemSheet) {
			// Re-render the sheet to update the lookup value
			sheet.render();
		}
	}
});
