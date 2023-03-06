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

// Import document classes.
import { MetanthropesActor } from "./documents/actor.mjs";
import { MetanthropesItem } from "./documents/item.mjs";
// Import sheet classes.
import { MetanthropesActorSheet } from "./sheets/actor-sheet.mjs";
import { MetanthropesItemSheet } from "./sheets/item-sheet.mjs";
// Import helpers.
//import { CharStatsHelper } from "./helpers/charstats.mjs";
import { CHARSTATS } from "./helpers/charstats.mjs";
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
Hooks.once("init", async function() {
	console.log("========================================================================");
	console.log("Initializing Metanthropes RPG System");
	console.log("========================================================================");

	// add our classes so they are more easily accessible
	game.metanthropes = {
		MetanthropesActor,
		MetanthropesItem
	}
	// add custom constants for configuration ???
	CONFIG.CHARSTATS = CHARSTATS;
	//setup initiative system
	CONFIG.Combat.initiative = {
		formula: "1d100 + @characteristics.body.reflexes.charstat",
		decimals: 2
	};
	// Define custom Entity classes.
	CONFIG.Actor.documentClass = MetanthropesActor;
	CONFIG.Item.documentClass = MetanthropesItem;
	// Register sheet application classes instead of defaults.
	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("metanthropes", MetanthropesActorSheet, { makeDefault: true });
	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("metanthropes", MetanthropesItemSheet, { makeDefault: true });
	//preload Handlebars templates
	//loadTemplates(["systems/metanthropes/templates/partials/charstats.hbs"]);
	//return preloadTemplates();
	console.log("========================================================================");
	console.log("Metanthropes RPG System Initialized");
	console.log("========================================================================");


});

