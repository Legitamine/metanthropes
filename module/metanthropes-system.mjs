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
//! organize this
import { MetaEvaluateReRoll } from "./helpers/metaeval.mjs";
// import { MetaInitiative } from "./helpers/metainitiative.mjs";
// Import Meta-Dice rolling functions.
import { MetaReRoll } from "./helpers/metarollstat.mjs";
import { MetapowerReRoll } from "./helpers/mprollstat.mjs";
import { PossessionReRoll } from "./helpers/posrollstat.mjs";
import { MetapowerActivate } from "./helpers/mpactivate.mjs";
import { ReRollTargets } from "./helpers/extrasroll.mjs";
import { ReRollDuration } from "./helpers/extrasroll.mjs";
import { ReRollDamage } from "./helpers/extrasroll.mjs";
import { ReRollHealing } from "./helpers/extrasroll.mjs";
import { MetaInitiativeReRoll } from "./helpers/metainitiative.mjs";
import { PossessionUse } from "./helpers/posuse.mjs";
// Handlebars helper for drop-down menus.
//! Supposedly Foundry includes its own select helper, but I couldn't get it to work.
Handlebars.registerHelper("selected", function (option, value) {
	return option === value ? "selected" : "";
});
// Handlebars helper for displaying actor values on the item sheets.
Handlebars.registerHelper("getStatValue", function (statName) {
	//handlebars helper console log
	console.log("Handlebars helper statName:", statName);
	return actor.system.RollStats[statName];
});
// Log system initialization.
Hooks.once("init", async function () {
	console.log("====================================");
	console.log("Initializing Metanthropes RPG System");
	console.log("====================================");
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
	console.log("====================================");
	console.log("Metanthropes RPG System Initialized");
	console.log("====================================");
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
	// Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
	Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
	// Add support for Moulinette: Free modules with artwork & sounds is available for indexing by Moulinette
	if(game.moulinette) {
		game.moulinette.sources.push({ type: "images", publisher: "Metanthropes RPG", pack: "Metapowers", source: "data", path: "systems/metanthropes-system/artwork/metapowers" })
		game.moulinette.sources.push({ type: "images", publisher: "Metanthropes RPG", pack: "Masculine Tokens", source: "data", path: "systems/metanthropes-system/artwork/tokens/portraits/masculine" })
		game.moulinette.sources.push({ type: "images", publisher: "Metanthropes RPG", pack: "Feminine Tokens", source: "data", path: "systems/metanthropes-system/artwork/tokens/portraits/feminine" })
		game.moulinette.sources.push({ type: "sounds", publisher: "Dark Raven", pack: "Free Soundscapes Module", source: "data", path: "modules/darkraven-games-soundscapes-free/audio" })
		game.moulinette.sources.push({ type: "images", publisher: "Fragmaps", pack: "Fragmaps Free Images", source: "data", path: "modules/fragmaps-free/images" })
		game.moulinette.sources.push({ type: "images", publisher: "Fragmaps", pack: "Fragmaps Free Tiles", source: "data", path: "modules/fragmaps-free/images/tiles" })
		game.moulinette.sources.push({ type: "sounds", publisher: "Ivan Duch", pack: "Free Music Packs", source: "data", path: "modules/ivan-duch-music-packs/audio" })
		game.moulinette.sources.push({ type: "sounds", publisher: "Michael Ghelfi", pack: "Free Ambience", source: "data", path: "modules/michaelghelfi/ambience" })
		game.moulinette.sources.push({ type: "sounds", publisher: "Michael Ghelfi", pack: "Free Music", source: "data", path: "modules/michaelghelfi/music" })
		game.moulinette.sources.push({ type: "sounds", publisher: "Hologrounds Free", pack: "Audio", source: "data", path: "modules/hologrounds-free-module/audio" })
		game.moulinette.sources.push({ type: "images", publisher: "Hologrounds Free", pack: "Maps", source: "data", path: "modules/hologrounds-free-module/maps" })
		game.moulinette.sources.push({ type: "images", publisher: "Miska Free", pack: "Maps", source: "data", path: "modules/miskasmaps/maps" })
		game.moulinette.sources.push({ type: "images", publisher: "MAD Free", pack: "Journal", source: "data", path: "modules/mad-freecontent/images/journal" })
		game.moulinette.sources.push({ type: "images", publisher: "MAD Free", pack: "Maps", source: "data", path: "modules/mad-freecontent/images/maps" })
		game.moulinette.sources.push({ type: "images", publisher: "MAD Free", pack: "Tiles", source: "data", path: "modules/mad-freecontent/images/tiles" })
		game.moulinette.sources.push({ type: "sounds", publisher: "MAD Free", pack: "Audio", source: "data", path: "modules/mad-freecontent/audio" })
		game.moulinette.sources.push({ type: "images", publisher: "Coriolis", pack: "AI Portraits", source: "data", path: "modules/coriolis-kbender-ai-art-pack/portraits" })
		game.moulinette.sources.push({ type: "images", publisher: "Coriolis", pack: "AI Tokens", source: "data", path: "modules/coriolis-kbender-ai-art-pack/tokens" })
		game.moulinette.sources.push({ type: "sounds", publisher: "Metanthropes RPG", pack: "Music", source: "data", path: "systems/metanthropes-system/audio/music" })
		game.moulinette.sources.push({ type: "sounds", publisher: "Metanthropes RPG", pack: "Sound Effects", source: "data", path: "systems/metanthropes-system/audio/sound-effects" })
	}
});
// Drag Ruler Integration
Hooks.once("dragRuler.ready", (SpeedProvider) => {
	console.log("====================================");
	console.log("Metanthropes RPG System - Drag Ruler Integration Started");
	console.log("====================================");
	class MetanthropesSystemSpeedProvider extends SpeedProvider {
		get colors() {
			return [
				{ id: "movement", default: 0x00ff00, name: "physical.movement.initial" },
				{ id: "additional", default: 0xffff00, name: "physical.movement.additional" },
				{ id: "sprint", default: 0xff8000, name: "physical.movement.sprint" },
			];
		}
		getRanges(token) {
			const baseSpeed = token.actor.system.physical.movement.initial;
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
	console.log("====================================");
	console.log("Metanthropes RPG System - Drag Ruler Integration Finished");
	console.log("====================================");
});
// Hook to look for re-rolls of meta dice in chat
// Add event listener for re-roll button click, hiding the button for non-owners
Hooks.on("renderChatMessage", async (message, html) => {
	//! do I really need this?
	//	console.log("=============================================================================================");
	//	console.log("Metanthropes RPG Inside Hook for Buttons");
	//	console.log("Metanthropes RPG Will go deeper if (message.isAuthor) is true:", message.isAuthor);
	//	console.log("=============================================================================================");
	if (message.isAuthor || game.user.isGM) {
		//! do I really need this?
		//const actorId = message.getFlag("metanthropes-system", "actorId");
		//const actor = game.actors.get(actorId);
		//	console.log("inside RPG button hook, actor is", actor);
		//	const currentDestiny = actor.system.Vital.Destiny.value;
		//	console.log("=============================================================================================");
		//	console.log("Metanthropes RPG Hook for Button - message.isAuthor is", message.isAuthor);
		//	console.log("Metanthropes RPG Hook for Button - game.user.isGM is", game.user.isGM);
		//	console.log("Metanthropes RPG Hook for Button - this", this);
		//	console.log("Metanthropes RPG Hook for Button - should give actorId", actorId);
		//	console.log("Metanthropes RPG Hook for Button - should give actor", actor);
		//	console.log("Metanthropes RPG Hook for Button - should give actor Name", actor.name);
		//	console.log("Metanthropes RPG Hook for Button - should give currentDestiny", currentDestiny);
		//	console.log("=============================================================================================");
		//! is this working now?
		html.find(".hide-button").removeClass("layout-hide");
		//! organize this
		html.find(".metaeval-reroll").on("click", MetaEvaluateReRoll);
		html.find(".meta-re-roll").on("click", MetaReRoll);
		html.find(".metapower-re-roll").on("click", MetapowerReRoll);
		html.find(".possession-re-roll").on("click", PossessionReRoll);
		html.find(".metapower-activate").on("click", MetapowerActivate);
		html.find(".re-roll-targets").on("click", ReRollTargets);
		html.find(".re-roll-duration").on("click", ReRollDuration);
		html.find(".re-roll-damage").on("click", ReRollDamage);
		html.find(".re-roll-healing").on("click", ReRollHealing);
		html.find(".metainitiative-re-roll").on("click", MetaInitiativeReRoll);
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