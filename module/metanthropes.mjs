/**
 * Metanthropes - Official System for Foundry VTT
 * Author: The Orchestrator (qp)
 * Discord: qp#8888 ; q_._p
 *
 * If you would like to contribute to this project, please feel free to reach out to me via Discord.
 * Formal contribution will be part of v1.0, however your feedback is most welcome at this early stage.
 *
 * Throughtout this project, I use the following syntax for comments:
 ** //! Marks a special comment that stands out (in Red) for critical notes/issues.
 ** //* Marks a comment that is used as a section header (in Green) for better section visibility.
 ** //? Marks a comment that is used for sub-sections and for elaborating my intent (in Blue) for better readability.
 ** //todo Marks a comment that is used for marking (in Orange) potential optimization notes.
 *** // comments without any special syntax are used for quick clarification of specific options.
 *
 * To get automatic coloring for these comments in VSCode, you can use this extension:
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
import { MetanthropesCombat } from "./documents/combat.mjs";
//* Sheets
import { MetanthropesActorSheet } from "./ui/sheets/actor-sheet.mjs";
import { MetanthropesItemSheet } from "./ui/sheets/item-sheet.mjs";
import { MetanthropesActiveEffectSheet } from "./ui/sheets/active-effect-sheet.mjs";
import { MetaDialog } from "./metaclasses/metaclasses.mjs";
//* AppV2 Sheets
import { MetanthropesNPCActorSheet, MetanthropesActorSheetV2 } from "./ui/sheets/actor-sheet-v2.mjs";
import { MetanthropesItemSheetV2 } from "./ui/sheets/item-sheet-v2.mjs";
//* Audio
import { metaPlaySoundEffect } from "./api/audio/play-sound-effect.mjs";
//* Dice Rollers
import { metaEvaluate, metaEvaluateReRoll } from "./api/dice/meta-evaluate.mjs";
import { metaRolld10, metaRolld10ReRoll, metaDamageReRoll, metaHealingReRoll } from "./api/dice/meta-rolld10.mjs";
import { metaHungerRoll, metaHungerReRoll } from "./api/dice/meta-hunger-roll.mjs";
import { metaCoverRoll, metaCoverReRoll } from "./api/dice/meta-cover-roll.mjs";
import { handleCoverRolls, metaHandleRolls } from "./api/dice/meta-handle-rolls.mjs";
import { metaInitiative, metaInitiativeReRoll } from "./api/dice/meta-initiative.mjs";
import { metaRoll } from "./api/dice/meta-roll.mjs";
import { metaExecute } from "./api/dice/meta-execute.mjs";
//* Logic
import { metaFinalizePremadeActor } from "./api/logic/finalize-premade.mjs";
import { metaApplyDamage } from "./api/logic/meta-apply-damage.mjs";
import { metaApplyHealing } from "./api/logic/meta-apply-healing.mjs";
import { metaAssignActorToPlayer } from "./api/logic/assign-actor-to-player.mjs";
import { metaApplyActorUpdates } from "./api/logic/apply-actor-updates.mjs";
import { metaHandleSocketEvents } from "./api/logic/handle-socket-events.mjs";
//* Utilities
import { prepareActiveEffectCategories, onManageActiveEffect } from "./api/utils/active-effect-tools.mjs";
import { metaExtractNumberOfDice } from "./api/utils/dice-tools.mjs";
import { metaMigrateData } from "./api/utils/migration.mjs";
import { metaLog, metaLogDocument } from "./api/utils/log-tools.mjs";
import { metaSortActions } from "./api/utils/sort-actions.mjs";
import { metaRunMacro } from "./api/utils/run-macro.mjs";
import { metaIsMetapowerEquipped, metaTransformStringForStorage } from "./helpers/metahelpers.mjs";
import { metaCreateFAIcon, metaCreateCustomIcon } from "./helpers/fa-enricher.mjs";
//* Game Settings
import { metaRegisterGameSettings } from "./api/utils/register-game-settings.mjs";
import { metaRegisterStatusEffects } from "./config/status-effects.mjs";
import { metaRegisterCustomEnrichers } from "./config/custom-enrichers.mjs";
//* Handlebar Helpers
import { metaRegisterHandlebarHelpers } from "./config/handlebar-helpers.mjs";
//* Handlebar Templates
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";

//* Register Handlebars Helpers
metaRegisterHandlebarHelpers();

//* Expose API for Metanthropes
globalThis.metanthropes = {
	documents: {
		MetanthropesActor,
		MetanthropesItem,
		MetanthropesActiveEffect,
		MetanthropesCombat,
	},
	applications: {
		MetanthropesActorSheet,
		MetanthropesItemSheet,
		MetanthropesActiveEffectSheet,
		MetanthropesActorSheetV2,
		MetanthropesNPCActorSheet,
		MetanthropesItemSheetV2,
		MetaDialog,
	},
	dice: {
		metaRoll,
		metaEvaluate,
		metaEvaluateReRoll,
		metaRolld10,
		metaRolld10ReRoll,
		metaDamageReRoll,
		metaHealingReRoll,
		metaInitiative,
		metaInitiativeReRoll,
		metaHungerRoll,
		metaHungerReRoll,
		metaCoverRoll,
		metaCoverReRoll,
		metaHandleRolls,
		handleCoverRolls,
	},
	audio: {
		metaPlaySoundEffect,
	},
	logic: {
		metaFinalizePremadeActor,
		metaApplyDamage,
		metaApplyHealing,
		metaAssignActorToPlayer,
		metaApplyActorUpdates,
		metaHandleSocketEvents,
	},
	metapowers: {
		metaExecute,
	},
	models,
	possessions: {
		metaExecute,
	},
	system: SYSTEM,
	utils: {
		metaLog,
		metaLogDocument,
		metaMigrateData,
		metaExtractNumberOfDice,
		metaRegisterGameSettings,
		metaRegisterStatusEffects,
		metaRegisterCustomEnrichers,
		onManageActiveEffect,
		prepareActiveEffectCategories,
		preloadHandlebarsTemplates,
		metaSortActions,
		metaRunMacro,
		metaTransformStringForStorage,
		metaIsMetapowerEquipped,
		metaCreateFAIcon,
		metaCreateCustomIcon,
	},
};

//* Hooks
import "./hooks/init.mjs";
import "./hooks/ready.mjs";
import "./hooks/render-chat-message-html.mjs";
import "./hooks/create-actor.mjs";
import "./hooks/pause.mjs";
import "./hooks/supported-modules.mjs";
import "./hooks/other.mjs";
