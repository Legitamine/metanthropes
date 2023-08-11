//? Import the dependencies
import { MetaEvaluate } from "../helpers/metaeval.mjs";
/**
 * Handles rolling for Metanthropes RPG
 *
 * This function checks various Core Conditions (e.g., unconsciousness, hunger, disease)
 * before proceeding with the roll. It then calls the MetaEvaluate function to
 * calculate the result of the roll. This funtion assumes your actor doesn't have any effects applied,
 * if you have effects applied (bonus, penalties, multi-action) use MetaRollCustom instead.
 * todo merge both functions into one
 *
 * @param {Object} actor - The actor making the roll. Expected to be an Actor object.
 * @param {string} action - The type of action being performed (e.g., "StatRoll", "Initiative").
 * @param {string} stat - The stat being rolled against. Expected to be a string.
 * @param {number} destinyCost - The destiny cost of the action. Expected to be a positive number.
 * @param {string} itemname - The name of the Metapower, Possession or Combo being used. Expected to be a string.
 *
 * @returns {Promise<void>} A promise that resolves once the function completes its operations.
 *
 * @example
 * Rolling a simple stat
 * MetaRoll(actor, "StatRoll", "Power", 0);
 */

//! genikotero question einai ean thelw na pernaw ta re-rolls apo to MetaRoll prwta
//! px to hunger tha prepei na to pernaw kathe fora poy kanw re-roll? mporw na kanw destiny spend gia re-rolling tou hunger?
//! episis na analavei to MetaRoll ta chat messages? why/why not?
//! testing rq: protagonists, humans, metatherions klp klp linked kai mh, paizoune swsta? emfanizontai ola swsta k me to initiative??
//! thumisou na vgaleis ta ui.notifications.error apo to actor - kai isws na ta kaneis chat messages ???

export async function MetaRoll(actor, action, stat, destinyCost = 0, itemname = null) {
	const statScore = actor.system.RollStats[stat];
	console.log(
		"Metanthropes RPG System | MetaRoll | Engaged for",
		actor.type + ":",
		actor.name + "'s",
		action,
		"with",
		stat
	);
	//? Check if we are ok to do the roll stat-wise
	if (statScore <= 0) {
		ui.notifications.error(actor.name + " can't Roll " + stat + " with a Current value of 0!");
		return;
	}
	//? Checking various Core Conditions
	//? Pain is passed to MetaEvaluate
	const pain = actor.system.Characteristics.Mind.CoreConditions.Pain;
	//? Check for Fatigue
	//? Check for Hunger
	//* if we have hunger, we must beat the hunger roll before attempting to act
	const hunger = actor.system.Characteristics.Mind.CoreConditions.Hunger;
	//? Check if we are unconscious
	// const unconscious = actor.system.Characteristics.Soul.CoreConditions.Unconscious;
	
	//	if (unconscious > 0) {
	//		ui.notifications.error(actor.name + " is unconscious and can't act!");
	//		return;
	//	}
	//? Check for disease
	//* disease is expected to be a positive number, where as penalty is expected to be negative
	const disease = actor.system.Characteristics.Body.CoreConditions.Diseased;
	let diseasePenalty = 0;
	if (disease > 0) {
		//? check if penalty is worse than the disease level and set it accordingly
		if (diseasePenalty > -(disease * 10)) {
			diseasePenalty = -(disease * 10);
		}
	}
	//? ready to call MetaEvaluate for simple roll without any additional bonuses or penalties
	let multiAction = 0;
	let bonus = 0;
	let penalty = diseasePenalty;
	console.log(
		"Metanthropes RPG System | MetaRoll | Engaging MetaEvaluate for:",
		actor.name + "'s",
		action,
		"with",
		stat,
		statScore,
		"Multi-Action:",
		multiAction,
		"Bonus:",
		bonus,
		"Penalty:",
		penalty,
		"Pain:",
		pain,
		"Destiny Cost:",
		destinyCost,
		"Item Name:",
		itemname
	);
	await MetaEvaluate(actor, action, stat, statScore, multiAction, bonus, penalty, pain, destinyCost, itemname);
	let checkResult = await actor.getFlag("metanthropes-system", "lastrolled").MetaEvaluate;
	console.log(
		"Metanthropes RPG System | MetaRoll | MetaEvaluate Result for",
		actor.name,
		"Action:",
		action,
		stat + ":",
		statScore,
		"Result:",
		checkResult
	);
	console.log("Metanthropes RPG System | MetaRoll | Finished");
}
/**
 * Handles the dialog box for custom multi-actions and bonuses/penalties when rolling a stat.
 *
 * This function is intended to be called when the user 'right-clicks' the roll button,
 * allowing for more complex roll configurations. It provides a dialog for the user to
 * select multi-actions, bonuses, and penalties, and then calls the MetaEvaluate function
 * to calculate the result of the roll.
 *
 * @param {Object} actor - The actor making the roll.
 * @param {string} action - The type of action being performed (e.g., "StatRoll", "Initiative").
 * @param {string} stat - The stat being rolled against.
 *
 * @returns {Promise<void>} A promise that resolves once the function completes its operations.
 *
 * @example
 * Rolling a stat with custom options. A dialog box will show up to allow to enter custom values.
 * MetaRollCustom(actor, "StatRoll", "Power");
 */
export async function MetaRollCustom(actor, action, stat) {
	const statScore = actor.system.RollStats[stat];
	const disease = actor.system.Characteristics.Body.CoreConditions.Diseased;
	//! add the similar checks as above
	//! could I instead somehow extend the MetaRoll function to accept additional parameters?
	//? calculate the max number of multi-actions possible based on the stat value
	const maxMultiActions = Math.floor((statScore - 1) / 10);
	const multiActionOptions = Array.from({ length: maxMultiActions - 1 }, (_, i) => i + 2);
	//? Title and Buttons for the Dialog
	let dialogtitle = null;
	let dialogbuttonlabel = null;
	if (action === "StatRoll") {
		dialogtitle = `${actor.name}'s ${stat}`;
		dialogbuttonlabel = `Roll ${stat}`;
	} else if (action === "Initiative") {
		dialogtitle = `${actor.name}'s Initiative`;
		dialogbuttonlabel = `Roll Initiative`;
	}
	//? Create the Dialog content
	let dialogContent = `
	<div class="metanthropes layout-metaroll-dialog">
		<p>Select total number of Multi-Actions:</p>
		<select id="multiActionCount">
			<option value="no">None</option>
			${multiActionOptions.map((option) => `<option value="${option}">${option}</option>`).join("")}
		</select>
			<div>
			<br>
				<span class="style-cs-buffs ">Bonus: <input class="style-cs-buffs style-container-input-charstat"
				type="number" id="bonus" min="0" value="0">%		</span>
				<span class="style-cs-conditions">Penalty: <input class="style-cs-conditions style-container-input-charstat"
				type="number" id="penalty" min="0" value="0">%</span><br><br>
			</div>
	</div>
	`;
	//? Create the Dialog
	let dialog = new Dialog({
		title: dialogtitle,
		content: dialogContent,
		buttons: {
			roll: {
				label: dialogbuttonlabel,
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
					let penalty = -parseInt(html.find("#penalty").val());
					//? Check for disease
					//! is this the right place to do so?
					//* disease is expected to be a positive number, where as penalty is expected to be negative
					if (disease > 0) {
						//? check if penalty is worse than the disease level and set it accordingly
						if (penalty > -(disease * 10)) {
							penalty = -(disease * 10);
						}
					}
					//?send the data we collected to the MetaEvaluate function
					MetaEvaluate(actor, action, stat, statScore, multiAction, bonus, penalty);
				},
			},
		},
	});
	dialog.render(true);
}
