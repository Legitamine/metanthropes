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
import { MetanthropesCombat } from "./combat.mjs";
// Import document classes.
import { MetanthropesActor } from "./documents/actor.mjs";
import { MetanthropesItem } from "./documents/item.mjs";
// Import sheet classes.
import { MetanthropesActorSheet } from "./sheets/actor-sheet.mjs";
import { MetanthropesItemSheet } from "./sheets/item-sheet.mjs";
// Import helpers.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { MetaInitiative } from "./helpers/metainitiative.mjs";
////
//*
//? Table of Contents
//*
//? 1. Imports
//! 2. System Initialization Hook
//? 3. Preload Handlebars Templates
//? 4. Ready Hook
//? 5. Hotbar Macros
////
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
	CONFIG.Combat.initiative = {
		roll: async function (actor) {
			await MetaInitiative(actor);
		},
	};
	// setup custom combat
	CONFIG.Combat.entityClass = MetanthropesCombat;
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
	return preloadHandlebarsTemplates();
	console.log("========================================================================");
	console.log("Metanthropes RPG System Initialized");
	console.log("========================================================================");
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
