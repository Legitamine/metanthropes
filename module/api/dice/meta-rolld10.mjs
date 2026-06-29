/**
 * metaRolld10 handles the rolling of d10 dice for a given actor and purpose.
 *
 * It checks for the presence of certain Metapowers that might affect the roll and then performs the roll.
 * If destinyReRoll is set to true, it allows for a re-roll of that roll result, by spending a Destiny Point.
 * For Non-Anchored rolls, metaRolld10 will create (or update if reroll is true) the chat message and trigger DSN animation
 * For Anchored rolls, metaRolld10 will return the roll to anchor and won't trigger DSN or update any chat message.
 * For Anchored rolls, the calling function needs to take care of triggering DSN and create/update the chat message.
 * todo need to review the structure in lieu of the new VFX & DSN support (Roll Orchestrator)
 * todo need to order the flow and account for who's able (supposed) to view the VFX and the dice rolls
 *
 * @param {Object} actor - The actor performing the roll. Expected to be an Actor object.
 * @param {string} what - The reason or purpose for the roll. Expected to be a string. (eg: "Damage")
 * @param {boolean} destinyReRoll - Determines if a re-roll using Destiny is allowed. Expected to be a boolean.
 * @param {number} dice - The number of d10 dice to roll. Expected to be a positive number.
 * @param {string} [itemName=null] - The name of the item associated with the roll, if any. Expected to be a string.
 * @param {number} [baseNumber=0] - A fixed number to add to the roll result, if any. Expected to be a positive number.
 * @param {boolean} [isHalf=false] - Determines if the roll result should be halved. Expected to be a boolean.
 * @param {boolean} [anchor=false] - Determines if the roll result should be prepared to be injected into a chat message. Expected to be a boolean. This should be reset to False for subsequent re rolls.
 * @param {boolean} [reroll=false] - Determines if the roll is a reroll. Expected to be a boolean.
 * @param {number} [rerollCounter=0] - The number of rerolls that have been performed. Expected to be a positive number.
 * @param {string} [messageId=null] - The message ID of the chat message for the reroll, if any. Expected to be a string.
 * @returns {Promise<...>}
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
	messageId = null,
) {
	const mL = metanthropes.utils.metaLog;
	dice = typeof dice === "string" ? parseInt(dice) : dice;
	baseNumber = typeof baseNumber === "string" ? parseInt(baseNumber) : baseNumber;
	//? ensure reading the string to match a bool value
	isHalf = isHalf === true || isHalf === "true";
	anchor = anchor === true || anchor === "true";
	reroll = reroll === true || reroll === "true"; //? so if either true or "true" reroll now is true (bool), so I can use (!reroll) etc
	mL(
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
		messageId,
	);
	let rollTotal;
	const explosiveDice = "x10";
	//todo Checking if actor has Metapowers that affect the explosive dice - should be done via actor active effects
	//	if (await metaIsItemEquipped(actor, "Cognitive Efficiency")) {
	//		explosiveDice = "x1x10";
	//		mL(3, "metaRolld10", "Using Alternative explosive dice:", explosiveDice);
	//	}
	let customDiceTheme;
	const customDiceThemeSetting = game.settings.get("metanthropes", "dsnDamageDice");
	if (customDiceThemeSetting) {
		switch (what) {
			case "Cosmic Damage":
				customDiceTheme = `[meta-cosmic]`;
				break;
			case "Elemental Damage":
				customDiceTheme = `[meta-elemental]`;
				break;
			case "Psychic Damage":
				customDiceTheme = `[meta-psychic]`;
				break;
			case "Material Damage":
				customDiceTheme = `[meta-material]`;
				break;
			default:
				customDiceTheme = ``;
				break;
		}
	} else customDiceTheme = ``;
	let rolld10;
	if (baseNumber > 0) {
		rolld10 = await new Roll(`${dice}d10${explosiveDice}${customDiceTheme}+${baseNumber}`).evaluate();
	} else {
		rolld10 = await new Roll(`${dice}d10${explosiveDice}${customDiceTheme}`).evaluate();
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
		if (rerollCounter > 1) messageStart += ` (@METAFA(xmark, null, xs)${rerollCounter})`;
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
	//? Create the re-roll button for the chat, taking into account anchoring for re-rolls
	const reRollButtonMessage = `<br>${actor.name} has ${actor.currentDestiny}
	@METAFA(hand-fingers-crossed) Destiny remaining.<br>
	<div class="hide-button hidden"><br><button class="metanthropes-secondary-chat-button rolld10-reroll"
	data-actoruuid="${actor.uuid}" data-item-name="${itemName}"
	data-what="${what}" data-destiny-re-roll="${destinyReRoll}"
	data-dice="${dice}" data-base-number="${baseNumber}" data-is-half="${isHalf}"
	data-anchor="${anchor}" data-message-id="${messageId}"
	data-reroll="true" data-reroll-counter="${rerollCounter}"
	>Spend @METAFA(hand-fingers-crossed) Destiny to reroll</button><br></div>`;
	if (destinyReRoll && actor.currentDestiny > 0) {
		message += reRollButtonMessage;
	}
	await actor.setFlag("metanthropes", "lastrolled", {
		rolld10: rollTotal,
		rolld10what: what,
		rolld10item: itemName,
	});
	//* Enrich the message
	const enrichedMessage = await foundry.applications.ux.TextEditor.enrichHTML(message, { async: true });
	//* Anchored rolls - we don't manage DSN or Chat
	if (anchor) {
		const updatedRoll = JSON.stringify(rolld10.toJSON());
		const renderedRoll = await rolld10.render();
		mL(3, "metaRolld10", "Anchored", reroll ? "Re-Roll" : "No Re-roll");
		mL(3, "metaRolld10", "Finished for:", actor.name + "'s", what);
		return rolld10.toAnchor({
			label: what,
			dataset: {
				total: rollTotal,
				actoruuid: actor.uuid,
				item: itemName,
				what,
				destinyReRoll,
				dice,
				baseNumber,
				isHalf,
				anchor: true,
				reroll,
				rerollCounter,
				flavor: enrichedMessage,
				content: renderedRoll,
				rolls: updatedRoll,
			},
		});
	}
	//* Non Anchored rolls - we will manage the DSN & Chat
	if (!anchor) {
		if (!reroll) {
			//* Not a reroll, printing a new message
			mL(3, "metaRolld10", "Not Anchored", "No Re-Roll", "Creating new chat message");
			const updatedRoll = await rolld10.toJSON();
			const renderedRoll = await rolld10.render();
			rolld10.toMessage({
				speaker: ChatMessage.getSpeaker({ actor: actor }),
				flavor: enrichedMessage,
				rolls: updatedRoll,
				content: renderedRoll,
				rollMode: game.settings.get("core", "rollMode"),
				flags: { metanthropes: { actoruuid: actor.uuid } },
			});
		} else {
			//* Rerolling, update the previous message
			mL(3, "metaRolld10", "Not Anchored", "Re-Roll", "Updating chat message", messageId);
			const chatMessage = game.messages.get(messageId);
			if (!chatMessage) {
				mL(2, "metaRolld10", "Not Anchored", "Re-Roll", "Could not find the chat message to update", messageId);
				return;
			}
			const renderedRoll = await rolld10.render();
			//? Call Dice So Nice to show the roll
			if (game.dice3d && dice > 0) {
				await game.dice3d.showForRoll(rolld10, game.user, true, null, false, messageId);
			}
			chatMessage.update({
				flavor: enrichedMessage,
				content: renderedRoll,
				rollMode: game.settings.get("core", "rollMode"),
				flags: { metanthropes: { actoruuid: actor.uuid } },
			});
		}
		mL(3, "metaRolld10", "Finished for:", actor.name + "'s", what);
	}
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
	const mL = metanthropes.utils.metaLog;
	event.preventDefault();
	//* Gather params
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
	let reroll = button.dataset.reroll === "false" ? false : true;
	let rerollCounter = parseInt(button.dataset.rerollCounter) ?? 0;
	const actor = await fromUuid(actoruuid);
	const targets = button.dataset.targets ? button.dataset.targets.split(",") : ([] ?? null);
	//* Return conditions
	//? Need to check if actor has enough Destiny to spend, because they might have already spent it on another secondary button
	if (!(actor.currentDestiny > 0 && destinyReRoll)) {
		ui.notifications.warn(actor.name + " does not have enough Destiny to spend for reroll!");
		mL(1, "metaRolld10ReRoll", "Not enough Destiny to spend", "OR", "destinyReRoll is not allowed");
		return;
	}
	//? If re rolling for damage/healing, need to ensure we have valid targets before reducing destiny
	if (!targets.length && (what.includes("Healing") || what.includes("Damage"))) {
		ui.notifications.warn("You must select valid targets first");
		return;
	}
	await actor.applyDestinyChange(-1);
	//* Call metaRolld10
	mL(3, "metaRolld10ReRoll", "Finished, calling metaRolld10", reroll ? "Reroll" : "No reroll");
	await metanthropes.dice.metaRolld10(
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
		messageId,
	);
}
