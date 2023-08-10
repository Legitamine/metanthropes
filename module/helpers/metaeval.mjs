/**
 * MetaEvaluate calculates the result of a roll, sets actor flags and prints it to chat
 *
 * This function calculates the results of a roll based on the provided parameters,
 * determines the levels of success or failure, checks for critical outcomes,
 * and then constructs and sends a message to the chat with the results.
 * todo: in case of metapower activation, when do we calculate the destiny cost?
 *
 * @param {Object} actor - The actor making the roll.
 * @param {string} action - The type of action being performed (e.g., "StatRoll", "Initiative", "Metapower", "Possession", "Combo").
 * @param {string} stat - The stat being rolled against.
 * @param {number} statValue - The current value of the stat being rolled against.
 * @param {number} [multiAction=0] - The reduction for multi-actions. Expected to be negative.
 * @param {number} [bonus=0] - Any bonuses applied to the roll. Expected to be positive.
 * @param {number} [penalty=0] - Any penalties applied to the roll. Expected to be negative.
 * @param {number} [destinyCost=0] - The Destiny cost of the Metapower. Expected to be positive.
 * @param {string} [itemname=""] - The name of the Possession or Metapower. Expected to be a string.
 *
 * @returns {Promise<void>} A promise that resolves once the function completes its operations.
 *
 * @example
 * Evaluating a simple stat roll for Power with a stat value of 50
 * MetaEvaluate(actor, "StatRoll", "Power", 50, 0);
 *
 * Evaluating the same roll but with a multiaction reduction of -30, a bonus of +10, and a penalty of -50
 * MetaEvaluate(actor, "StatRoll", "Power", 50, -30, 10, -50, 0);
 */
export async function MetaEvaluate(
	actor,
	action,
	stat,
	statValue,
	multiAction = 0,
	bonus = 0,
	penalty = 0,
	destinyCost = 0,
	itemname = null
) {
	console.log(
		"Metanthropes RPG System | MetaEvaluate | Engaged for:",
		actor.name,
		action,
		stat,
		statValue,
		"Multi-Action:",
		multiAction,
		"Bonus:",
		bonus,
		"Penalty:",
		penalty,
		"Destiny Cost:",
		destinyCost,
		"Item Name:",
		itemname
	);
	//? evaluate the result of the roll
	let result = null;
	let resultLevel = null;
	const roll = await new Roll("1d100").evaluate({ async: true });
	const rollResult = roll.total;
	let levelsOfSuccess = Math.floor((statValue + bonus + penalty + multiAction - rollResult) / 10);
	let levelsOfFailure = Math.floor((rollResult - statValue - bonus - multiAction - penalty) / 10);
	const criticalSuccess = rollResult === 1;
	const criticalFailure = rollResult === 100;
	let currentDestiny = Number(actor.system.Vital.Destiny.value);
	//? Check for Destiny Cost in case of a Metapower
	if (action === "Metapower") {
		if (currentDestiny < destinyCost) {
			ui.notifications.error(actor.name + " doesn't have enough Destiny to try and activate this Metapower!");
			return;
		} else {
			currentDestiny -= destinyCost;
			await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
		}
	}
	//? this kicks-off the calculation, assuming that is is a failure
	if (rollResult - multiAction - penalty > statValue + bonus) {
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
		currentDestiny += 1;
		await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
		levelsOfSuccess = 10;
		levelsOfFailure = 0;
		if (statValue < 100) {
			levelsOfSuccess += 0;
		} else {
			levelsOfSuccess += Math.floor((statValue - 100) / 10);
		}
	}
	if (criticalFailure) {
		result = `🟥 Critical Failure 🟥, rewarding ${actor.name} with +1 * 🤞 Destiny`;
		currentDestiny += 1;
		await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
		levelsOfFailure = 10;
		levelsOfSuccess = 0;
	}
	//? Create the message to be printed to chat
	let message = null;
	if (action === "StatRoll") {
		message = `Attempts a Stat Roll with ${stat} value of ${statValue}%`;
	} else if (action === "Initiative") {
		message = `Rolls for Initiative with ${stat} value of ${statValue}%`;
	} else if (action === "Metapower") {
		if (destinyCost > 0) {
			message = `Spends ${destinyCost} * 🤞 Destiny and rolls to activate the Metapower: ${itemname} with ${stat} value of ${statValue}%`;
		} else {
			message = `Rolls to activate the Metapower: ${itemname} with ${stat} value of ${statValue}%`;
		}
	} else if (action === "Possession") {
		message = `Rolls to use the Possession: ${itemname} with ${stat} value of ${statValue}%`;
	}
	//? if we have a bonus or penalty, add it to the message
	if (bonus > 0) {
		message += `, a Bonus of +${bonus}%`;
	}
	if (penalty < 0) {
		message += `, a Penalty of ${penalty}%`;
	}
	//? if we have multi-action reduction, add it to the message
	if (multiAction < 0) {
		message += `, a Multi-Action reduction of ${multiAction}%`;
	}
	message += ` and the result is ${rollResult}.<br><br>It is a ${result}`;
	//? if we have levels of success or failure, add them to the message
	if (levelsOfSuccess > 0) {
		if (levelsOfSuccess === 1) {
			message += `, accumulating: ${levelsOfSuccess} * ✔️ Level of Success.<br><br>${actor.name} has ${currentDestiny} * 🤞 Destiny remaining.<br>`;
			resultLevel = levelsOfSuccess;
		} else {
		message += `, accumulating: ${levelsOfSuccess} * ✔️ Levels of Success.<br><br>${actor.name} has ${currentDestiny} * 🤞 Destiny remaining.<br>`;
		resultLevel = levelsOfSuccess;
		}
	} else if (levelsOfFailure > 0) {
		if (levelsOfFailure === 1) {
			message += `, accumulating: ${levelsOfFailure} * ❌ Level of Failure.<br><br>${actor.name} has ${currentDestiny} * 🤞 Destiny remaining.<br>`;
			resultLevel = -levelsOfFailure;
		} else {
		message += `, accumulating: ${levelsOfFailure} * ❌ Levels of Failure.<br><br>${actor.name} has ${currentDestiny} * 🤞 Destiny remaining.<br>`;
		resultLevel = -levelsOfFailure;
		}
	} else {
		message += `.<br><br>${actor.name} has ${currentDestiny} * 🤞 Destiny remaining.<br>`;
	}
	//? Buttons to Re-Roll MetaEvaluate results - only adds button to message, if it's not a Critical and only if they have at least 1 destiny or more to spend
	//* The buttons are hidden for everone except the owner of the actor and the GM as long as DF Chat Enhancements is installed
	//! In case of Metapowers with DestinyCost it should also check to see they have enough Destiny to spend to re-activate the power??
	//? Define threshold of showing the button, to re-roll we need a minimum of 1 Destiny + the Destiny Cost of the Metapower (only applies to Metapowers with DestinyCost, otherwise it's 0)
	let threshold = Number(1 + Number(destinyCost));
	//console.log("Metanthropes RPG System | MetaEvaluate | Threshold for re-roll:", threshold);
	//console.log("Metanthropes RPG System | MetaEvaluate | Current Destiny:", currentDestiny);
	//console.log("Metanthropes RPG System | MetaEvaluate | Critical Success:", criticalSuccess);
	//console.log("Metanthropes RPG System | MetaEvaluate | Critical Failure:", criticalFailure);
	if (!criticalSuccess && !criticalFailure && currentDestiny >= threshold) {
		//console.log("Metanthropes RPG System | MetaEvaluate | button showing up");
		//? Need to have different buttons for the various actions, so the correct function is being re-called by the correct button and the correct parameters are being passed
		if (action === "Initiative") {
			message += `<div class="hide-button hidden"><br><button class="metainitiative-reroll" data-actoruuid="${actor.uuid}"
				>Spend 🤞 Destiny to reroll</button><br></div>`;
		} else {
			message += `<div class="hide-button hidden"><br><button class="metaeval-reroll" data-actoruuid="${actor.uuid}"
				data-stat="${stat}" data-statvalue="${statValue}" data-multiaction="${multiAction}"
				data-bonus="${bonus}" data-penalty="${penalty}" data-action="${action}" data-destinyCost="${destinyCost}" 
				data-itemname="${itemname}"
				>Spend 🤞 Destiny to reroll</button><br></div>`;
		}
	} else {
		//console.log("Metanthropes RPG System | MetaEvaluate | No button shows up");
		//message += `<div><br></div>`;
	}
	//? Buttons for Keeping the results of MetaEvalute
	//! I should include a way to auto-proceed if the results are criticals
	if (action === "Metapower") {
		//! I can either have MetaEvaluate take all the necessairy inputs passed down from MetaRoll about the Item,
		//! or can I start from here to collect his information to pass it along? if so, to which function?
		message += `<div class="hide-button hidden"><br><button class="metapower-activate" data-actoruuid="${actor.uuid}"
			data-stat="${stat}" data-statvalue="${statValue}" data-multiaction="${multiAction}"
			data-bonus="${bonus}" data-penalty="${penalty}" data-action="${action}" data-destinycost="${destinyCost}" 
			data-itemname="${itemname}"
			>Activate Ⓜ️ ${itemname}</button><br></div>`;
	} else if (action === "Possession") {
		message += `<div class="hide-button hidden"><br><button class="possession-activate" data-actoruuid="${actor.uuid}"
			data-stat="${stat}" data-statvalue="${statValue}" data-multiaction="${multiAction}"
			data-bonus="${bonus}" data-penalty="${penalty}" data-action="${action}"
			data-itemname="${itemname}"
			>Use 🛠️ ${itemname}</button><br></div>`;
	} else {
		//message += `<div><br></div>`;
	}
	message += `<div><br></div>`;
	//? Update actor flags with the results of the roll
	//? Fetch the current state of the .lastrolled flag
	let previousRolls = actor.getFlag("metanthropes-system", "lastrolled") || {};
	//? Store the values
	await actor.setFlag("metanthropes-system", "previousrolled", previousRolls);
	//? Prepare the new values for .lastrolled
	await actor.unsetFlag("metanthropes-system", "lastrolled");
	let newRolls = {
		LastAction: action,
		MetaEvaluate: resultLevel,
	};
	//? Update based on the specific action
	switch (action) {
		case "StatRoll":
			newRolls.StatRoll = resultLevel;
			break;
		case "Initiative":
			newRolls.Initiative = resultLevel;
			newRolls.InitiativeStat = stat;
			newRolls.InitiativeStatValue = statValue;
			break;
		case "Metapower":
			newRolls.Metapower = resultLevel;
			break;
		case "Possession":
			newRolls.Possession = resultLevel;
			break;
	}
	//? Update the actor with the new .lastrolled values
	await actor.setFlag("metanthropes-system", "lastrolled", newRolls);
	//? Printing the results to chat, allowing Dice So Nice to do it's thing.
	roll.toMessage({
		speaker: ChatMessage.getSpeaker({
			actor: actor,
		}),
		flavor: message,
		rollMode: game.settings.get("core", "rollMode"),
		flags: { "metanthropes-system": { actoruuid: actor.uuid } },
	});
	console.log(
		"Metanthropes RPG System | MetaEvaluate | Finished for:",
		actor.name,
		"Action:",
		action,
		stat + ":",
		statValue,
		"Roll:",
		rollResult,
		"Multi-Action:",
		multiAction,
		"Bonus:",
		bonus,
		"Penalty:",
		penalty,
		"Destiny Cost:",
		destinyCost,
		"Item Name:",
		itemname,
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
	const button = event.target;
	const actorUUID = button.dataset.actoruuid;
	const stat = button.dataset.stat;
	const statValue = parseInt(button.dataset.statvalue);
	const multiAction = parseInt(button.dataset.multiaction);
	const bonus = parseInt(button.dataset.bonus);
	const penalty = parseInt(button.dataset.penalty);
	const destinyCost = parseInt(button.dataset.destinycost);
	const actor = await fromUuid(actorUUID);
	const action = button.dataset.action;
	const itemname = button.dataset.itemname;
	console.log("Metanthropes RPG System | MetaEvaluateReRoll | Engaged for:", actor.name + "'s", action, actorUUID);
	//? Reduce Destiny.value by 1
	let currentDestiny = actor.system.Vital.Destiny.value;
	currentDestiny -= 1;
	await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
	//	//? Update re-roll button visibility
	//	const message = game.messages.get(button.dataset.messageId);
	//	if (message) {
	//		message.render();
	//	}
	await MetaEvaluate(actor, action, stat, statValue, multiAction, bonus, penalty, destinyCost, itemname);
	console.log("Metanthropes RPG System | MetaEvaluateReRoll | Finished for:", actor.name + "'s", action, actorUUID);
}
