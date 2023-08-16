/**
 * Rolld10 handles the rolling of d10 dice for a given actor and purpose.
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
 *
 * @returns {Promise<void>} A promise that resolves once the function completes its operations.
 *
 * @example
 * Rolling an actor's Weapon Damage for 3 * d10:
 * Rolld10(actor, "Damage", true, 3, "Weapon Name");
 */
export async function Rolld10(actor, what, destinyReRoll, dice, itemName = "", baseNumber = 0) {
	//? Checking if actor has Metapowers that affect the explosive dice
	let explosiveDice = "x10";
	const metapowers = actor.items.filter((item) => item.type === "Metapower");
	const hasArbiterPowers = metapowers.some((metapower) => metapower.name === "Arbiter Powers");
	if (hasArbiterPowers) {
		explosiveDice = "x1x2x10";
	}
	//? dice is the number of d10 to roll
	let rolld10;
	if (baseNumber > 0) {
		rolld10 = await new Roll(`${dice}d10${explosiveDice}+${baseNumber}`).evaluate({ async: true });
	} else {
		rolld10 = await new Roll(`${dice}d10${explosiveDice}`).evaluate({ async: true });
	}
	const rollTotal = rolld10.total;
	//? Message to be printed to chat
	let message = null;
	if (itemName) {
		if (baseNumber > 0) {
			message = `${actor.name} rolls for ${itemName}'s ${what} with ${dice} * d10 + ${baseNumber} and gets a total of ${rollTotal}.<br>`;
		} else {
			message = `${actor.name} rolls for ${itemName}'s ${what} with ${dice} * d10 and gets a total of ${rollTotal}.<br>`;
		}
	} else {
		if (baseNumber > 0) {
			message = `${actor.name} rolls for ${what} with ${dice} * d10 + ${baseNumber} and gets a total of ${rollTotal}.<br>`;
		} else {
			message = `${actor.name} rolls for ${what} with ${dice} * d10 and gets a total of ${rollTotal}.<br>`;
		}
	}
	//? if destinyReRoll is true, allow rerolling the result by spending 1 Destiny Point
	let currentDestiny = Number(actor.system.Vital.Destiny.value);
	if (destinyReRoll && currentDestiny > 0) {
		message += `<br>${actor.name} has ${currentDestiny} * 🤞 Destiny remaining.<br>
		<div class="hide-button hidden"><br><button class="metanthropes-secondary-chat-button rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}"
		data-what="${what}" data-destiny-re-roll="${destinyReRoll}" data-dice="${dice}" data-base-number="${baseNumber}">Spend 🤞 Destiny to reroll
		</button><br><br></div>`;
	}
	await actor.setFlag("metanthropes-system", "lastrolled", {
		rolld10: rollTotal,
		rolld10what: what,
		rolld10item: itemName,
	});
	//? Print message to chat
	rolld10.toMessage({
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		flavor: message,
		rollMode: game.settings.get("core", "rollMode"),
		flags: { "metanthropes-system": { actoruuid: actor.uuid } },
	});
	//? Refresh the actor sheet if it's open
	const sheet = actor.sheet;
	if (sheet && sheet.rendered) {
		sheet.render(true);
	}
}
/**
 * Rolld10ReRoll is triggered when the destiny re-roll button is clicked.
 *
 * This function handles the re-rolling of d10 dice for a given actor based on the provided event data.
 * It reduces the actor's Destiny value by 1 and then calls the Rolld10 function to perform the re-roll.
 *
 * @param {Event} event - The event object associated with the button click.
 *
 * @returns {Promise<void>} A promise that resolves once the function completes its operations.
 *
 * @example
 * This function is not called directly, but rather via an event listener.
 */
export async function Rolld10ReRoll(event) {
	event.preventDefault();
	const button = event.target;
	const actoruuid = button.dataset.actoruuid;
	const what = button.dataset.what;
	const destinyReRoll = button.dataset.destinyReRoll;
	const itemName = button.dataset.itemName;
	const dice = parseInt(button.dataset.dice);
	const baseNumber = parseInt(button.dataset.baseNumber);
	const actor = await fromUuid(actoruuid);
	//? Reduce Destiny.value by 1
	console.log("Metanthropes RPG System | Rolld10ReRoll | Evaluating destiny for:", actor);
	let currentDestiny = Number(actor.system.Vital.Destiny.value);
	//? Need to check if actor has enough Destiny to spend, because they might have already spent it on another secondary button
	if (currentDestiny > 0 && destinyReRoll) {
		currentDestiny -= 1;
		await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
		console.log(
			"Metanthropes RPG System | Rolld10ReRoll | Engaging Rolld10 for:",
			actor.name + "'s",
			what,
			destinyReRoll,
			dice,
			itemName,
			baseNumber
		);
		await Rolld10(actor, what, destinyReRoll, dice, itemName, baseNumber);
		//? Refresh the actor sheet if it's open
		const sheet = actor.sheet;
		if (sheet && sheet.rendered) {
			sheet.render(true);
		}
	} else {
		ui.notifications.warn(actor.name + " does not have enough Destiny to spend for reroll!");
		console.log("Metanthropes RPG System | Rolld10ReRoll | Not enough Destiny to spend, or destinyReRoll is false");
	}
}
