////
//*
//! Metanthropes RPG System for FoundryVTT
//? This is the core file for running the Metanthropes RPG System for FoundryVTT.
//todo: Enable basic functionality
//* 
////

////
//*
//! Table of Contents
//*
//? 1. Imports
//? 2. System Initialization Hook
//? 3. Preload Handlebars Templates
//? 4. Ready Hook
//? 5. Hotbar Macros
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
// import { CharStatsHelper } from "./helpers/charstats.mjs";

////
//*
//? Table of Contents
//*
//? 1. Imports
//! 2. System Initialization Hooks
//? 3. Preload Handlebars Templates
//? 4. Ready Hook
//? 5. Hotbar Macros
////

// Log system initialization.
Hooks.once("init", async function() {
	console.log(`Initializing Metanthropes RPG System`);
});

