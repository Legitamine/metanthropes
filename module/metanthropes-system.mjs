////
//*
//! Metanthropes RPG System for FoundryVTT
//? This is the core file for running the Metanthropes RPG System for FoundryVTT.
//todo: Enable basic functionality
//*
////
////
//*
//? Table of Contents
//*
//! 1. Imports
//? 2. System Initialization Hook
//? 3. Preload Handlebars Templates
//? 4. Ready Hook
//? 5. Hotbar Macros
////
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
// import { MetaInitiative } from "./helpers/metainitiative.mjs";
// Import Meta-Dice rolling functions.
import { MetaReRoll } from "./helpers/metarollstat.mjs";
import { MetapowerReRoll } from "./helpers/mprollstat.mjs";
import { PossessionReRoll } from "./helpers/posrollstat.mjs";
import { MetapowerActivate } from "./helpers/mpactivate.mjs";
// Handlebars helper for drop-down menus.
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
	console.log("========================================================================");
	console.log("Initializing Metanthropes RPG System");
	console.log("========================================================================");
	// add our classes so they are more easily accessible
	game.metanthropes = {
		MetanthropesActor,
		MetanthropesItem,
	};
	//setup initiative system
	//CONFIG.Combat.initiative = MetaInitiative;
	CONFIG.Combat.initiative = {
		formula: "1d100 + @RollStats.Reflexes",
		decimals: 2,
	};
	// setup custom combat
	CONFIG.Combat.entityClass = MetanthropesCombat;
	//setup custom combatant
	CONFIG.Actor.entityClass = MetaCombatant;
	// setup custom combat tracker
	CONFIG.ui.combat = MetaCombatTracker;
	// tiime in seconds for Round Duration
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
	console.log("========================================================================");
	console.log("Metanthropes RPG System Initialized");
	console.log("========================================================================");
	return preloadHandlebarsTemplates();
});
/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */
// dragable macros
Hooks.once("ready", async function () {
	// Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
	Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
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
// Drag Ruler Integration
Hooks.once("dragRuler.ready", (SpeedProvider) => {
	console.log("========================================================================");
	console.log("Metanthropes RPG System - Drag Ruler Integration Started");
	console.log("========================================================================");
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
			// A character can always walk it's base speed and dash twice it's base speed
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
	console.log("========================================================================");
	console.log("Metanthropes RPG System - Drag Ruler Integration Finished");
	console.log("========================================================================");
});
// Hook to look for re-rolls of meta dice in chat
// Add event listener for re-roll button click, hiding the button for non-owners
Hooks.on("renderChatMessage", async (message, html) => {
	if (message.isAuthor) {
		const actorId = message.getFlag("metanthropes-system", "actorId");
		const actor = game.actors.get(actorId);
		const currentDestiny = actor.system.Vital.Destiny.value;
		console.log("=============================================================================================");
		console.log("Metanthropes RPG Hook for MetaReRoll Button - should give actorId", actorId);
		console.log("Metanthropes RPG Hook for MetaReRoll Button - should give actor", actor);
		console.log("Metanthropes RPG Hook for MetaReRoll Button - should give currentDestiny", currentDestiny);
		console.log("=============================================================================================");
		if (actor && currentDestiny > 0) {
			html.find(".hide-button").removeClass("layout-hide");
		}
		//	else {
		//		html.find(".hide-button").addClass("layout-hide");
		//	}
		html.find(".meta-re-roll").on("click", MetaReRoll);
		html.find(".metapower-re-roll").on("click", MetapowerReRoll);
		html.find(".possession-re-roll").on("click", PossessionReRoll);
		html.find(".metapower-activate").on("click", MetapowerActivate);
	}
});
//listen for stat changes, this should enable metapower sheet to update correctly when a stat changes
Hooks.on("updateActor", (actor, data, options, userId) => {
	if (data.hasOwnProperty("system")) {
		// Get the actor's sheet
		const sheet = actor.sheet;

		// Check if the sheet is an instance of MetanthropesActorSheet
		if (sheet instanceof MetanthropesActorSheet) {
			// Re-render the sheet to update the lookup value
			sheet.render();
		}
	}
});
