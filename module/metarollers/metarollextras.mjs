import { metaLog, metaSheetRefresh, metaIsItemEquipped } from "../helpers/metahelpers.mjs";
import { metaRoll } from "./metaroll.mjs";
/**
 * metaRolld10 handles the rolling of d10 dice for a given actor and purpose.
 *
 * This function determines the number of d10 dice to roll based on the provided parameters.
 * It checks for the presence of certain Metapowers that might affect the roll and then performs the roll.
 * If destinyReRoll is set to true, it allows for a re-roll of that roll result, by spending a Destiny Point.
 *
 * @param {Object} actor - The actor performing the roll. Expected to be an Actor object.
 * @param {string} what - The reason or purpose for the roll. Expected to be a string. (eg: "Damage")
 * @param {boolean} destinyReRoll - Determines if a re-roll using Destiny is allowed. Expected to be a boolean.
 * @param {number} dice - The number of d10 dice to roll. Expected to be a positive number.
 * @param {string} [itemName=""] - The name of the item associated with the roll, if any. Expected to be a string.
 * @param {number} [baseNumber=0] - A fixed number to add to the roll result, if any. Expected to be a positive number.
 * @param {boolean} [isHalf=false] - Determines if the roll result should be halved. Expected to be a boolean.
 *
 * @returns {Promise<void>} A promise that resolves once the function completes its operations.
 *
 * @example
 * Rolling an actor's Weapon Damage for 3 * d10:
 * metaRolld10(actor, "Damage", true, 3, "Weapon Name");
 */
export async function metaRolld10(actor, what, destinyReRoll, dice, itemName = null, baseNumber = 0, isHalf = false) {
	metaLog(
		3,
		"metaRolld10",
		"Engaged for:",
		actor.name + "'s",
		what,
		"Destiny ReRoll allowed?:",
		destinyReRoll,
		"how many d10s:",
		dice,
		"Item:",
		itemName,
		"Base:",
		baseNumber,
		"d10/2?:",
		isHalf
	);
	let rollTotal;
	const explosiveDice = "x10";
	//? Checking if actor has Metapowers that affect the explosive dice
	//	if (await metaIsItemEquipped(actor, "Cognitive Efficiency")) {
	//		explosiveDice = "x1x10";
	//		metaLog(3, "metaRolld10", "Using Alternative explosive dice:", explosiveDice);
	//	}
	//? dice is the number of d10 to roll
	let rolld10;
	if (baseNumber > 0) {
		rolld10 = await new Roll(`${dice}d10${explosiveDice}+${baseNumber}`).evaluate({ async: true });
	} else {
		rolld10 = await new Roll(`${dice}d10${explosiveDice}`).evaluate({ async: true });
	}
	if (isHalf) {
		rollTotal = Math.ceil(rolld10.total / 2);
	} else {
		rollTotal = rolld10.total;
	}
	//? Message to be printed to chat
	let message = null;
	if (itemName) {
		if (baseNumber > 0) {
			if (isHalf) {
				message = `${actor.name} rolls for ${itemName}'s ${what} with (${dice}d10)/2 + ${baseNumber} and gets a total of ${rollTotal}.<br>`;
			} else {
				message = `${actor.name} rolls for ${itemName}'s ${what} with ${dice}d10 + ${baseNumber} and gets a total of ${rollTotal}.<br>`;
			}
		} else {
			if (isHalf) {
				message = `${actor.name} rolls for ${itemName}'s ${what} with (${dice}d10)/2 and gets a total of ${rollTotal}.<br>`;
			} else {
				message = `${actor.name} rolls for ${itemName}'s ${what} with ${dice}d10 and gets a total of ${rollTotal}.<br>`;
			}
		}
	} else {
		if (baseNumber > 0) {
			if (isHalf) {
				message = `${actor.name} rolls for ${what} with (${dice}d10)/2 + ${baseNumber} and gets a total of ${rollTotal}.<br>`;
			} else {
				message = `${actor.name} rolls for ${what} with ${dice}d10 + ${baseNumber} and gets a total of ${rollTotal}.<br>`;
			}
		} else {
			if (isHalf) {
				message = `${actor.name} rolls for ${what} with (${dice}d10)/2 and gets a total of ${rollTotal}.<br>`;
			} else {
				message = `${actor.name} rolls for ${what} with ${dice}d10 and gets a total of ${rollTotal}.<br>`;
			}
		}
	}
	//? if destinyReRoll is true, allow rerolling the result by spending 1 Destiny Point
	let currentDestiny = Number(actor.system.Vital.Destiny.value);
	if (destinyReRoll && currentDestiny > 0) {
		message += `<br>${actor.name} has ${currentDestiny} 🤞 Destiny remaining.<br>
		<div class="hide-button hidden"><br><button class="metanthropes-secondary-chat-button rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}"
		data-what="${what}" data-destiny-re-roll="${destinyReRoll}" data-dice="${dice}" data-base-number="${baseNumber}" data-is-half="${isHalf}">Spend 🤞 Destiny to reroll
		</button><br><br></div>`;
	}
	await actor.setFlag("metanthropes", "lastrolled", {
		rolld10: rollTotal,
		rolld10what: what,
		rolld10item: itemName,
	});
	//? Print message to chat
	rolld10.toMessage({
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		flavor: message,
		rollMode: game.settings.get("core", "rollMode"),
		flags: { "metanthropes": { actoruuid: actor.uuid } },
	});
	metaLog(3, "metaRolld10", "Finished for:", actor.name + "'s", what);
	//? Refresh the actor sheet if it's open
	metaSheetRefresh(actor);
}

/**
 * metaRolld10ReRoll is triggered when the destiny re-roll button is clicked.
 *
 * This function handles the re-rolling of d10 dice for a given actor based on the provided event data.
 * It reduces the actor's Destiny value by 1 and then calls the metaRolld10 function to perform the re-roll.
 *
 * @param {Event} event - The event object associated with the button click.
 *
 * @returns {Promise<void>} A promise that resolves once the function completes its operations.
 *
 * @example
 * This function is not called directly, but rather via an event listener.
 */
export async function metaRolld10ReRoll(event) {
	event.preventDefault();
	const button = event.target;
	const actoruuid = button.dataset.actoruuid;
	const what = button.dataset.what;
	const destinyReRoll = button.dataset.destinyReRoll === "true" ? true : false;
	const itemName = button.dataset.itemName === "null" ? null : button.dataset.itemName;
	const dice = parseInt(button.dataset.dice) ?? 0;
	const baseNumber = parseInt(button.dataset.baseNumber) ?? 0;
	const isHalf = button.dataset.isHalf === "true" ? true : false;
	const actor = await fromUuid(actoruuid);
	//? Need to check if actor has enough Destiny to spend, because they might have already spent it on another secondary button
	let currentDestiny = Number(actor.system.Vital.Destiny.value);
	if (currentDestiny > 0 && destinyReRoll) {
		currentDestiny--;
		await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
		metaLog(
			3,
			"metaRolld10ReRoll",
			"Engaged for:",
			actor.name + "'s",
			what,
			"Destiny ReRoll allowed?:",
			destinyReRoll,
			"how many d10s:",
			dice,
			"Item:",
			itemName,
			"Base:",
			baseNumber,
			"d10/2?:",
			isHalf
		);
		await metaRolld10(actor, what, destinyReRoll, dice, itemName, baseNumber, isHalf);
	} else {
		ui.notifications.warn(actor.name + " does not have enough Destiny to spend for reroll!");
		metaLog(1, "metaRolld10ReRoll", "Not enough Destiny to spend", "OR", "destinyReRoll is not allowed");
	}
}

/**
 * metaHungerRoll handles the rolling a simple d100 to check if the actor can beat their Hunger effect.
 */
export async function metaHungerRoll(actor, hungerLevel) {
	let hungerTarget = 0;
	let hungerEffect = 0; //! not needed???
	let hungerMessage = null;
	if (hungerLevel === 1) {
		hungerEffect = 10;
		hungerTarget = 90;
	} else if (hungerLevel === 2) {
		hungerEffect = 25;
		hungerTarget = 75;
	} else if (hungerLevel === 3) {
		hungerEffect = 50;
		hungerTarget = 50;
	} else if (hungerLevel === 4) {
		hungerEffect = 75;
		hungerTarget = 25;
	} else if (hungerLevel === 5) {
		hungerEffect = 90;
		hungerTarget = 10;
	} else {
		metaLog(5, "metaHungerRoll", "Hunger Level is not valid:", hungerLevel);
		return;
	}
	const hungerRoll = await new Roll("1d100").evaluate({ async: true });
	const hungerRollResult = hungerRoll.total;
	hungerMessage = `Rolls to beat Hunger 💀 Condition Level ${hungerLevel} and gets a result of ${hungerRollResult} (needed ${hungerTarget} or less).<br><br>`;
	if (hungerRollResult > hungerTarget) {
		hungerMessage += `It is a 🟥 Failure!<br><br>${actor.name} is too hungry and can't act!`;
		//? Button to re-roll Hunger using destiny
		const currentDestiny = Number(actor.system.Vital.Destiny.value);
		hungerMessage += `<hr />${actor.name} has ${currentDestiny} 🤞 Destiny remaining.<br>`;
		if (currentDestiny > 0) {
			hungerMessage += `<div class="hide-button hidden"><br><button class="metanthropes-main-chat-button hunger-reroll" 
			data-actoruuid="${actor.uuid}" data-hunger-level="${hungerLevel}"
			>Spend 🤞 Destiny to reroll</button><br></div><br>`;
		}
	} else {
		hungerMessage += `It is a 🟩 Success!<hr />${actor.name} has overcome Hunger!<br><br>`;
		await actor.setFlag("metanthropes", "hungerRollResult", true);
		const MetaRollBeforeHungerCheck = await actor.getFlag("metanthropes", "MetaRollBeforeHungerCheck");
		metaLog(
			3,
			"metaHungerRoll",
			"Engaging metaRoll with:",
			actor,
			MetaRollBeforeHungerCheck.action,
			MetaRollBeforeHungerCheck.stat,
			MetaRollBeforeHungerCheck.isCustomRoll,
			MetaRollBeforeHungerCheck.destinyCost,
			MetaRollBeforeHungerCheck.itemName
		);
		metaRoll(
			actor,
			MetaRollBeforeHungerCheck.action,
			MetaRollBeforeHungerCheck.stat,
			MetaRollBeforeHungerCheck.isCustomRoll,
			MetaRollBeforeHungerCheck.destinyCost,
			MetaRollBeforeHungerCheck.itemName
		);
		await actor.unsetFlag("metanthropes", "MetaRollBeforeHungerCheck");
	}
	hungerRoll.toMessage({
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		flavor: hungerMessage,
		rollMode: game.settings.get("core", "rollMode"),
		flags: { "metanthropes": { actoruuid: actor.uuid } },
	});
}

/**
 * Hunger ReRoll
 */
export async function metaHungerReRoll(event) {
	event.preventDefault();
	const button = event.target;
	const actoruuid = button.dataset.actoruuid;
	const hungerLevel = parseInt(button.dataset.hungerLevel);
	const actor = await fromUuid(actoruuid);
	let currentDestiny = Number(actor.system.Vital.Destiny.value);
	if (currentDestiny > 0) {
		currentDestiny--;
		await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
		metaHungerRoll(actor, hungerLevel);
	} else {
		ui.notifications.warn(actor.name + " does not have enough Destiny to spend for reroll!");
		metaLog(3, "metaHungerReRoll", "Not enough Destiny to spend");
	}
}

/**
 * metaCoverRoll handles the rolling a simple d100 to check if the actor can find Cover.
 * 
 * @param {*} actor 
 * @param {*} coverType 
 * @param {*} coverValue 
 * @returns 
 */
export async function metaCoverRoll(actor, coverType, coverValue) {
	let coverMessage = null;
	let coverTarget = null;
	if (coverValue === 0) {
		ui.notifications.warn(actor.name + " does not have any " + coverType + " Cover to roll for!");
		return;
	} else if (coverValue === 10) {
		coverTarget = 10;
	} else if (coverValue === 25) {
		coverTarget = 25;
	} else if (coverValue === 50) {
		coverTarget = 50;
	} else if (coverValue === 75) {
		coverTarget = 75;
	} else if (coverValue === 90) {
		coverTarget = 90;
	} else {
		metaLog(5, "metaCoverRoll", "Cover Value is not valid:", coverValue);
		return;
	}
	const coverRoll = await new Roll("1d100").evaluate({ async: true });
	const coverRollResult = coverRoll.total;
	coverMessage = `Rolls to find ${coverType} Cover, with ${coverValue}% and gets a result of ${coverRollResult} (needed ${coverTarget} or less).<br><br>`;
	if (coverRollResult > coverTarget) {
		coverMessage += `It is a 🟥 Failure!<br><br>${actor.name} can't find Cover!`;
		//? Button to re-roll Cover using destiny
		const currentDestiny = Number(actor.system.Vital.Destiny.value);
		coverMessage += `<hr />${actor.name} has ${currentDestiny} 🤞 Destiny remaining.<br>`;
		if (currentDestiny > 0) {
			coverMessage += `<div class="hide-button hidden"><br><button class="metanthropes-main-chat-button cover-reroll" 
			data-actoruuid="${actor.uuid}" data-cover-value="${coverValue}" data-type="${coverType}"
			>Spend 🤞 Destiny to reroll</button><br></div><br>`;
		}
	} else {
		coverMessage += `It is a 🟩 Success!<hr />${actor.name} found ${coverType} Cover!<br><br>`;
	}
	coverRoll.toMessage({
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		flavor: coverMessage,
		rollMode: game.settings.get("core", "rollMode"),
		flags: { "metanthropes": { actoruuid: actor.uuid } },
	});
}

/**
 * Cover ReRoll
 * 
 * @param {*} event 
 */
export async function metaCoverReRoll(event) {
	event.preventDefault();
	const button = event.target;
	const actoruuid = button.dataset.actoruuid;
	const actor = await fromUuid(actoruuid);
	const coverType = button.dataset.type;
	const coverValue = parseInt(button.dataset.coverValue);
	let currentDestiny = Number(actor.system.Vital.Destiny.value);
	if (currentDestiny > 0) {
		currentDestiny--;
		await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
		metaCoverRoll(actor, coverType, coverValue);
	} else {
		ui.notifications.warn(actor.name + " does not have enough Destiny to spend for reroll!");
		metaLog(3, "metaCoverReRoll", "Not enough Destiny to spend");
	}
}