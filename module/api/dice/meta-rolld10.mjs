import { metaSheetRefresh } from "../../helpers/metahelpers.mjs";
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
 * @param {boolean} [anchor=false] - Determines if the roll result should be prepared to be injected into a chat message. Expected to be a boolean.
 * @param {boolean} [reroll=false] - Determines if the roll is a reroll. Expected to be a boolean.
 * @param {number} [rerollCounter=0] - The number of rerolls that have been performed. Expected to be a positive number.
 * @param {string} [messageId=null] - The message ID of the chat message for the reroll, if any. Expected to be a string.
 *
 * @returns {Promise<void>} A promise that resolves once the function completes its operations.
 *
 * @example
 * Rolling an actor's Weapon Damage for 3 * d10:
 * metanthropes.dice.metaRolld10(actor, "Damage", true, 3, "Weapon Name");
 */
export async function metaRolld10(
	actor,
	what,
	destinyReRoll,
	dice,
	itemName = null,
	baseNumber = 0,
	isHalf = false,
	anchor = false,
	reroll = false,
	rerollCounter = 0,
	messageId = null
) {
	metanthropes.utils.metaLog(
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
		isHalf,
		"Anchor?:",
		anchor,
		"ReRoll?",
		reroll,
		"ReRoll Counter:",
		rerollCounter,
		"Message ID:",
		messageId
	);
	let rollTotal;
	const explosiveDice = "x10";
	//? Checking if actor has Metapowers that affect the explosive dice
	//	if (await metaIsItemEquipped(actor, "Cognitive Efficiency")) {
	//		explosiveDice = "x1x10";
	//		metanthropes.utils.metaLog(3, "metaRolld10", "Using Alternative explosive dice:", explosiveDice);
	//	}
	//? dice is the number of d10 to roll
	let rolld10;
	if (baseNumber > 0) {
		rolld10 = await new Roll(`${dice}d10${explosiveDice}+${baseNumber}`).evaluate();
	} else {
		rolld10 = await new Roll(`${dice}d10${explosiveDice}`).evaluate();
	}
	if (isHalf) {
		rollTotal = Math.ceil(rolld10.total / 2);
	} else {
		rollTotal = rolld10.total;
	}
	//? Message to be printed to chat
	let message = null;
	let messageStart = "Rolls for";
	if (reroll) {
		messageStart = "Re-Rolls";
		rerollCounter++;
		if (rerollCounter > 1) messageStart += ` (×${rerollCounter})`;
		messageStart += " for";
	}
	if (itemName) {
		if (baseNumber > 0) {
			if (isHalf) {
				message = `${messageStart} ${itemName}'s ${what} with (${dice}d10)/2 + ${baseNumber} and gets a total of <span style="font-weight: bold;">${rollTotal}</span>.<br>`;
			} else {
				message = `${messageStart} ${itemName}'s ${what} with ${dice}d10 + ${baseNumber} and gets a total of <span style="font-weight: bold;">${rollTotal}</span>.<br>`;
			}
		} else {
			if (isHalf) {
				message = `${messageStart} ${itemName}'s ${what} with (${dice}d10)/2 and gets a total of <span style="font-weight: bold;">${rollTotal}</span>.<br>`;
			} else {
				message = `${messageStart} ${itemName}'s ${what} with ${dice}d10 and gets a total of <span style="font-weight: bold;">${rollTotal}</span>.<br>`;
			}
		}
	} else {
		if (baseNumber > 0) {
			if (isHalf) {
				message = `${messageStart} ${what} with (${dice}d10)/2 + ${baseNumber} and gets a total of <span style="font-weight: bold;">${rollTotal}</span>.<br>`;
			} else {
				message = `${messageStart} ${what} with ${dice}d10 + ${baseNumber} and gets a total of <span style="font-weight: bold;">${rollTotal}</span>.<br>`;
			}
		} else {
			if (isHalf) {
				message = `${messageStart} ${what} with (${dice}d10)/2 and gets a total of <span style="font-weight: bold;">${rollTotal}</span>.<br>`;
			} else {
				message = `${messageStart} ${what} with ${dice}d10 and gets a total of <span style="font-weight: bold;">${rollTotal}</span>.<br>`;
			}
		}
	}
	//? if destinyReRoll is true, allow rerolling the result by spending 1 Destiny Point
	if (destinyReRoll && actor.currentDestiny > 0) {
		message += `<br>${actor.name} has ${actor.currentDestiny} 🤞 Destiny remaining.<br>
		<div class="hide-button hidden"><br><button class="metanthropes-secondary-chat-button rolld10-reroll"
		data-actoruuid="${actor.uuid}" data-item-name="${itemName}"
		data-what="${what}" data-destiny-re-roll="${destinyReRoll}"
		data-dice="${dice}" data-base-number="${baseNumber}" data-is-half="${isHalf}"
		data-anchor="${anchor}" data-message-id="${messageId}"
		data-reroll="${reroll}" data-reroll-counter="${rerollCounter}"
		>Spend 🤞 Destiny to reroll</button><br><br></div>`;
	}
	await actor.setFlag("metanthropes", "lastrolled", {
		rolld10: rollTotal,
		rolld10what: what,
		rolld10item: itemName,
	});
	//? Print message to chat
	if (!anchor) {
		if (!reroll) {
			rolld10.toMessage({
				speaker: ChatMessage.getSpeaker({ actor: actor }),
				flavor: message,
				rollMode: game.settings.get("core", "rollMode"),
				flags: { metanthropes: { actoruuid: actor.uuid } },
			});
		} else {
			const chatMessage = game.messages.get(messageId);
			if (!chatMessage) {
				ui.notifications.warn("Could not find the chat message to update.");
				return;
			}
			const updatedRoll = await rolld10.toJSON();
			const renderedRoll = await rolld10.render();
			chatMessage.update({
				flavor: message,
				rolls: updatedRoll,
				content: renderedRoll,
				rollMode: game.settings.get("core", "rollMode"),
				flags: { metanthropes: { actoruuid: actor.uuid } },
			});
			//? Call Dice So Nice to show the roll, assumes the module is active
			game.dice3d.showForRoll(rolld10, game.user, true, chatMessage);
		}
	} else {
		if (!reroll) {
			return rolld10.toAnchor({
				label: what,
				dataset: {
					total: rollTotal,
					actoruuid: actor.uuid,
					item: itemName,
					what: what,
					destinyReRoll: destinyReRoll,
					dice: dice,
					baseNumber: baseNumber,
					isHalf: isHalf,
					reroll: reroll,
					rerollCounter: rerollCounter,
				},
			});
		} else {
			//todo update only the anchor from the original message and re-apply the damage/healing
			const chatMessage = game.messages.get(messageId);
			if (!chatMessage) {
				ui.notifications.warn("Could not find the chat message to update.");
				return;
			}
			const updatedRoll = await rolld10.toJSON();
			const renderedRoll = await rolld10.render();
			chatMessage.update({
				rolls: updatedRoll,
				rollMode: game.settings.get("core", "rollMode"),
				flags: { metanthropes: { actoruuid: actor.uuid } },
			});
			//? Call Dice So Nice to show the roll, assumes the module is active
			game.dice3d.showForRoll(rolld10, game.user, true, chatMessage);
		}
	}
	metanthropes.utils.metaLog(3, "metaRolld10", "Finished for:", actor.name + "'s", what);
	////? Refresh the actor sheet if it's open
	//metaSheetRefresh(actor);
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
	//? Traverse up the DOM to find the parent <li> element with the data-message-id attribute
	const messageElement = button.closest("li.chat-message");
	if (!messageElement) {
		ui.notifications.warn("Could not find the chat message element.");
		return;
	}
	//? Retrieve the message ID from the data-message-id attribute
	const messageId = messageElement.dataset.messageId;
	if (!messageId) {
		ui.notifications.warn("Could not retrieve the message ID.");
		return;
	}
	const actoruuid = button.dataset.actoruuid;
	const what = button.dataset.what;
	const destinyReRoll = button.dataset.destinyReRoll === "true" ? true : false;
	const itemName = button.dataset.itemName === "null" ? null : button.dataset.itemName;
	const dice = parseInt(button.dataset.dice) ?? 0;
	const baseNumber = parseInt(button.dataset.baseNumber) ?? 0;
	const isHalf = button.dataset.isHalf === "true" ? true : false;
	const anchor = button.dataset.anchor === "true" ? true : false;
	let reroll = button.dataset.reroll === "true" ? true : false;
	const rerollCounter = parseInt(button.dataset.rerollCounter) ?? 0;
	const actor = await fromUuid(actoruuid);
	const targets = button.dataset.targets ?? null;
	//? Need to check if actor has enough Destiny to spend, because they might have already spent it on another secondary button
	if (actor.currentDestiny > 0 && destinyReRoll) {
		await actor.applyDestinyChange(-1);
		if (targets) {
			//todo it's not being applied at as no ui to trigger it properly (should be fixed with the roll orchestrator)
			for (let i = 0; i < targets.length; i++) {
				const targetedActor = targets[i];
				await targetedActor.undoLastLifeChange();
			}
			metanthropes.dice.metaRolld10(
				actor,
				what,
				destinyReRoll,
				dice,
				itemName,
				baseNumber,
				isHalf,
				anchor,
				reroll,
				rerollCounter,
				messageId
			);
		} else {
			//todo
			//! apo to button kanw retrieve to message kai vriskw apo ekei kapoy to list me ta targeted actors
			//todo gia kathe ena actor kanw to rollback life kai meta kanw apply to new type of damage/healing
			// prepei na kanw account gia kathe ena type of damage, mias kai ta kanw total up otan kanw apply
			reroll = true;
			metanthropes.dice.metaRolld10(
				actor,
				what,
				destinyReRoll,
				dice,
				itemName,
				baseNumber,
				isHalf,
				anchor,
				reroll,
				rerollCounter,
				messageId
			);
		}
	} else {
		ui.notifications.warn(actor.name + " does not have enough Destiny to spend for reroll!");
		metanthropes.utils.metaLog(
			1,
			"metaRolld10ReRoll",
			"Not enough Destiny to spend",
			"OR",
			"destinyReRoll is not allowed"
		);
	}
}
