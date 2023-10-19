import { MetaEvaluate } from "../helpers/metaeval.mjs";
import { metaLog } from "../helpers/metahelpers.mjs";
/**
 * Handles rolling for Metanthropes
 *
 * This function checks various Core Conditions (e.g., unconsciousness, hunger, disease)
 * before proceeding with the roll. It then calls the MetaEvaluate function to
 * calculate the result of the roll.
 *
 * @param {Object} actor - The actor making the roll. Expected to be an Actor object.
 * @param {String} action - The type of action being performed (e.g., "StatRoll", "Initiative", etc).
 * @param {String} stat - The stat being rolled against. Expected to be a string.
 * @param {Boolean} isCustomRoll - Whether the roll is custom or not. Expected to be a boolean.
 * @param {Number} destinyCost - The destiny cost of the action. Expected to be a positive number.
 * @param {String} itemName - The name of the Metapower, Possession or Combo being used. Expected to be a string.
 *
 * @returns {Promise<void>} A promise that resolves once the function completes its operations.
 *
 * @example
 * Rolling a simple stat
 * MetaRoll(actor, "StatRoll", "Power", 0);
 */

//! px to hunger tha prepei na to pernaw kathe fora poy kanw re-roll? mporw na kanw destiny spend gia re-rolling tou hunger?
//! testing rq: protagonists, humans, metatherions klp klp linked kai mh, paizoune swsta? emfanizontai ola swsta k me to initiative??
//! thumisou na vgaleis ta ui.notifications.error apo to actor - kai isws na ta kaneis chat messages ???

export async function MetaRoll(actor, action, stat, isCustomRoll = false, destinyCost = 0, itemName = null) {
	const statScore = actor.system.RollStats[stat];
	metaLog(3, "MetaRoll", "Engaged for", actor.type + ":", actor.name + "'s", action, "with", stat);
	//* Go through a series of tests and checks before actually rolling the dice
	//? Check if we are ok to do the roll stat-wise
	if (statScore <= 0) {
		ui.notifications.error(actor.name + " can't Roll " + stat + " with a Current value of 0!");
		return;
	}
	//? Check for always active item activation
	if (itemName) {
		const actionSlot = actor.items.getName(itemName).system.Execution.ActionSlot.value;
		if (actionSlot === "Always Active") {
			ui.notifications.info(actor.name + "'s " + itemName + " is always active, no need to roll!");
			return;
		}
	}
	//* Check for Bonuses
	// space intentionally left blank
	//* Check for Penalties
	//? Check for Core Conditions
	//? Check for Hunger - if we have hunger, we must beat the hunger roll before doing our action
	//	const hunger = actor.system.Characteristics.Mind.CoreConditions.Hunger;
	//	if (hunger > 0) {
	//		try {
	//			const hungerRoll = await new Roll("1d100").evaluate({ async: true });
	//			const hungerRollResult = hungerRoll.total;
	//			if (hungerRollResult > hunger) {
	//				ui.notifications.error(actor.name + " is too hungry and can't act!");
	//				return;
	//			}
	//		} catch (error) {
	//			console.log("Metanthropes | MetaRoll | Hunger Roll Error:", error);
	//		}
	//	}
	//? Pain is passed to MetaEvaluate
	const pain = actor.system.Characteristics.Mind.CoreConditions.Pain;
	//? Check for Fatigue
	//? Check if we are unconscious
	//? Check for disease
	//! disease is expected to be a positive number, whereas penalty is expected to be negative
	let diseasePenalty = 0;
	const disease = actor.system.Characteristics.Body.CoreConditions.Diseased;
	if (disease > 0) {
		//? check if penalty is worse than the disease level and set it accordingly
		if (diseasePenalty > -(disease * 10)) {
			diseasePenalty = -(disease * 10);
		}
	}
	//* Check for Reductions
	//? Check for Reduction due to missing Perk Skill Levels
	let perkReduction = 0;
	if (itemName && action === "Possession") {
		const requiredPerk = actor.items.getName(itemName).system.RequiredPerk.value;
		metaLog(3, "MetaRoll", "Required Perk for", itemName, "is", requiredPerk);
		if (requiredPerk !== "None") {
			const requiredPerkLevel = actor.items.getName(itemName).system.RequiredPerkLevel.value;
			const actorPerkLevel = actor.system.Perks.Skills[requiredPerk].value;
			const levelDifference = requiredPerkLevel - actorPerkLevel;
			if (levelDifference > 0) {
				perkReduction = levelDifference * -10;
				metaLog(2, "MetaRoll", "Perk Penalty for", actor.name, "is", perkReduction);
			}
		}
	}
	//* ready to call MetaEvaluate, but first we check if we have custom options
	let bonus = 0;
	let penalty = 0;
	let multiAction = 0;
	if (isCustomRoll) {
		metaLog(3, "MetaRoll", "Custom Roll Detected");
		let { multiAction, bonus, customPenalty } = await MetaRollCustomDialog(
			actor,
			action,
			stat,
			statScore,
			itemName
		);
		metaLog(3, "MetaRoll", "Custom Roll Values:", multiAction, bonus, customPenalty);
		//? Check if Custom Penalty is smaller than Disease penalty (values are expected to be negatives)
		//todo add a new function to compare values for bonus and penalty - this way we can do the disease and perk check the same way without caring about the order in which we do them
		if (customPenalty < diseasePenalty) {
			penalty = customPenalty;
		} else {
			penalty = diseasePenalty;
		}
		metaLog(
			3,
			"MetaRoll",
			"Engaging MetaEvaluate for:",
			actor.name + "'s Custom",
			action,
			"with",
			stat,
			statScore,
			"Multi-Action:",
			multiAction,
			"Perk Reduction:",
			perkReduction,
			"Bonus:",
			bonus,
			"Penalty:",
			penalty,
			"Pain:",
			pain,
			"Destiny Cost:",
			destinyCost,
			"Item Name:",
			itemName
		);
		await MetaEvaluate(actor, action, stat, statScore, multiAction, perkReduction, bonus, penalty, pain, destinyCost, itemName);
	} else {
		penalty = diseasePenalty;
		metaLog(
			3,
			"MetaRoll",
			"Engaging MetaEvaluate for:",
			actor.name + "'s",
			action,
			"with",
			stat,
			statScore,
			"Multi-Action:",
			multiAction,
			"Perk Reduction:",
			perkReduction,
			"Bonus:",
			bonus,
			"Penalty:",
			penalty,
			"Pain:",
			pain,
			"Destiny Cost:",
			destinyCost,
			"Item Name:",
			itemName
		);
		await MetaEvaluate(actor, action, stat, statScore, multiAction, perkReduction, bonus, penalty, pain, destinyCost, itemName);
	}
	//* Post-roll actions
	//? Clear all metapower related result flags (currently only from duplicateself)
	//! the idea here being that if the flags are going to be added later, here we prevent them from remaining from previous successful activations
	actor.unsetFlag("metanthropes-system", "duplicateself");
	//? Get the result of the last roll
	let checkResult = await actor.getFlag("metanthropes-system", "lastrolled").MetaEvaluate;
	metaLog(
		3,
		"MetaRoll",
		"MetaEvaluate Result for",
		actor.name + "'s",
		"Action:",
		action,
		stat + ":",
		statScore,
		"Result:",
		checkResult
	);
	//* Check for Duplicate Self Metapower Activation
	if (
		checkResult > 0 &&
		action === "Metapower" &&
		(itemName === "Clone" ||
			itemName === "Couple" ||
			itemName === "Team" ||
			itemName === "Squad" ||
			itemName === "Unit")
	) {
		metaLog(0, "MetaRoll", "Duplicate Self Metapower Activation Detected");
		let currentLife = actor.system.Vital.Life.value;
		let duplicateMaxLife = 0;
		if (itemName === "Clone") {
			duplicateMaxLife = Math.ceil(currentLife * 0.1);
		} else if (itemName === "Couple") {
			duplicateMaxLife = Math.ceil(currentLife * 0.2);
		} else if (itemName === "Team") {
			duplicateMaxLife = Math.ceil(currentLife * 0.3);
		} else if (itemName === "Squad") {
			duplicateMaxLife = Math.ceil(currentLife * 0.4);
		} else if (itemName === "Unit") {
			duplicateMaxLife = Math.ceil(currentLife * 0.5);
		}
		actor.setFlag("metanthropes-system", "duplicateself", { maxlife: duplicateMaxLife });
		metaLog(3, "MetaRoll", "Duplicate Self Metapower Max Life:", duplicateMaxLife);
	}
	metaLog(3, "MetaRoll", "Finished");
}
/**
 * Handles the dialog box for custom multi-actions and bonuses/penalties when rolling.
 *
 * This function is intended to be called when the user 'right-clicks' the roll button,
 * allowing for more complex roll configurations. It provides a dialog for the user to
 * select multi-actions, bonuses, and penalties, and then returns those values to the MetaRoll function.
 *
 * @param {Object} actor - The actor making the roll. Expected to be an Actor object.
 * @param {string} action - The type of action being performed (e.g., "StatRoll", "Initiative"). Expected to be a string.
 * @param {string} stat - The stat being rolled against. Expected to be a string.
 * @param {number} statScore - The score of the Stat being rolled against. Expected to be a positive number.
 * @param {string} itemName - The name of the Metapower, Possession or Combo being used. Expected to be a string.
 *
 * @returns {Promise<Object>} A promise that resolves with an object containing multiAction, bonus, and customPenalty values.
 *
 * @example
 * This function is intended to be called within the MetaRoll function and not used directly.
 */
export async function MetaRollCustomDialog(actor, action, stat, statScore, itemName = null) {
	return new Promise((resolve) => {
		//? calculate the max number of multi-actions possible based on the stat value
		const maxMultiActions = Math.floor((statScore - 1) / 10);
		const multiActionOptions = Array.from({ length: maxMultiActions - 1 }, (_, i) => i + 2);
		//? Title and Buttons for the Dialog
		let dialogTitle = null;
		let dialogButtonLabel = null;
		if (action === "StatRoll") {
			dialogTitle = `${actor.name}'s ${stat}`;
			dialogButtonLabel = `Roll 📊 ${stat}`;
		} else if (action === "Metapower") {
			dialogTitle = `${actor.name}'s Metapower`;
			dialogButtonLabel = `Activate Ⓜ️ ${itemName}`;
		} else if (action === "Possession") {
			dialogTitle = `${actor.name}'s Possession`;
			dialogButtonLabel = `Use 🛠️ ${itemName}`;
		}
		//? Create the Dialog content
		let dialogContent = `
			<div class="metanthropes layout-metaroll-dialog">
				Select total number of Multi-Actions:	<select id="multiActionCount">
					<option value="no">None</option>
					${multiActionOptions.map((option) => `<option value="${option}">${option}</option>`).join("")}
				</select>
					<div>
					<br>
						<span class="style-cs-buffs ">Bonus: <input class="style-cs-buffs style-container-input-charstat"
						type="number" id="bonus" min="0" value="0">%		</span>
						<span class="style-cs-conditions">Penalty: <input class="style-cs-conditions style-container-input-charstat"
						type="number" id="penalty" min="0" value="0">%</span><br>
					</div>
			</div>
			<br>
			`;
		//? Create the Dialog
		let dialog = new Dialog({
			title: dialogTitle,
			content: dialogContent,
			buttons: {
				roll: {
					label: dialogButtonLabel,
					callback: async (html) => {
						//? collect multi-action value
						let multiAction = html.find("#multiActionCount").val();
						if (multiAction === "no") {
							multiAction = 0;
						} else {
							let selectedMultiActions = parseInt(html.find("#multiActionCount").val());
							multiAction = selectedMultiActions * -10;
						}
						//? collect bonus and penalty values
						let bonus = parseInt(html.find("#bonus").val());
						let customPenalty = -parseInt(html.find("#penalty").val());
						//? Return the data we collected to the MetaRoll function
						resolve({ multiAction, bonus, customPenalty });
					},
				},
			},
		});
		dialog.render(true);
	});
}
