import { metaEvaluate } from "./metaeval.mjs";
import { metaLog } from "../helpers/metahelpers.mjs";
import { metaHungerRoll } from "./metarollextras.mjs";
/**
 * Handles rolling for Metanthropes
 *
 * This function checks various Core Conditions (e.g., unconsciousness, hunger, disease)
 * before proceeding with the roll. It then calls the metaEvaluate function to
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
 * metaRoll(actor, "StatRoll", "Power");
 */
export async function metaRoll(actor, action, stat, isCustomRoll = false, destinyCost = 0, itemName = null) {
	//? Initialize the actor's RollStat array before proceeding
	await actor.getRollData();
	const statScore = actor.system.RollStats[stat];
	metaLog(3, "metaRoll", "Engaged for", actor.type + ":", actor.name + "'s", action, "with", stat);
	//* Go through a series of tests and checks before actually rolling the dice
	//? Check if we are ok to do the roll stat-wise
	if (statScore <= 0) {
		ui.notifications.error(actor.name + " can't Roll " + stat + " with a Score of 0!");
		return;
	}
	//? Check for always active item activation
	if (itemName) {
		const actionSlot = actor.items.getName(itemName).system.Execution.ActionSlot.value;
		if (actionSlot === "Always Active") {
			ui.notifications.info(actor.name + "'s " + itemName + " is Always Active, no need to Roll!");
			return;
		}
	}
	//? Check for Hunger: We must beat the Hunger check before doing our action (Initiative is exempt)
	const hungerLevel = actor.system.Characteristics.Mind.CoreConditions.Hunger;
	hungerCheck: if (hungerLevel > 0 && action !== "Initiative") {
		//? Check if actor has already overcome hunger
		const hungerRollResult = (await actor.getFlag("metanthropes", "hungerRollResult")) || false;
		if (hungerRollResult) {
			//? If the flag exists, we clear it and resume running the rest of the checks
			await actor.unsetFlag("metanthropes", "hungerRollResult");
			metaLog(3, "metaRoll", "Hunger Check Passed, moving on");
			//todo: perhaps I should minimize the sheet while the hunger check is happening?
			break hungerCheck;
		} else {
			//? Engage the Hunger Roll
			await actor.setFlag("metanthropes", "MetaRollBeforeHungerCheck", {
				action: action,
				stat: stat,
				isCustomRoll: isCustomRoll,
				destinyCost: destinyCost,
				itemName: itemName,
			});
			metaLog(3, "metaRoll", "Hunger Check Failed, Engaging Hunger Roll");
			await metaHungerRoll(actor, hungerLevel);
			return;
		}
	}
	//? Check for Fatigue
	// currently only mentioned in Combat Chat, no further automation
	//? Check if we are unconscious
	// currently only mentioned in Combat Chat, no further automation
	//* Check for Bonuses
	// space intentionally left blank
	//* Check for Penalties
	//? Pain is passed to metaEvaluate
	const pain = actor.system.Characteristics.Mind.CoreConditions.Pain;
	//? Check for Disease
	let diseasePenalty = 0;
	const diseaseLevel = actor.system.Characteristics.Body.CoreConditions.Diseased;
	if (diseaseLevel > 0) {
		//? Set diseasePenalty according to the Disease level
		if (diseasePenalty > -(diseaseLevel * 10)) {
			diseasePenalty = -(diseaseLevel * 10);
		}
	}
	//* Check for Reductions
	//? Check for Reduction due to missing Perk Skill Levels
	let perkReduction = 0;
	if (itemName && action === "Possession") {
		const requiredPerk = actor.items.getName(itemName).system.RequiredPerk.value;
		metaLog(3, "metaRoll", "Required Perk for", itemName, "is", requiredPerk);
		if (requiredPerk !== "None") {
			const requiredPerkLevel = actor.items.getName(itemName).system.RequiredPerkLevel.value;
			const actorPerkLevel = actor.system.Perks.Skills[requiredPerk].value;
			const levelDifference = requiredPerkLevel - actorPerkLevel;
			if (levelDifference > 0) {
				perkReduction = levelDifference * -10;
				metaLog(2, "metaRoll", "Perk Penalty for", actor.name, "is", perkReduction);
			}
		}
	}
	//? Check for Reduction due to Aiming
	//* ready to call metaEvaluate, but first we check if we have custom options
	let bonus = 0;
	let penalty = 0;
	let multiAction = 0;
	let customReduction = 0;
	let aimingReduction = 0;
	if (isCustomRoll) {
		metaLog(3, "metaRoll", "Custom Roll Detected");
		let { multiAction, bonus, customPenalty, customReduction, aimingReduction } = await metaRollCustomDialog(
			actor,
			action,
			stat,
			statScore,
			itemName
		);
		metaLog(
			3,
			"metaRoll",
			"Custom Roll Values:",
			multiAction,
			bonus,
			customPenalty,
			customReduction,
			aimingReduction
		);
		//? Check if Custom Penalty is smaller than Disease penalty (values are expected to be negatives)
		//todo add a new function to compare values for bonus and penalty - this way we can do the disease and perk check the same way without caring about the order in which we do them
		if (customPenalty < diseasePenalty) {
			penalty = customPenalty;
		} else {
			penalty = diseasePenalty;
		}
		metaLog(
			3,
			"metaRoll",
			"Engaging metaEvaluate for:",
			actor.name + "'s Custom",
			action,
			"with",
			stat,
			statScore,
			"Multi-Action:",
			multiAction,
			"Perk Reduction:",
			perkReduction,
			"Aiming Reduction:",
			aimingReduction,
			"Custom Reduction:",
			customReduction,
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
		await metaEvaluate(
			actor,
			action,
			stat,
			statScore,
			multiAction,
			perkReduction,
			aimingReduction,
			customReduction,
			bonus,
			penalty,
			pain,
			destinyCost,
			itemName
		);
	} else {
		penalty = diseasePenalty;
		metaLog(
			3,
			"metaRoll",
			"Engaging metaEvaluate for:",
			actor.name + "'s",
			action,
			"with",
			stat,
			statScore,
			"Multi-Action:",
			multiAction,
			"Perk Reduction:",
			perkReduction,
			"Aiming Reduction:",
			aimingReduction,
			"Custom Reduction:",
			customReduction,
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
		await metaEvaluate(
			actor,
			action,
			stat,
			statScore,
			multiAction,
			perkReduction,
			aimingReduction,
			customReduction,
			bonus,
			penalty,
			pain,
			destinyCost,
			itemName
		);
	}
	//* Post-Evaluate-roll actions
	// intentionally left blank
	//? metaRoll Finished
	metaLog(3, "metaRoll", "Finished");
}
/**
 * Handles the dialog box for custom multi-actions and bonuses/penalties when rolling.
 *
 * This function is intended to be called when the user 'right-clicks' the roll button,
 * allowing for more complex roll configurations. It provides a dialog for the user to
 * select multi-actions, bonuses, and penalties, and then returns those values to the metaRoll function.
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
 * This function is intended to be called within the metaRoll function and not used directly.
 */
export async function metaRollCustomDialog(actor, action, stat, statScore, itemName = null) {
	return new Promise((resolve) => {
		//? calculate the max number of multi-actions possible based on the stat value
		const maxMultiActions = Math.floor((statScore - 1) / 10);
		const multiActionOptions = Array.from({ length: maxMultiActions - 1 }, (_, i) => i + 2);
		//? Title and Buttons for the Dialog
		let dialogTitle = null;
		let dialogButtonLabel = null;
		const isBetaTesting = game.settings.get("metanthropes", "metaBetaTesting");
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
		let dialogContent = `<div class="metanthropes layout-metaroll-dialog style-metaroll-dialog">`;
		//? Check if Multi-Actions are possible and add the option to the dialog
		if (itemName) {
			const actionSlot = actor.items.getName(itemName).system.Execution.ActionSlot.value;
			if (actionSlot === "Main Action") {
				dialogContent += `<p class="style-centered-paragraph">Total number of Multi-Actions:	<select id="multiActionCount">
						<option value="no">None</option>
						${multiActionOptions.map((option) => `<option value="${option}">${option}</option>`).join("")}
					</select></p><br>
				`;
			}
		} else if (action === "StatRoll") {
			dialogContent += `<p class="style-centered-paragraph">Total number of Multi-Actions:	<select id="multiActionCount">
						<option value="no">None</option>
						${multiActionOptions.map((option) => `<option value="${option}">${option}</option>`).join("")}
					</select></p><br>
				`;
		}
		//? Check if we are in Beta Testing and add the Aiming Reduction option
		// if (action !== "StatRoll" && isBetaTesting) {
		// 	dialogContent += `
		// 		<div>
		// 			<br>
		// 			<span>Aiming Reduction: <input class="style-container-input-charstat"
		// 				type="number" id="aimingReduction" min="0" value="0">%</span><br>
		// 		</div>
		// 		`;
		// }
		//? Add the Bonus, Penalty, and Custom Reduction options to the dialog
		dialogContent += `
					<div>
						<p class="style-centered-paragraph"><span class="style-cs-buffs">Bonus: <input class="style-cs-buffs style-container-input-charstat"
						type="number" id="bonus" min="0" value="0">%</span>
						<span class="style-cs-conditions">Penalty: <input class="style-cs-conditions style-container-input-charstat"
						type="number" id="penalty" min="0" value="0">%</span><br></p>
						</div><br>
						<p class="style-centered-paragraph style-cs-conditions">Reduction: <input class="style-cs-conditions style-container-input-charstat"
						type="number" id="customReduction" min="0" value="0">%</p>
			</div>
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
						if (multiAction === "no" || multiAction == undefined || multiAction == null) {
							multiAction = 0;
						} else {
							let selectedMultiActions = parseInt(html.find("#multiActionCount").val());
							multiAction = selectedMultiActions * -10;
						}
						//? Collect Bonus and Penalty values
						let bonus = parseInt(html.find("#bonus").val());
						let customPenalty = -parseInt(html.find("#penalty").val());
						//? Collect Reductions
						let customReduction = -parseInt(html.find("#customReduction").val());
						let aimingReduction = -parseInt(html.find("#aimingReduction").val()) || 0;
						//? Return the data we collected to the metaRoll function
						resolve({ multiAction, bonus, customPenalty, customReduction, aimingReduction });
					},
				},
			},
		});
		dialog.render(true);
	});
}
