import { MetaExecute } from "./metaexecute.mjs";
import { metaLog, metaSheetRefresh } from "../helpers/metahelpers.mjs";
/**
 * MetaEvaluate calculates the result of a roll, sets actor flags and prints it to chat
 *
 * This function calculates the results of a roll based on the provided parameters,
 * determines the levels of success or failure, checks for critical outcomes,
 * and then constructs and sends a message to the chat with the results.
 *
 * @param {Object} actor - The actor making the roll.
 * @param {String} action - The type of action being performed (e.g., "StatRoll", "Initiative", "Metapower", "Possession", "Combo"). Expected to be a string.
 * @param {String} stat - The stat being rolled against. Expected to be a string.
 * @param {Number} statScore - The current score of the stat being rolled against. Expected to be a positive number.
 * @param {Number} [multiAction=0] - The Reduction for multi-actions. Expected to be negative.
 * @param {Number} [perkReduction=0] - A Reduction caused by missing Perk Skill Levels. Expected to be negative.
 * @param {Number} [aimingReduction=0] - A Reduction caused by aiming at a specific body part. Expected to be negative.
 * @param {Number} [customReduction=0] - A Reduction caused by a custom effect. Expected to be negative.
 * @param {Number} [bonus=0] - Any bonuses applied to the roll. Expected to be positive.
 * @param {Number} [penalty=0] - Any penalties applied to the roll. Expected to be negative.
 * @param {Number} [pain=0] - Any Pain Condition applied to the roll. Expected to be positive.
 * @param {Number} [destinyCost=0] - The Destiny cost of the Metapower. Expected to be positive.
 * @param {String} [itemName=""] - The name of the Possession or Metapower. Expected to be a string.
 *
 * @returns {Promise<void>} A promise that resolves once the function completes its operations.
 *
 */
export async function MetaEvaluate(
	actor,
	action,
	stat,
	statScore,
	multiAction = 0,
	perkReduction = 0,
	aimingReduction = 0,
	customReduction = 0,
	bonus = 0,
	penalty = 0,
	pain = 0,
	destinyCost = 0,
	itemName = null
) {
	metaLog(
		3,
		"MetaEvaluate",
		"Engaged for:",
		actor.name + "'s",
		action,
		"with:",
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
	//? evaluate the result of the roll
	let result = null;
	let resultLevel = null;
	let autoExecute = false;
	const roll = await new Roll("1d100").evaluate({ async: true });
	const rollResult = roll.total;
	let levelsOfSuccess = Math.floor(
		(statScore + bonus + penalty + multiAction + perkReduction + aimingReduction + customReduction - rollResult) /
			10
	);
	let levelsOfFailure = Math.floor(
		(rollResult - statScore - bonus - multiAction - perkReduction - aimingReduction - customReduction - penalty) /
			10
	);
	const criticalSuccess = rollResult === 1;
	const criticalFailure = rollResult === 100;
	let currentDestiny = Number(actor.system.Vital.Destiny.value);
	//? Check for Destiny Cost in case of a Metapower
	if (action === "Metapower") {
		if (currentDestiny < Number(destinyCost)) {
			ui.notifications.warn(actor.name + " doesn't have " + destinyCost + " Destiny to activate " + itemName);
			return;
		} else {
			currentDestiny -= Number(destinyCost);
			await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
		}
	}
	//? this kicks-off the calculation, assuming that is is a failure
	if (rollResult - multiAction - perkReduction - aimingReduction - customReduction - penalty > statScore + bonus) {
		//? in which case we don't care about what levels of success we have, so we set to 0 to avoid confusion later
		result = "Failure 🟥";
		levelsOfSuccess = 0;
		//? resultlevel is a numerical value to facilitate other functions to use the result of the roll
		resultLevel = 0;
	} else {
		//? if it's a success, similarly as above, we don't care about levels of failure
		result = "Success 🟩";
		levelsOfFailure = 0;
		resultLevel = 0.5;
	}
	//? check for critical success or failure
	if (criticalSuccess) {
		result = `🟩 Critical Success 🟩, rewarding ${actor.name} with +1 * 🤞 Destiny`;
		currentDestiny++;
		await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
		levelsOfSuccess = 10;
		levelsOfFailure = 0;
		if (statScore > 100) {
			levelsOfSuccess += Math.floor((statScore - 100) / 10);
		}
	}
	if (criticalFailure) {
		result = `🟥 Critical Failure 🟥, rewarding ${actor.name} with +1 * 🤞 Destiny`;
		currentDestiny++;
		await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
		levelsOfFailure = 10;
		levelsOfSuccess = 0;
	}
	//? Create the message to be printed to chat - remember: Penalties and Reductions are Negative, Bonus and Pain are Positive
	const needToRoll = statScore + bonus + penalty + multiAction + perkReduction + aimingReduction + customReduction - (pain * 10);
	let needToRollMessage = ``;
	if (needToRoll <= 1) needToRollMessage = `(needed Critical Success)`;
	else if (needToRoll >= 100) needToRollMessage = `(needed no Critical Failure)`;
	else needToRollMessage = `(needed ${needToRoll} or less)`;
	let message = null;
	if (action === "StatRoll") {
		message = `Attempts a Stat Roll with ${stat} score of ${statScore}%`;
	} else if (action === "Initiative") {
		message = `Rolls for Initiative with ${stat} score of ${statScore}%`;
	} else if (action === "Metapower") {
		if (Number(destinyCost) > 0) {
			message = `Spends ${destinyCost} * 🤞 Destiny and rolls to activate the Ⓜ️ Metapower: ${itemName} with ${stat} score of ${statScore}%`;
		} else {
			message = `Rolls to activate the Ⓜ️ Metapower: ${itemName} with ${stat} score of ${statScore}%`;
		}
	} else if (action === "Possession") {
		message = `Rolls to use the 🛠️ Possession: ${itemName} with ${stat} score of ${statScore}%`;
	}
	//? if we have a bonus or penalty, add it to the message
	if (bonus > 0) {
		message += `, a Bonus of +${bonus}%`;
	}
	if (penalty < 0) {
		message += `, a Penalty of ${penalty}%`;
	}
	//? if we have Reductions, add them to the message
	if (customReduction < 0) {
		message += `, a Reduction of ${customReduction}%`;
	}
	if (multiAction < 0) {
		message += `, a Multi-Action Reduction of ${multiAction}%`;
	}
	if (perkReduction < 0) {
		message += `, a Reduction of ${perkReduction}% due to missing Perk Skill Levels`;
	}
	if (aimingReduction < 0) {
		message += `, a Reduction of ${aimingReduction}% due to Aiming at a specific body part`;
	}
	message += ` and the result is ${rollResult} ${needToRollMessage}.<br><br>`;
	//? if we have Pain condition, our succesfull (only) results are lowered by an equal amount - in case of Criticals we ignore Pain
	let painEffect = levelsOfSuccess - pain;
	if (resultLevel > 0 && !criticalSuccess && pain > 0) {
		metaLog(4, "MetaEvaluate", "Results are affected by Pain");
		if (painEffect < 0) {
			result = "Failure 🟥";
			resultLevel = 0;
			levelsOfFailure = 0;
			levelsOfSuccess = 0;
			message += `It was a Success, turned into a ${result}, because of Pain * ${pain}`;
			metaLog(3, "MetaEvaluate", "Pain Effect should be <0", painEffect, "levelsOfSuccess:", levelsOfSuccess);
		} else if (painEffect === 0) {
			message += `It is still a ${result}, besides being affected by Pain * ${pain}`;
			levelsOfSuccess = 0;
			metaLog(3, "MetaEvaluate", "Pain Effect should be =0", painEffect, "levelsOfSuccess:", levelsOfSuccess);
		} else if (painEffect > 0) {
			message += `It is a ${result}, reduced by Pain * ${pain}`;
			levelsOfSuccess = painEffect;
			metaLog(3, "MetaEvaluate", "Pain Effect should be >0", painEffect, "levelsOfSuccess:", levelsOfSuccess);
		}
	} else {
		//? Print the result of the roll
		message += `It is a ${result}`;
	}
	//? if we have levels of success or failure, add them to the message
	if (levelsOfSuccess > 0) {
		if (levelsOfSuccess === 1) {
			message += `, accumulating: ${levelsOfSuccess} * ✔️ Level of Success.<hr />${actor.name} has ${currentDestiny} * 🤞 Destiny remaining.<br>`;
			resultLevel = levelsOfSuccess;
		} else {
			message += `, accumulating: ${levelsOfSuccess} * ✔️ Levels of Success.<hr />${actor.name} has ${currentDestiny} * 🤞 Destiny remaining.<br>`;
			resultLevel = levelsOfSuccess;
		}
	} else if (levelsOfFailure > 0) {
		if (levelsOfFailure === 1) {
			message += `, accumulating: ${levelsOfFailure} * ❌ Level of Failure.<hr />${actor.name} has ${currentDestiny} * 🤞 Destiny remaining.<br>`;
			resultLevel = -levelsOfFailure;
		} else {
			message += `, accumulating: ${levelsOfFailure} * ❌ Levels of Failure.<hr />${actor.name} has ${currentDestiny} * 🤞 Destiny remaining.<br>`;
			resultLevel = -levelsOfFailure;
		}
	} else {
		message += `.<hr />${actor.name} has ${currentDestiny} * 🤞 Destiny remaining.<br>`;
	}
	//? Buttons to Re-Roll MetaEvaluate results - only adds the button to message, if it's not a Critical and only if they have enough Destiny for needed reroll.
	//* The buttons are hidden for everyone except the Player of the Actor and the GM
	//? Define threshold of showing the button, to re-roll we need a minimum of 1 Destiny + the Destiny Cost of the Metapower (only applies to Metapowers with DestinyCost, otherwise it's 0)
	const threshold = 1 + Number(destinyCost);
	if (!criticalSuccess && !criticalFailure && currentDestiny >= threshold) {
		if (action === "Initiative") {
			//? Button to re-roll Initiative
			message += `<div class="hide-button hidden"><br><button class="metanthropes-main-chat-button metainitiative-reroll" data-actoruuid="${actor.uuid}" data-action="${action}"
				>Spend 🤞 Destiny to reroll</button><br></div>`;
		} else {
			//? Button to re-roll MetaEvaluate
			message += `<div class="hide-button hidden"><br><button class="metanthropes-main-chat-button metaeval-reroll" data-actoruuid="${actor.uuid}"
				data-stat="${stat}" data-stat-score="${statScore}" data-multi-action="${multiAction}" data-perk-reduction="${perkReduction}"
				data-bonus="${bonus}" data-penalty="${penalty}" data-action="${action}" data-destiny-cost="${destinyCost}" 
				data-item-name="${itemName}" data-pain="${pain}" data-aiming-reduction="${aimingReduction}" data-custom-reduction="${customReduction}"
				>Spend 🤞 Destiny to reroll</button><br></div>`;
		}
		//? Buttons for Keeping the results of MetaEvalute
		if (action === "Metapower") {
			message += `<div class="hide-button hidden"><br><button class="metanthropes-main-chat-button metapower-activate" data-actoruuid="${actor.uuid}"
			data-item-name="${itemName}" data-action="${action}" data-multi-action="${multiAction}"
			>Activate Ⓜ️ ${itemName}</button><br></div>`;
		} else if (action === "Possession") {
			message += `<div class="hide-button hidden"><br><button class="metanthropes-main-chat-button possession-use" data-actoruuid="${actor.uuid}"
			data-item-name="${itemName}" data-action="${action}" data-multi-action="${multiAction}"
			>Use 🛠️ ${itemName}</button><br></div>`;
		} else {
			// Intentionally left blank for future expansion
			//message += `<div><br></div>`;
		}
	} else {
		//? Auto-Execute the Metapower or Possession
		if (!(action === "Initiative")) {
			//? Set autoExecute to true if it's either a Critical Success or a Critical Failure, or if the actor doesn't have enough Destiny to reroll
			autoExecute = true;
			metaLog(3, "MetaEvaluate", "Auto-Execution Detected");
		}
	}
	message += `<div><br></div>`;
	//* Update actor flags with the results of the roll
	//? Fetch the current state of the .lastrolled flag
	let previousRolls = (await actor.getFlag("metanthropes", "lastrolled")) || {};
	//? Store the values into the .previousrolled flag
	await actor.unsetFlag("metanthropes", "previousrolled");
	await actor.setFlag("metanthropes", "previousrolled", previousRolls);
	//? Prepare the new values for .lastrolled
	await actor.unsetFlag("metanthropes", "lastrolled");
	let newRolls = {
		LastAction: action,
		MetaEvaluate: resultLevel,
	};
	//? Update based on the specific action
	switch (action) {
		case "StatRoll":
			newRolls.StatRoll = resultLevel;
			newRolls.StatRolled = stat;
			break;
		case "Initiative":
			newRolls.Initiative = resultLevel;
			newRolls.InitiativeStat = stat;
			newRolls.InitiativeStatScore = statScore;
			break;
		case "Metapower":
			newRolls.Metapower = resultLevel;
			newRolls.StatRolled = stat;
			newRolls.MetapowerName = itemName;
			break;
		case "Possession":
			newRolls.Possession = resultLevel;
			newRolls.StatRolled = stat;
			newRolls.PossessionName = itemName;
			break;
		default:
			metaLog(2, "MetaEvaluate", "Error: Action not recognized:", action);
			return;
	}
	//? Update the actor with the new .lastrolled values
	await actor.setFlag("metanthropes", "lastrolled", newRolls);
	//? Printing the results to chat, allowing Dice So Nice to do it's thing.
	roll.toMessage({
		speaker: ChatMessage.getSpeaker({
			actor: actor,
		}),
		flavor: message,
		rollMode: game.settings.get("core", "rollMode"),
		flags: { "metanthropes": { actoruuid: actor.uuid } },
	});
	metaLog(
		3,
		"MetaEvaluate",
		"Finished for:",
		actor.name,
		"Action:",
		action,
		stat + ":",
		statScore,
		"Roll:",
		rollResult,
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
		itemName,
		"levelsOfSuccess:",
		levelsOfSuccess,
		"levelsOfFailure:",
		levelsOfFailure,
		"Result:",
		result,
		"Result Level:",
		resultLevel,
		"Current Destiny:",
		currentDestiny,
		"Actor UUID:",
		actor.uuid
	);
	//* If autoExecute is true, we execute the Metapower or Possession
	if (autoExecute) {
		//? wait for 5 seconds to ensure the chat messages display in the proper order and animations clear out
		//todo Ideally I'd like to integrate with Dice So Nice api to figure out when the animation has finished
		await new Promise((resolve) => setTimeout(resolve, 5000));
		//? Automatically execute the activation/use of the Metapower/Possession if it's a Critical Success/Failure or not enough destiny to reroll
		if (action === "Metapower") {
			metaLog(3, "MetaEvaluate", "Auto-Activating Metapower:", itemName);
			MetaExecute(null, actor.uuid, action, itemName);
		} else if (action === "Possession") {
			metaLog(3, "MetaEvaluate", "Auto-Using Possession:", itemName);
			MetaExecute(null, actor.uuid, action, itemName, multiAction);
		}
	}
}

/**
 * Handles the re-roll of a previously evaluated roll by spending Destiny.
 *
 * This function is called when the "Spend Destiny to reroll" button is clicked in the chat.
 * It reduces the actor's Destiny by 1 and then calls the MetaEvaluate function to
 * calculate the result of the re-roll.
 *
 * We assume that when this function is called, the actor already has enough destiny to spend on it, otherwise the button should not have been made visible to click on
 *
 * @param {Event} event - The event object from the button click.
 *
 * @returns {Promise<void>} A promise that resolves once the function completes its operations.
 *
 * @example
 * This function is typically called via an event listener and not directly.
 */
export async function MetaEvaluateReRoll(event) {
	event.preventDefault();
	//? Collect the data from the button
	const button = event.target;
	const actorUUID = button.dataset.actoruuid;
	const stat = button.dataset.stat;
	const statScore = parseInt(button.dataset.statScore);
	const multiAction = parseInt(button.dataset.multiAction);
	const perkReduction = parseInt(button.dataset.perkReduction);
	const aimingReduction = parseInt(button.dataset.aimingReduction);
	const customReduction = parseInt(button.dataset.customReduction);
	const bonus = parseInt(button.dataset.bonus);
	const penalty = parseInt(button.dataset.penalty);
	const destinyCost = parseInt(button.dataset.destinyCost);
	const actor = await fromUuid(actorUUID);
	const action = button.dataset.action;
	const itemName = button.dataset.itemName === "null" ? null : button.dataset.itemName;
	const pain = parseInt(button.dataset.pain);
	metaLog(3, "MetaEvaluateReRoll", "Engaged for:", actor.name + "'s", action, actorUUID);
	//? Reduce Destiny by 1
	let currentDestiny = actor.system.Vital.Destiny.value;
	currentDestiny--;
	await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
	await MetaEvaluate(
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
	//? Refresh the actor sheet if it's open
	metaSheetRefresh(actor);
	metaLog(3, "MetaEvaluateReRoll", "Finished for:", actor.name + "'s", action, actorUUID);
}
