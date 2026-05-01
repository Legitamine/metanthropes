/**
 * Metanthropes - Official System for Foundry VTT
 * Author: The Orchestrator (qp)
 * Discord: qp#8888 ; q_._p
 *
 * If you would like to contribute to this project, please feel free to reach out to me via Discord.
 * Formal contribution will be part of v1.0, however your feedback is most welcome at this early stage.
 *
 * Throughtout this project, I use the following syntax for comments:
 ** //* Section headers & high level overview of the intended functionality.
 ** //? Sub-sections and for elaborating my intent for better readability & notes.
 ** //! Things that must be addressed in the next refactoring pass.
 ** //todo Things that should be addressed in a future pass.
 *** // comments without any special syntax are used for quick clarification of specific options.
 *
 * To get automatic coloring for comments in VSCode, you can use this extension:
 * aaron-bond.better-comments
 *
 */

//* System Configuration
import { SYSTEM } from "./config/system.mjs";
// //* Data Models
import * as models from "./models/_data-models.mjs";
//* Documents
import { MetanthropesActor } from "./documents/actor.mjs";
import { MetanthropesItem } from "./documents/item.mjs";
import { MetanthropesActiveEffect } from "./documents/active-effect.mjs";
import { MetanthropesCombat } from "./documents/combat.mjs";
//* Sheets
import { MetanthropesActorSheet } from "./ui/sheets/actor-sheet.mjs";
import { MetanthropesItemSheet } from "./ui/sheets/item-sheet.mjs";
import { MetanthropesActiveEffectSheetV2 } from "./ui/sheets/active-effect-sheet.mjs";
//* Custom Classes
import { MetaDialog, MetaChatMessage, MetanthropesPause, MetaImagePicker } from "./metaclasses/metaclasses.mjs";
// //* AppV2 Sheets
import { MetanthropesActorSheetV2 } from "./ui/sheets/actor-sheet-v2.mjs";
import { MetanthropesItemSheetV2 } from "./ui/sheets/item-sheet-v2.mjs";
//* Audio
import { metaPlaySoundEffect } from "./api/audio/play-sound-effect.mjs";
//* VFX
import { metaVFX } from "./api/vfx/meta-vfx.mjs";
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
import { metaMigration } from "./api/utils/migration.mjs";
import { metaLog, metaLogDocument } from "./api/utils/log-tools.mjs";
import { metaSortActions } from "./api/utils/sort-actions.mjs";
import { metaRunMacro } from "./api/utils/run-macro.mjs";
import { metaIsMetapowerEquipped, metaTransformStringForStorage } from "./helpers/metahelpers.mjs";
import { metaCreateFAIcon, metaCreateCustomIcon } from "./helpers/fa-enricher.mjs";
import { metaUpdateActorImages, metaConvertPortraitToTokenImage, metaUpdateTokenImages } from "./helpers/metaimagehandler.mjs";
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
		MetanthropesActiveEffectSheetV2,
		MetanthropesActorSheetV2,
		MetanthropesItemSheetV2,
		MetaDialog,
		MetaChatMessage,
		MetanthropesPause,
		MetaImagePicker,
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
	vfx: {
		metaVFX,
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
		metaMigration,
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
		metaUpdateActorImages,
		metaUpdateTokenImages,
		metaConvertPortraitToTokenImage,
	},
	registry: {
		artwork: {
			System: "systems/metanthropes/assets/artwork",
		},
	},
};

//* Hooks
import "./hooks/init.mjs";
import "./hooks/render-chat-log.mjs";
import "./hooks/render-chat-message-html.mjs";
import "./hooks/create-actor.mjs";
import "./hooks/supported-modules.mjs";
import "./hooks/other.mjs";
import "./hooks/ready.mjs";
