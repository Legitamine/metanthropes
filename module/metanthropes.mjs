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

//* System Configuration
import { SYSTEM } from "./config/system.mjs";
//* Data Models
import * as models from "./models/_data-models.mjs";
//* Documents
import { MetanthropesActor } from "./documents/actor.mjs";
import { MetanthropesItem } from "./documents/item.mjs";
import { MetanthropesActiveEffect } from "./documents/active-effect.mjs";
//* Sheets
import { MetanthropesActorSheet } from "./sheets/actor-sheet.mjs";
import { MetanthropesItemSheet } from "./sheets/item-sheet.mjs";
import { MetanthropesActiveEffectSheet } from "./sheets/active-effect-sheet.mjs";
//* AppV2 Sheets
import { MetanthropesNPCActorSheet, MetanthropesActorSheetV2 } from "./sheets/actor-sheet-v2.mjs";
//* Dice Rollers
import { metaRoll } from "./dice/metaroll.mjs";
import { metaEvaluate, metaEvaluateReRoll } from "./dice/metaeval.mjs";
import {
	metaRolld10,
	metaRolld10ReRoll,
	metaHungerRoll,
	metaHungerReRoll,
	metaCoverRoll,
	metaCoverReRoll,
} from "./dice/metarollextras.mjs";
import { metaInitiative, metaInitiativeReRoll } from "./dice/metainitiative.mjs";
//* Combat
import { MetanthropesCombat } from "./metanthropes/combat.mjs";
import { MetaCombatTracker } from "./metanthropes/combattracker.mjs";
import { MetaCombatant } from "./metanthropes/combatant.mjs";
//* Utilities
import { metaExtractNumberOfDice } from "./utils/dice-tools.mjs";
import { metaMigrateData } from "./metanthropes/metamigration.mjs";
import { metaLog } from "./utils/log-tools.mjs";
//* Game Settings
import { metaRegisterGameSettings } from "./config/settings.mjs";
import { metaRegisterStatusEffects } from "./config/status-effects.mjs";
//* Other Functions
import { metaExecute } from "./dice/metaexecute.mjs";
//* Handlebar Helpers
import { metaRegisterHandlebarHelpers } from "./config/handlebar-helpers.mjs";
//* Handlebar Templates
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
//* Custom UI
import {
	MetaSidebar,
	metaSceneDirectory,
	metaActorDirectory,
	metaItemDirectory,
	metaJournalDirectory,
	metaRollTableDirectory,
	metaPlaylistDirectory,
	metaCompendiumDirectory,
} from "./ui/custom.mjs";

//* Register Handlebars Helpers
metaRegisterHandlebarHelpers();

//* Expose API for Metanthropes
globalThis.metanthropes = {
	documents: {
		MetanthropesActor,
		MetanthropesItem,
		MetanthropesActiveEffect,
	},
	applications: {
		MetanthropesActorSheet,
		MetanthropesItemSheet,
		MetanthropesActiveEffectSheet,
		MetanthropesActorSheetV2,
		MetanthropesNPCActorSheet,
	},
	combat: {
		MetanthropesCombat,
		MetaCombatTracker,
		MetaCombatant,
	},
	dice: {
		metaRoll,
		metaEvaluate,
		metaEvaluateReRoll,
		metaRolld10,
		metaRolld10ReRoll,
		metaInitiative,
		metaInitiativeReRoll,
		metaHungerRoll,
		metaHungerReRoll,
		metaCoverRoll,
		metaCoverReRoll,
	},
	metapowers: {
		metaExecute,
	},
	models,
	possessions: {
		metaExecute,
	},
	system: SYSTEM,
	ui: {
		MetaSidebar,
		metaSceneDirectory,
		metaActorDirectory,
		metaItemDirectory,
		metaJournalDirectory,
		metaRollTableDirectory,
		metaPlaylistDirectory,
		metaCompendiumDirectory,
	},
	utils: {
		metaLog,
		metaMigrateData,
		metaExtractNumberOfDice,
		metaRegisterGameSettings,
		metaRegisterStatusEffects,
		preloadHandlebarsTemplates,
	},
};

//* Hooks
import "./hooks/init.mjs";
import "./hooks/ready.mjs";
import "./hooks/render-chat-message.mjs";
import "./hooks/create-actor.mjs";
import "./hooks/pause.mjs";
import "./hooks/supported-modules.mjs";
import "./hooks/other.mjs";
