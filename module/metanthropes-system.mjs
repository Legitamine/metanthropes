/**
 * Metanthropes RPG Official System for FoundryVTT
 * Author: qp aka The Orchestrator
 *
 * Throughtout this project, I use the following syntax for comments:
 ** //! Marks a special comment that stands out (in Red) for critical notes.
 ** //* Marks a comment that is used as a section header (in Green) for better visibility.
 ** //? Marks a comment that is used for explaining what the below code does (in Blue) for better readability.
 ** //todo Marks a comment that is used for marking (in Orange) potential optimization notes.
 *
 * To get automatic colloring for these comments in VSCode, you can use this extension:
 * aaron-bond.better-comments
 *
 */
//* Imports
//? Import Combat Modules
import { MetanthropesCombat } from "./metanthropes/combat.mjs";
import { MetaCombatTracker } from "./metanthropes/combattracker.mjs";
import { MetaCombatant } from "./metanthropes/combatant.mjs";
//? Import document classes
import { MetanthropesActor } from "./documents/actor.mjs";
import { MetanthropesItem } from "./documents/item.mjs";
//? Import sheet classes
import { MetanthropesActorSheet } from "./sheets/actor-sheet.mjs";
import { MetanthropesItemSheet } from "./sheets/item-sheet.mjs";
import { MetanthropesActorProgressionSheet } from "./sheets/actor-progression-sheet.mjs";
//? Pre-load Handlebars templates
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
//? Import helpers
import { MetaEvaluateReRoll } from "./helpers/metaeval.mjs";
import { Rolld10ReRoll, HungerReRoll } from "./helpers/extrasroll.mjs";
import { MetaInitiativeReRoll } from "./helpers/metainitiative.mjs";
import { MetaExecute } from "./helpers/metaexecute.mjs";
import { metaMigrateData } from "./metanthropes/metamigration.mjs";
import { metaLog } from "./helpers/metahelpers.mjs";
//* Handlebars helpers
//? Selected Helper
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
//? HTML Stripper Helper (for Item effect as tooltip)
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
	//? Metanthropes Initiative System
	//! should I remove this?
	CONFIG.Combat.initiative = {
		formula: "1d100 + @RollStats.Reflexes",
		decimals: 2,
	};
	//? Metanthropes Combat System
	CONFIG.Combat.documentClass = MetanthropesCombat;
	//? setup custom combatant
	CONFIG.Actor.entityClass = MetaCombatant;
	//? setup custom combat tracker
	CONFIG.ui.combat = MetaCombatTracker;
	//? time in seconds for Round Duration
	// CONFIG.time.roundTime = 120;
	//? Define custom Entity classes.
	CONFIG.Actor.documentClass = MetanthropesActor;
	CONFIG.Item.documentClass = MetanthropesItem;
	//? Register sheet application classes instead of defaults.
	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("metanthropes", MetanthropesActorSheet, {
		makeDefault: true,
	});
	Actors.registerSheet("metanthropes", MetanthropesActorProgressionSheet, {
		makeDefault: false,
	});
	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("metanthropes", MetanthropesItemSheet, {
		makeDefault: true,
	});
	//* System Settings
	//? Migration Script Required
	game.settings.register("metanthropes-system", "migrationVersion", {
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
	game.settings.register("metanthropes-system", "metaAdvancedLogging", {
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
	//? Beta Features Testing
	game.settings.register("metanthropes-system", "metaBetaTesting", {
		name: "Enable Beta Testing of New Features",
		hint: `
		Enable this setting to test New Features that are still in development.
		These features may not be fully functional and will change during development.
		This setting requires a reload (F5) to take effect.
		`,
		scope: "world", //? This specifies if it's a client-side setting
		config: true, //? This makes the setting appear in the module configuration
		requiresReload: true, //? If true, a client reload (F5) is required to activate the setting
		type: Boolean,
		default: false,
		onChange: (value) => {
			//? Do something when the setting is changed, if necessary
		},
	});
	//? Preload Handlebars templates.
	metaLog(3, "Initialized Metanthropes System");
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
			path: "systems/metanthropes-system/artwork/metapowers",
		});
		//? Add Metanthropes Portraits (Masculine) Artwork to Moulinette
		game.moulinette.sources.push({
			type: "images",
			publisher: "Metanthropes",
			pack: "Masculine Tokens",
			source: "data",
			path: "systems/metanthropes-system/artwork/tokens/portraits/masculine",
		});
		//? Add Metanthropes Portraits (Feminine) Artwork to Moulinette
		game.moulinette.sources.push({
			type: "images",
			publisher: "Metanthropes",
			pack: "Feminine Tokens",
			source: "data",
			path: "systems/metanthropes-system/artwork/tokens/portraits/feminine",
		});
		//? Add Metanthropes Music to Moulinette
		game.moulinette.sources.push({
			type: "sounds",
			publisher: "Metanthropes",
			pack: "Music",
			source: "data",
			path: "systems/metanthropes-system/audio/music",
		});
		//? Add Metanthropes Sound Effects to Moulinette
		game.moulinette.sources.push({
			type: "sounds",
			publisher: "Metanthropes",
			pack: "Sound Effects",
			source: "data",
			path: "systems/metanthropes-system/audio/sound-effects",
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
	dragRuler.registerSystem("metanthropes-system", MetanthropesSystemSpeedProvider);
	metaLog(3, "Drag Ruler Integration Finished");
});
//* Chat Message Event Listeners
Hooks.on("renderChatMessage", async (message, html) => {
	//? Get the actor from the message - all our messages have the actoruuid flag set, so if it's not our message, return.
	const actorUUID = await message.getFlag("metanthropes-system", "actoruuid");
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
				MetaEvaluateReRoll(event);
			} else if (button.hasClass("metainitiative-reroll")) {
				MetaInitiativeReRoll(event);
			} else if (button.hasClass("metapower-activate")) {
				MetaExecute(event);
			} else if (button.hasClass("possession-use")) {
				MetaExecute(event);
			} else if (button.hasClass("hunger-reroll")) {
				HungerReRoll(event);
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
//* Duplicate Self Metapower - Remove Items from Duplicates
Hooks.on("createActor", async (actor) => {
	if (actor.name.includes("Duplicate")) {
		const itemsToDelete = actor.items.filter((item) => item.name !== "Strike");
		await actor.deleteEmbeddedDocuments(
			"Item",
			itemsToDelete.map((item) => item.id)
		);
	}
});
