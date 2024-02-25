/**
 * Metanthropes Early Access System for Foundry VTT
 * Author: qp aka The Orchestrator
 * Discord: qp#8888 ; q_._p
 *
 *? The below notice is for developers & code reviewers taking a look at the codebase.
 *! This project is a work in progress and is currently in the early stages of development.
 * The few sections that have code provided to me by the FVTT Discord community, the contributors are credited in the comments.
 * Once this project is out of Early Access, I will be sure to give proper credit all the folks who have helped me along the way.
 *! Shoutout to the FoundryVTT Discord community, especially the #system-development channel and special thanks to the following people:
 * - @TyphonJS (Michael) for the metaLogDocument function
 * - @Zhell (zhell9201) for the overall help & guidance
 * - @Mana (manaflower) for the overall help & CSS wizardry
 * - @ChaosOS for the overall help & CLI guidance
 * - @mxzf for the overall help & guidance and their amazing website of FVTT resources
 *! Special shoutout to the code-wizard @aMUSiC who has guided me to avoid many pitfalls and who will be assisting with code-reviews post Early Access!
 * If you would like to contribute to this project, please feel free to reach out to me.
 *
 * * Although I come with 20+ years of experience in IT, this is my very first code project & it started back in late Feb 2023 
 * * I do understand that I have a long way to go as a developer, and I am committed to become better at it!
 * * I have been using ChatGPT v4 as a tutor and teacher to help me learn how to code, especially during the early days, not so much since 2024.
 * * I am eager to learn and improve my skills, so any constructive feedback is more than welcome.
 * 
 * Throughtout this project, I use the following syntax for comments:
 ** //! Marks a special comment that stands out (in Red) for critical notes.
 ** //* Marks a comment that is used as a section header (in Green) for better visibility.
 ** //? Marks a comment that is used for elaborating my intent (in Blue) for better readability.
 ** //todo Marks a comment that is used for marking (in Orange) potential optimization notes.
 *
 * To get automatic colloring for these comments in VSCode, you can use this extension:
 * aaron-bond.better-comments
 *
 */
//* Imports
//? Import custom classes
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
//? Import Combat Modules
import { MetanthropesCombat } from "./metanthropes/combat.mjs";
import { MetaCombatTracker } from "./metanthropes/combattracker.mjs";
import { MetaCombatant } from "./metanthropes/combatant.mjs";
//? Import document classes
import { MetanthropesActor } from "./documents/actor.mjs";
import { MetanthropesItem } from "./documents/item.mjs";
import { MetanthropesActiveEffect } from "./documents/active-effect.mjs";
//? Import sheet classes
import { MetanthropesActorSheet } from "./sheets/actor-sheet.mjs";
import { MetanthropesItemSheet } from "./sheets/item-sheet.mjs";
import { MetanthropesActiveEffectSheet } from "./sheets/active-effect-sheet.mjs";
//? Pre-load Handlebars templates
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
//? Import helpers
import { metaEvaluateReRoll } from "./metarollers/metaeval.mjs";
import { metaRolld10ReRoll, metaHungerReRoll, metaCoverReRoll } from "./metarollers/metarollextras.mjs";
import { MetaInitiativeReRoll } from "./metarollers/metainitiative.mjs";
import { MetaExecute } from "./metarollers/metaexecute.mjs";
import { metaMigrateData } from "./metanthropes/metamigration.mjs";
import { metaLog, metaLogDocument } from "./helpers/metahelpers.mjs";
//* Starting System
//* Handlebars helpers
//? Selected Helper
//! Foundry includes its own select helper, it requires a different template schema though.
//todo Deprecate all remaining uses of this custom helper and use the built-in one instead.
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
//? HTML Stripper Helper (for an Item's Effect as a tooltip)
//! Built-in data-tooltip could replace this (requires investigation)
//todo I should review usage case with data-tooltip as it can have HTML as input
Handlebars.registerHelper("stripHtml", function (htmlString) {
	if (!htmlString) return "";
	const strippedString = htmlString.replace(/<\/?[^>]+(>|$)/g, "");
	return new Handlebars.SafeString(strippedString);
});
//* System Initialization.
Hooks.once("init", async function () {
	//? add our classes so they are more easily accessible
	game.metanthropes = {
		MetanthropesActor,
		MetanthropesItem,
		rollItemMacro,
		createItemMacro,
	};
	//? Status Effects
	const idsToKeep = [];
	CONFIG.statusEffects = CONFIG.statusEffects.filter((item) => idsToKeep.includes(item.id));
	const metaStatusEffects = [
		{
			id: "invisible",
			name: "Invisible",
			flags: {
				metanthropes: {
					metaEffectType: "Buff",
					metaEffectApplication: "Cover",
					metaCycle: null,
					metaRound: null,
					metaStartCycle: null,
					metaStartRound: null,
				},
			},
			description: "<p>Invisible</p>",
			icon: "systems/metanthropes/artwork/status-effects/invisible.svg",
		},
		{
			id: "blind",
			name: "Sense-Lost: Vision",
			flags: {
				metanthropes: {
					metaEffectType: "Condition",
					metaEffectApplication: "Cover",
					metaCycle: null,
					metaRound: null,
					metaStartCycle: null,
					metaStartRound: null,
				},
			},
			description: "<p>Sense-Lost: Vision</p>",
			icon: "systems/metanthropes/artwork/status-effects/sense-lost-vision.svg",
		},
		{
			id: "dead",
			name: "Dead",
			flags: {
				metanthropes: {
					metaEffectType: "Condition",
					metaEffectApplication: "Cover",
					metaCycle: null,
					metaRound: null,
					metaStartCycle: null,
					metaStartRound: null,
				},
			},
			description: "<p>Dead</p>",
			icon: "systems/metanthropes/artwork/status-effects/dead.svg",
		},
		{
			id: "knockeddown",
			name: "Knocked Down",
			flags: {
				metanthropes: {
					metaEffectType: "Condition",
					metaEffectApplication: "Movement",
					metaCycle: null,
					metaRound: null,
					metaStartCycle: null,
					metaStartRound: null,
				},
			},
			changes: [
				{
					key: "system.physical.movement.Conditions.knockdown.value",
					mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
					value: true,
				},
			],
			description: "<p>Knocked Down</p>",
			icon: "systems/metanthropes/artwork/status-effects/knocked-down.svg",
		},
		{
			id: "immobilized",
			name: "Immobilized",
			flags: {
				metanthropes: {
					metaEffectType: "Condition",
					metaEffectApplication: "Movement",
					metaCycle: null,
					metaRound: null,
					metaStartCycle: null,
					metaStartRound: null,
				},
			},
			changes: [
				{
					key: "system.physical.movement.Conditions.immobilized.value",
					mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
					value: true,
				},
				{
					key: "system.physical.movement.value",
					mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
					value: 0,
				},
			],
			description: "<p>Immobilized</p>",
			icon: "systems/metanthropes/artwork/status-effects/immobilized.svg",
		},
	];
	CONFIG.statusEffects.push(...metaStatusEffects);
	//? Metanthropes Initiative System
	//! should I remove this? - removing it seems to break initiative, as we are 'highjacking' the formula method for metainitiative rolls
	CONFIG.Combat.initiative = {
		formula: "1d100 + @RollStats.Reflexes",
		decimals: 2,
	};
	//? Metanthropes Combat System
	CONFIG.Combat.documentClass = MetanthropesCombat;
	//? setup custom combatant
	//! CONFIG.Combatant.documentClass = MetaCombatant; instead?
	CONFIG.Actor.entityClass = MetaCombatant;
	//? setup custom combat tracker
	CONFIG.ui.combat = MetaCombatTracker;
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
	//? Uncomment for development
	// console.log(CONFIG);
	//? time in seconds for Round Duration
	//todo: confirm default round time
	//CONFIG.time.roundTime = 120;
	//? Define custom document classes.
	CONFIG.Actor.documentClass = MetanthropesActor;
	CONFIG.Item.documentClass = MetanthropesItem;
	CONFIG.ActiveEffect.documentClass = MetanthropesActiveEffect;
	//? Register sheet application classes instead of default
	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("metanthropes", MetanthropesActorSheet, {
		makeDefault: true,
	});
	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("metanthropes", MetanthropesItemSheet, {
		makeDefault: true,
	});
	DocumentSheetConfig.registerSheet(ActiveEffect, "metanthropes", MetanthropesActiveEffectSheet, {
		makeDefault: true,
	});
	//* System Settings
	//? Migration Script Required
	//! unused
	game.settings.register("metanthropes", "migrationVersion", {
		name: "Last Migration Performed",
		hint: `
		This setting is used to keep track of the last migration script that was performed.
		This setting is not visible in the UI and only used by the migration scripts.
		`,
		scope: "world", //? This specifies if it's a client-side setting
		config: false, //? This makes the setting appear in the module configuration
		requiresReload: false, //? If true, a client reload (F5) is required to activate the setting
		type: String,
		default: "0.8.20",
	});
	//? Advanced Logging
	game.settings.register("metanthropes", "metaAdvancedLogging", {
		name: "Enable Advanced Logging",
		hint: `
		The Console helps you identify any issues or potential bugs in regards to Metanthropes System for Foundry VTT.
		Enable this setting to see even more detailed logs in the Console.
		You can press 'F12' in the Foundry Client or 'CTRL+SHIFT+i' in a Chrome-ium web browser to show the Console.
		`,
		scope: "client", //? This specifies if it's a client-side setting
		config: true, //? This makes the setting appear in the module configuration
		requiresReload: false, //? If true, a client reload (F5) is required to activate the setting
		type: Boolean,
		default: false,
		onChange: (value) => {
			//? Do something when the setting is changed, if necessary
		},
	});
	//? Introductory Module Settings
	game.settings.register("metanthropes", "metaIntroductory", {
		name: "Enable Introductory Features",
		hint: `
				Enable this setting to gain access to the Introductory Module features.
				`,
		scope: "world", //? This specifies if it's a client-side setting
		config: false, //? This makes the setting appear in the module configuration
		requiresReload: true, //? If true, a client reload (F5) is required to activate the setting
		type: Boolean,
		default: false,
		onChange: (value) => {
			//? Do something when the setting is changed, if necessary
		},
	});
	//? Core Module Settings
	game.settings.register("metanthropes", "metaCore", {
		name: "Enable Core Features",
		hint: `
			Enable this setting to gain access to the Core Module Features.
			`,
		scope: "world", //? This specifies if it's a client-side setting
		config: false, //? This makes the setting appear in the module configuration
		requiresReload: true, //? If true, a client reload (F5) is required to activate the setting
		type: Boolean,
		default: false,
		onChange: (value) => {
			//? Do something when the setting is changed, if necessary
		},
	});
	//? Homebrew Module Settings
	game.settings.register("metanthropes", "metaHomebrew", {
		name: "Enable Homebrew Features",
		hint: `
			Enable this setting to gain access to the Homebrew Module features.
			`,
		scope: "world", //? This specifies if it's a client-side setting
		config: false, //? This makes the setting appear in the module configuration
		requiresReload: true, //? If true, a client reload (F5) is required to activate the setting
		type: Boolean,
		default: false,
		onChange: (value) => {
			//? Do something when the setting is changed, if necessary
		},
	});
	//? Beta Features Testing
	game.settings.register("metanthropes", "metaBetaTesting", {
		name: "Enable Beta Testing of New Features",
		hint: `
		Enable this setting to test New Features that are still in development.
		These features may not be fully functional and are subject to change during development.
		Make sure you backup your world before enabling this setting - just to be safe.
		`,
		scope: "world", //? This specifies if it's a client-side setting
		config: false, //? This makes the setting appear in the module configuration
		requiresReload: true, //? If true, a client reload (F5) is required to activate the setting
		type: Boolean,
		default: false,
		onChange: (value) => {
			//? Do something when the setting is changed, if necessary
		},
	});
	//? Preload Handlebars templates.
	console.log("Metanthropes | System | Initialized");
	return preloadHandlebarsTemplates();
});
/**
 *
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
//* Hotbar Macros
//! do I need this here? Could it instead be inside a helper file that I import here and call from here?
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
//* Roll Item Macro
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
//* Ready Hook
Hooks.once("ready", async function () {
	//? Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
	Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
	//* Migration section
	metaLog(3, "Starting Migration");
	metaMigrateData();
	metaLog(3, "Finished Migration");
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
		//? Add Metanthropes Music to Moulinette
		game.moulinette.sources.push({
			type: "sounds",
			publisher: "Metanthropes",
			pack: "Music",
			source: "data",
			path: "modules/metanthropes-ost/audio/music",
		});
		//? Add Metanthropes Sound Effects to Moulinette
		game.moulinette.sources.push({
			type: "sounds",
			publisher: "Metanthropes",
			pack: "Sound Effects",
			source: "data",
			path: "modules/metanthropes-ost/audio/sound-effects",
		});
		//* Free Content that we use in our closed Alpha Moulinette Integration
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
	//? Done Loading Metanthropes System
	metaLog(3, "Finished Loading Metanthropes System");
	game.togglePause(false);
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
				MetaInitiativeReRoll(event);
			} else if (button.hasClass("metapower-activate")) {
				MetaExecute(event);
			} else if (button.hasClass("possession-use")) {
				MetaExecute(event);
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
	if (
		//todo: this should be updated to check for Humanoid once actor v4 template changes are done
		//? currently ExtraD and ExtraT are also considered Humanoids based on the system.humanoids being assigned to them via the template
		actor.name.includes("New") &&
		actor.type !== "Vehicle" &&
		actor.type !== "Animal" &&
		actor.type !== "MetaTherion" &&
		actor.type !== "Animated-Plant" &&
		actor.type !== "Extradimensional" &&
		actor.type !== "Extraterrestrial"
	) {
		//* New Humanoids get a Strike equipped by default
		//? get the Strike Item from the Possessions Compendium
		const possessionCompendium = await game.packs.get("metanthropes.possessions");
		const possessionCompendiumIndex = await possessionCompendium.getIndex();
		const strikeEntry = possessionCompendiumIndex.find((item) => item.name === "Strike");
		if (strikeEntry) {
			const strikeItem = await possessionCompendium.getDocument(strikeEntry._id);
			await actor.createEmbeddedDocuments("Item", [strikeItem]);
			metaLog(3, "New Actor Event Listener", "Gave 'Strike' to:", actor.name);
		}
	}
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
