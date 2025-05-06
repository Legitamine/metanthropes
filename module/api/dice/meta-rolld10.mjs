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
 * @param {boolean} [anchor=false] - Determines if the roll result should be prepared to be injected into a chat message. Expected to be a boolean. This shpuld be reset to false for subsequent re rolls.
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
		if (rerollCounter > 1) messageStart += ` (<i class="fa-sharp-duotone fa-solid fa-xmark"></i>${rerollCounter})`;
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
	<i class="fa-sharp-duotone fa-solid fa-hand-fingers-crossed"></i> Destiny remaining.<br>
	<div class="hide-button hidden"><br><button class="metanthropes-secondary-chat-button rolld10-reroll"
	data-actoruuid="${actor.uuid}" data-item-name="${itemName}"
	data-what="${what}" data-destiny-re-roll="${destinyReRoll}"
	data-dice="${dice}" data-base-number="${baseNumber}" data-is-half="${isHalf}"
	data-anchor="${anchor}" data-message-id="${messageId}"
	data-reroll="true" data-reroll-counter="${rerollCounter}"
	>Spend <i class="fa-sharp-duotone fa-solid fa-hand-fingers-crossed"></i> Destiny to reroll</button><br><br></div>`;
	if (destinyReRoll && actor.currentDestiny > 0) {
		message += reRollButtonMessage;
	}
	await actor.setFlag("metanthropes", "lastrolled", {
		rolld10: rollTotal,
		rolld10what: what,
		rolld10item: itemName,
	});
	if (!anchor) {
		//* Not anchored, print message to chat
		if (!reroll) {
			//* Not a reroll, printing a new message
			const updatedRoll = await rolld10.toJSON();
			const renderedRoll = await rolld10.render();
			rolld10.toMessage({
				speaker: ChatMessage.getSpeaker({ actor: actor }),
				flavor: message,
				rolls: updatedRoll,
				content: renderedRoll,
				rollMode: game.settings.get("core", "rollMode"),
				flags: { metanthropes: { actoruuid: actor.uuid } },
			});
		} else {
			//* Rerolling, update the previous message
			const chatMessage = game.messages.get(messageId);
			if (!chatMessage) {
				ui.notifications.warn("Could not find the chat message to update.");
				metanthropes.utils.metaLog(
					2,
					"metaRolld10",
					"reroll",
					"Could not find the chat message to update",
					messageId
				);
				return;
			}
			const updatedRoll = await rolld10.toJSON();
			const renderedRoll = await rolld10.render();
			//? Call Dice So Nice to show the roll, assumes the module is active
			if (game.dice3d) {
				game.dice3d.showForRoll(rolld10, game.user, true, null, false, messageId);
			}
			chatMessage.update({
				flavor: message,
				rolls: updatedRoll,
				content: renderedRoll,
				rollMode: game.settings.get("core", "rollMode"),
				flags: { metanthropes: { actoruuid: actor.uuid } },
			});
			metanthropes.utils.metaLog(1, "metaRolld10", "Non-Anchored", "Updating chat message", messageId);
		}
	} else {
		//* Roll is anchored
		if (!reroll) {
			//*? don't print a chat message ?what is reroll exactly? todo: rename to more clean purpose
			//* We store in the dataset all info to display the chat message if needed from rerolls
			const updatedRoll = await rolld10.toJSON();
			const renderedRoll = await rolld10.render();
			if (game.dice3d) {
				game.dice3d.showForRoll(rolld10, game.user, true, null, false, messageId);
			}
			metanthropes.utils.metaLog(3, "metaRolld10", "Anchored", "Not updating original chat message", messageId);
			//todo! here is where I need to flip the anchor switch
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
					flavor: message,
					content: renderedRoll,
					rolls: updatedRoll,
				},
			});
		} else {
			//* Re rolling for an anchor
			const updatedRoll = await rolld10.toJSON();
			const renderedRoll = await rolld10.render();
			//? Call Dice So Nice to show the roll, if the module is active
			if (game.dice3d) {
				game.dice3d.showForRoll(rolld10, game.user, true, null, false, messageId);
			}
			const chatData = {
				speaker: ChatMessage.getSpeaker({ actor: actor }),
				flavor: message,
				rolls: updatedRoll,
				content: renderedRoll,
				rollMode: game.settings.get("core", "rollMode"),
				flags: { metanthropes: { actoruuid: actor.uuid } },
			};
			const chatMessage = game.messages.get(messageId);
			if (!chatMessage) {
				//* If no previous chat message to replace
				metanthropes.utils.metaLog(
					1,
					"metaRolld10",
					"Re rolling for anchor",
					"Could not find the chat message to update",
					messageId,
					"Creating new chat message"
				);
				ChatMessage.create(chatData);
				//? AND return the anchor, setting it to false so if we have another reroll we'll update that new message
				//! possibly not reading the dataset in proper sequence?
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
						anchor: false,
						rerollCounter: rerollCounter,
						flavor: message,
						content: renderedRoll,
						rolls: updatedRoll,
					},
				});
			} else {
				//* Replacing previous chat message
				metanthropes.utils.metaLog(1, "metaRolld10", "Re rolling for anchor", "Updating messageId", messageId);
				chatMessage.update(chatData);
				//*! Should we return this?
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
						flavor: message,
						content: renderedRoll,
						rolls: updatedRoll,
					},
				});
			}
		}
	}
	metanthropes.utils.metaLog(3, "metaRolld10", "Finished for:", actor.name + "'s", what);
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
	let rerollCounter = parseInt(button.dataset.rerollCounter) ?? 0;
	const actor = await fromUuid(actoruuid);
	const targets = button.dataset.targets ? button.dataset.targets.split(",") : [] ?? null;
	//* Return conditions
	//? Need to check if actor has enough Destiny to spend, because they might have already spent it on another secondary button
	if (!(actor.currentDestiny > 0 && destinyReRoll)) {
		ui.notifications.warn(actor.name + " does not have enough Destiny to spend for reroll!");
		metanthropes.utils.metaLog(
			1,
			"metaRolld10ReRoll",
			"Not enough Destiny to spend",
			"OR",
			"destinyReRoll is not allowed"
		);
		return;
	}
	//! reroll = true;
	//? If re rolling for healing, need to ensure we have valid targets before reducing destiny
	if (!targets && what.includes("Healing")) {
		ui.notifications.warn("You must select valid targets first");
		return;
	}
	await actor.applyDestinyChange(-1);
	// if (what.includes("Healing")) {
	// 	const reRoll = await metanthropes.dice.metaRolld10(
	// 		actor,
	// 		what,
	// 		true,
	// 		dice,
	// 		itemName,
	// 		baseNumber,
	// 		false,
	// 		true, //anchor
	// 		reroll,
	// 		rerollCounter,
	// 		messageId
	// 	);
	// 	const reRollResult = reRoll.dataset.total;
	// 	for (let i = 0; i < targets.length; i++) {
	// 		const targetedActor = await fromUuid(targets[i]);
	// 		await targetedActor.undoLastLifeChange();
	// 		await targetedActor.applyHealing(reRollResult);
	// 		metanthropes.utils.metaLog(
	// 			1,
	// 			"metaRolld10ReRoll",
	// 			"Applied Healing ReRoll",
	// 			reRollResult,
	// 			"targeted Actor",
	// 			targetedActor.name
	// 		);
	// 	}
	// 	const chatData = {
	// 		user: game.user.id,
	// 		flavor: reRoll.dataset.flavor,
	// 		speaker: ChatMessage.getSpeaker({ actor: actor }),
	// 		content: reRoll.dataset.content,
	// 		flags: { metanthropes: { actoruuid: actor.uuid } },
	// 	};
	// 	if (reroll) {
	// 		await game.messages.get(messageId).update(chatData);
	// 	} else {
	// 		await ChatMessage.create(chatData);
	// 	}
	// } else {
	//* Other Re Rolls
	if (!reroll) {
		metanthropes.utils.metaLog(1, "metaRolld10ReRoll", "Other Re Rolls", "No reroll");
		//? We are going to print a new message since this is the first reroll
		metanthropes.dice.metaRolld10(
			actor,
			what,
			destinyReRoll,
			dice,
			itemName,
			baseNumber,
			isHalf,
			anchor,
			reroll, //?!returning true from now on ? does it?
			rerollCounter,
			messageId
		);
	} else {
		metanthropes.utils.metaLog(1, "metaRolld10ReRoll", "Other Re Rolls", "Reroll");
		//?! We are following the existing reroll
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
		// }
	}
}

/**
 * metaDamageReRoll handles the re-rolling of damage and application of the new damage to targets.
 *
 * @export
 * @async
 * @param {*} event
 * @returns {*}
 */
export async function metaDamageReRoll(event) {
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
	const isHalf = button.dataset.isHalf === "true" ? true : false;
	const anchor = button.dataset.anchor === "true" ? true : false;
	let reroll = button.dataset.reroll === "true" ? true : false;
	let rerollCounter = parseInt(button.dataset.rerollCounter) ?? 0;
	const actor = await fromUuid(actoruuid);
	const targetedActors = button.dataset.targets ? button.dataset.targets.split(",") : [] ?? null;
	const damageDiceCosmic = parseInt(button.dataset.cosmicDice) ?? 0;
	const damageDiceElemental = parseInt(button.dataset.elementalDice) ?? 0;
	const damageDiceMaterial = parseInt(button.dataset.materialDice) ?? 0;
	const damageDicePsychic = parseInt(button.dataset.psychicDice) ?? 0;
	const damageBaseCosmic = parseInt(button.dataset.baseCosmicNumber) ?? 0;
	const damageBaseElemental = parseInt(button.dataset.baseElementalNumber) ?? 0;
	const damageBaseMaterial = parseInt(button.dataset.baseMaterialNumber) ?? 0;
	const damageBasePsychic = parseInt(button.dataset.basePsychicNumber) ?? 0;
	let contentMessage = null;
	let startMessage = null;
	let flavorMessage = null;
	//* Return conditions
	//? Need to check if actor has enough Destiny to spend, because they might have already spent it on another secondary button
	if (!(actor.currentDestiny > 0 && destinyReRoll)) {
		ui.notifications.warn(actor.name + " does not have enough Destiny to spend for reroll!");
		metanthropes.utils.metaLog(
			1,
			"metaDamageReRoll",
			"Not enough Destiny to spend",
			"OR",
			"destinyReRoll is not allowed"
		);
		return;
	}
	//! reroll = true;
	//? Need to ensure we have valid targets before reducing destiny
	if (!targetedActors && what.includes("Damage")) {
		ui.notifications.warn("You must select valid targets first");
		return;
	}
	await actor.applyDestinyChange(-1);
	//* Cosmic
	const cosmicDamageRoll = await metanthropes.dice.metaRolld10(
		actor,
		`Cosmic Damage`,
		true,
		damageDiceCosmic,
		itemName,
		damageBaseCosmic,
		false,
		true,
		false,
		0,
		null
	);
	const cosmicDamageRollResult = cosmicDamageRoll.dataset.total;
	const damageCosmicMessage = `${cosmicDamageRoll.outerHTML}<br>`;
	//* Elemental
	const elementalDamageRoll = await metanthropes.dice.metaRolld10(
		actor,
		`Elemental Damage`,
		true,
		damageDiceElemental,
		itemName,
		damageBaseElemental,
		false,
		true,
		false,
		0,
		null
	);
	const elementalDamageRollResult = elementalDamageRoll.dataset.total;
	const damageElementalMessage = `${elementalDamageRoll.outerHTML}<br>`;
	//* Material
	const materialDamageRoll = await metanthropes.dice.metaRolld10(
		actor,
		`Material Damage`,
		true,
		damageDiceMaterial,
		itemName,
		damageBaseMaterial,
		false,
		true,
		false,
		0,
		null
	);
	const materialDamageRollResult = materialDamageRoll.dataset.total;
	const damageMaterialMessage = `${materialDamageRoll.outerHTML}<br>`;
	//* Psychic
	const psychicDamageRoll = await metanthropes.dice.metaRolld10(
		actor,
		`Psychic Damage`,
		true,
		damageDicePsychic,
		itemName,
		damageBasePsychic,
		false,
		true,
		false,
		0,
		null
	);
	const psychicDamageRollResult = psychicDamageRoll.dataset.total;
	const damagePsychicMessage = `${psychicDamageRoll.outerHTML}<br>`;
	//* Work through targets to restore previous Life before applying new Damage
	for (let i = 0; i < targetedActors.length; i++) {
		const targetedActor = await fromUuid(targetedActors[i]);
		await targetedActor.undoLastLifeChange();
	}
	await metanthropes.logic.metaApplyDamage(
		targetedActors,
		cosmicDamageRollResult,
		elementalDamageRollResult,
		materialDamageRollResult,
		psychicDamageRollResult
	);
	//* Chat Message
	if (!reroll) {
		startMessage = "Rolls again for";
	} else {
		startMessage = "Re-Rolls";
		rerollCounter++;
		if (rerollCounter > 1) startMessage += ` (<i class="fa-sharp-duotone fa-solid fa-xmark"></i>${rerollCounter})`;
	}
	flavorMessage = `${startMessage} Damage for ${itemName} to ${targetedActors.length} target(s):<br><br>`;
	contentMessage = `<div class="meta-roll-inline-results">`;
	if (cosmicDamageRollResult > 0) contentMessage += `${damageCosmicMessage}<br>`;
	if (elementalDamageRollResult > 0) contentMessage += `${damageElementalMessage}<br>`;
	if (materialDamageRollResult > 0) contentMessage += `${damageMaterialMessage}<br>`;
	if (psychicDamageRollResult > 0) contentMessage += `${damagePsychicMessage}<br>`;
	contentMessage += `</div>`
	if (actor.currentDestiny > 0) {
		const damageReRollButton = `<div class="hide-button hidden">
		<button class="metanthropes-secondary-chat-button damage roll-damage-reroll chat-button-anchor"
		data-tooltip="Spend <i class='fa-sharp-duotone fa-solid fa-hand-fingers-crossed'></i> Destiny to reroll <i class='fa-sharp-duotone fa-solid fa-burst'></i> Damage"
		data-targets="${targetedActors}" data-actoruuid="${actor.uuid}" data-item-name="${itemName}"
		data-what="Damage" data-anchor="true" data-reroll="true" data-reroll-counter="${rerollCounter}" data-message-id="messageId"
		data-destiny-re-roll="true" data-cosmic-dice="${damageDiceCosmic}" data-base-cosmic-number="${damageBaseCosmic}"
		data-elemental-dice="${damageDiceElemental}" data-base-elemental-number="${damageBaseElemental}"
		data-material-dice="${damageDiceMaterial}" data-base-material-number="${damageBaseMaterial}"
		data-psychic-dice="${damageDicePsychic}" data-base-psychic-number="${damageBasePsychic}"
		>Spend <i class="fa-sharp-duotone fa-solid fa-hand-fingers-crossed"></i> to Reroll <i class="fa-sharp-duotone fa-solid fa-burst"></i> Damage
		</button></div><br>`;
		contentMessage += `<hr />`;
		contentMessage += damageReRollButton;
	}
	contentMessage += `<div>${actor.name} has ${actor.currentDestiny} <i class="fa-sharp-duotone fa-solid fa-hand-fingers-crossed"></i> Destiny remaining.<br></div>`;
	let chatData = {
		user: game.user.id,
		flavor: flavorMessage,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: contentMessage,
		flags: { metanthropes: { actoruuid: actor.uuid } },
	};
	if (reroll) {
		await game.messages.get(messageId).update(chatData);
	} else {
		await ChatMessage.create(chatData);
	}
	metanthropes.utils.metaLog(
		3,
		"metaDamageReRoll",
		"Applied Damage ReRoll",
		cosmicDamageRollResult,
		elementalDamageRollResult,
		materialDamageRollResult,
		psychicDamageRollResult,
		"# of targets:",
		targetedActors.length
	);
}
export async function metaHealingReRoll(event) {
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
	const isHalf = button.dataset.isHalf === "true" ? true : false;
	const anchor = button.dataset.anchor === "true" ? true : false;
	let reroll = button.dataset.reroll === "true" ? true : false;
	let rerollCounter = parseInt(button.dataset.rerollCounter) ?? 0;
	const actor = await fromUuid(actoruuid);
	const targetedActors = button.dataset.targets ? button.dataset.targets.split(",") : [] ?? null;
	const healingDice = parseInt(button.dataset.healingDice) ?? 0;
	const healingBase = parseInt(button.dataset.healingBase) ?? 0;
	let contentMessage = null;
	let startMessage = null;
	let flavorMessage = null;
	//* Return conditions
	//? Need to check if actor has enough Destiny to spend, because they might have already spent it on another secondary button
	if (!(actor.currentDestiny > 0 && destinyReRoll)) {
		ui.notifications.warn(actor.name + " does not have enough Destiny to spend for reroll!");
		metanthropes.utils.metaLog(
			1,
			"metaHealingReRoll",
			"Not enough Destiny to spend",
			"OR",
			"destinyReRoll is not allowed"
		);
		return;
	}
	//! reroll = true;
	//? Need to ensure we have valid targets before reducing destiny
	if (!targetedActors && what.includes("Healing")) {
		ui.notifications.warn("You must select valid targets first");
		return;
	}
	await actor.applyDestinyChange(-1);
	//* Healing
	const healingRoll = await metanthropes.dice.metaRolld10(
		actor,
		`Healing`,
		true,
		healingDice,
		itemName,
		healingBase,
		false,
		true,
		false,
		0,
		null
	);
	const healingRollResult = healingRoll.dataset.total;
	const healingMessage = `${healingRoll.outerHTML}<br>`;
	//* Work through targets to restore previous Life before applying new Healing
	for (let i = 0; i < targetedActors.length; i++) {
		const targetedActor = await fromUuid(targetedActors[i]);
		await targetedActor.undoLastLifeChange();
	}
	await metanthropes.logic.metaApplyHealing(targetedActors, healingRollResult);
	//* Chat Message
	if (!reroll) {
		startMessage = "Rolls again for";
	} else {
		startMessage = "Re-Rolls";
		rerollCounter++;
		if (rerollCounter > 1) startMessage += ` (<i class="fa-sharp-duotone fa-solid fa-xmark"></i>${rerollCounter})`;
	}
	flavorMessage = `${startMessage} Healing for ${itemName} to ${targetedActors.length} target(s):<br><br>`;
	contentMessage += `<div class="meta-roll-inline-results">`;
	contentMessage = `${healingMessage}`;
	contentMessage += `</div>`;
	if (actor.currentDestiny > 0) {
		const healingReRollButton = `<div class="hide-button hidden">
		<button class="metanthropes-secondary-chat-button damage roll-healing-reroll chat-button-anchor"
		data-tooltip="Spend <i class='fa-sharp-duotone fa-solid fa-hand-fingers-crossed'></i> Destiny to reroll <i class='fa-sharp-duotone fa-solid fa-burst'></i> Damage"
		data-targets="${targetedActors}" data-actoruuid="${actor.uuid}" data-item-name="${itemName}"
		data-what="Healing" data-anchor="true" data-reroll="true" data-reroll-counter="${rerollCounter}" data-message-id="messageId"
		data-destiny-re-roll="true" data-healing-dice="${healingDice}" data-healing-base="${healingBase}"
		>Spend <i class="fa-sharp-duotone fa-solid fa-hand-fingers-crossed"></i> to Reroll <i class="fa-sharp-duotone fa-solid fa-heart-pulse"></i> Healing
		</button></div><br>`;
		contentMessage += `<hr />`;
		contentMessage += healingReRollButton;
	}
	contentMessage += `<div>${actor.name} has ${actor.currentDestiny} <i class="fa-sharp-duotone fa-solid fa-hand-fingers-crossed"></i> Destiny remaining.<br></div>`;
	let chatData = {
		user: game.user.id,
		flavor: flavorMessage,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: contentMessage,
		flags: { metanthropes: { actoruuid: actor.uuid } },
	};
	if (reroll) {
		await game.messages.get(messageId).update(chatData);
	} else {
		await ChatMessage.create(chatData);
	}
	metanthropes.utils.metaLog(
		3,
		"metaHealingReRoll",
		"Applied Healing ReRoll",
		healingRollResult,
		"# of targets:",
		targetedActors.length
	);
}
