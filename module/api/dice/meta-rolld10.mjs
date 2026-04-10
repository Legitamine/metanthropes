//* Meta Roll Functions that roll d10 dice and apply Damage/healing
//! DSN doesn't show up on subsequent re-rolls of the metaDamageReRoll
//! DSN also doesn't show up on the first re-roll from the metaExecute result
//todo need to review the structure in lieu of the new VFX & DSN support (Roll Orchestrator)
//todo need to order the flow and account for who's able (supposed) to view the VFX and the dice rolls
//todo need to review the whole anchor/re-roll concept and simplify accross all meta-roll functions
//todo undoing life changes should return a promise so we can continue rather than waiting 3 sec

/**
 * metaRolld10 handles the rolling of d10 dice for a given actor and purpose.
 *
 * This function determines the number of d10 dice to roll based on the provided parameters.
 * It checks for the presence of certain Metapowers that might affect the roll and then performs the roll.
 * If destinyReRoll is set to true, it allows for a re-roll of that roll result, by spending a Destiny Point.
 *
 * Anchored rolls do not trigger DSN when the function is called, but rather when the chat message is created/updated instead.
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
	if (!anchor) {
		//* Not anchored, print message to chat
		if (!reroll) {
			//* Not a reroll, printing a new message
			mL(4, "metaRolld10", "Not Anchored", "No Re-Roll", "Creating new chat message");
			//todo! need to find a way to tell dice so nice to only show the animation if dice > 0
			//todo oxi message edw? //if ( message?.rolls.length && ("dice3d" in game) ) await game.dice3d.waitFor3DAnimationByMessageID(message.id);
			// if (game.dice3d && dice <= 0) {
			// 	rolld10.dice[0].results[0].hidden = true;
			// 	mL(4, "metaRolld10", "not anchor, no reroll", rolld10);
			// }
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
			mL(4, "metaRolld10", "Not Anchored", "Re-Roll", "Updating chat message", messageId);
			const chatMessage = game.messages.get(messageId);
			if (!chatMessage) {
				ui.notifications.warn("Could not find the chat message to update.");
				mL(2, "metaRolld10", "reroll", "Could not find the chat message to update", messageId);
				return;
			}
			const updatedRoll = await rolld10.toJSON();
			const renderedRoll = await rolld10.render();
			//? Call Dice So Nice to show the roll
			if (game.dice3d && dice > 0) {
				await game.dice3d.showForRoll(rolld10, game.user, true, null, false, messageId);
			}
			chatMessage.update({
				flavor: enrichedMessage,
				rolls: updatedRoll,
				content: renderedRoll,
				rollMode: game.settings.get("core", "rollMode"),
				flags: { metanthropes: { actoruuid: actor.uuid } },
			});
		}
	} else {
		//* Roll is anchored (shown within an existing message)
		if (!reroll) {
			mL(4, "metaRolld10", "Anchored", "No Re-roll");
			//* We store in the dataset all info to display the chat message if needed from rerolls
			//*? don't print a chat message ?what is reroll exactly? todo: rename to more clean purpose
			//! do I need this anymore for rerolls to show for all players?
			// when roll is anchored we don't want DSN to trigger before showing the result.
			// the resulting dsn animation should show up when the content message does from the parent caller (metaexecute in most cases)
			//? Call Dice So Nice to show the roll
			//! enabling causes dice to show in first activation
			// if (game.dice3d && dice > 0) {
			// 	await game.dice3d.showForRoll(rolld10, game.user, true, null, false, messageId);
			// }
			//! I need to pass the roll object for DSN through the anchor dataset to the damage/healing rerolls so they can trigger the DNS animation when they show the chat message after the initial destiny reroll
			//const updatedRoll = JSON.stringify(rolld10.toJSON());
			const updatedRoll = JSON.stringify(foundry.utils.deepClone(rolld10));
			//const renderedRoll = await rolld10.render();
			mL(5, "metaRolld10", "updatedRoll", updatedRoll, "rolld10", rolld10);
			mL(3, "metaRolld10", "Finished for:", actor.name + "'s", what);
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
					flavor: enrichedMessage,
					//content: renderedRoll, //? not including the rendered roll doesn't trigger DSN?
					rolls: updatedRoll,
				},
			});
		} else {
			//* Re rolling for an anchor
			mL(4, "metaRolld10", "Anchored", "Re-rolling");
			const updatedRoll = JSON.stringify(rolld10.toJSON());
			const renderedRoll = await rolld10.render();
			//? Call Dice So Nice to show the roll
			if (game.dice3d && dice > 0) {
				game.dice3d.showForRoll(rolld10, game.user, true, null, false, messageId);
			}
			const chatData = {
				speaker: ChatMessage.getSpeaker({ actor: actor }),
				flavor: enrichedMessage,
				rolls: updatedRoll,
				content: renderedRoll,
				rollMode: game.settings.get("core", "rollMode"),
				flags: { metanthropes: { actoruuid: actor.uuid } },
			};
			const chatMessage = game.messages.get(messageId);
			if (!chatMessage) {
				//* If no previous chat message to replace
				mL(
					4,
					"metaRolld10",
					"Re rolling for anchor",
					"Could not find the chat message to update",
					messageId,
					"Creating new chat message",
				);
				metanthropes.applications.MetaChatMessage.create(chatData);
				//? AND return the anchor, setting it to false so if we have another reroll we'll update that new message
				mL(3, "metaRolld10", "Finished for:", actor.name + "'s", what);
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
						flavor: enrichedMessage,
						content: renderedRoll,
						rolls: updatedRoll,
					},
				});
			} else {
				//* Replacing previous chat message
				mL(4, "metaRolld10", "Anchored", "Re-Roll", "Updating messageId", messageId);
				chatMessage.update(chatData);
				mL(3, "metaRolld10", "Finished for:", actor.name + "'s", what);
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
						flavor: enrichedMessage,
						content: renderedRoll,
						rolls: updatedRoll,
					},
				});
			}
		}
	}
	mL(3, "metaRolld10", "Finished for:", actor.name + "'s", what);
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
	if (!targets && what.includes("Healing" || "Damage")) {
		ui.notifications.warn("You must select valid targets first");
		return;
	}
	await actor.applyDestinyChange(-1);
	//* Re-Roll check
	if (!reroll) {
		mL(1, "metaRolld10ReRoll", "No reroll");
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
			reroll,
			rerollCounter,
			messageId,
		);
	} else {
		//! what's the difference?
		//? mainly to see when Reroll is triggered?
		mL(1, "metaRolld10ReRoll", "Reroll");
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
			messageId,
		);
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
	const mL = metanthropes.utils.metaLog;
	mL(3, "metaDamageReRoll", "Rerolling Damage Result");
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
	let reroll = button.dataset.reroll === "false" ? false : true;
	let rerollCounter = parseInt(button.dataset.rerollCounter) || 0;
	const actor = await fromUuid(actoruuid);
	const targetedActors = button.dataset.targets ? button.dataset.targets.split(",") : ([] ?? null);
	//todo ** tha mporousa na to kanw set null kai meta na min kanw call metaRoll ektos ean perimenw result
	const damageDiceCosmic = parseInt(button.dataset.diceCosmic) || 0;
	const damageDiceElemental = parseInt(button.dataset.diceElemental) || 0;
	const damageDiceMaterial = parseInt(button.dataset.diceMaterial) || 0;
	const damageDicePsychic = parseInt(button.dataset.dicePsychic) || 0;
	const damageBaseCosmic = parseInt(button.dataset.baseCosmic) || 0;
	const damageBaseElemental = parseInt(button.dataset.baseElemental) || 0;
	const damageBaseMaterial = parseInt(button.dataset.baseMaterial) || 0;
	const damageBasePsychic = parseInt(button.dataset.basePsychic) || 0;
	const damageSelectedTargets = button.dataset.damageSelectedTargets === "true" ? true : false;
	let contentMessage = ``;
	let startMessage = ``;
	let flavorMessage = ``;
	let rollData = null;
	//* Return conditions
	//? Need to check if actor has enough Destiny to spend, because they might have already spent it on another secondary button
	if (!(actor.currentDestiny > 0 && destinyReRoll)) {
		ui.notifications.warn(actor.name + " does not have enough Destiny to spend for reroll!");
		mL(1, "metaDamageReRoll", "Not enough Destiny to spend", "OR", "destinyReRoll is not allowed");
		button.classList.remove("disabled");
		return;
	}
	//todo giati exw ayto edw, eixa skopo na kanw restructure me vasi ta reroll state?
	//! reroll = true;
	//? Need to ensure we have valid targets before reducing destiny
	if (!targetedActors && damageSelectedTargets) {
		ui.notifications.warn("You must select valid targets first");
		button.classList.remove("disabled");
		return;
	}
	await actor.applyDestinyChange(-1);
	//todo see ** above
	//todo den kanw to roll ean den xreiazetai?
	let cosmicDamageRollResult = null;
	let damageCosmicMessage = null;
	let elementalDamageRollResult = null;
	let damageElementalMessage = null;
	let materialDamageRollResult = null;
	let damageMaterialMessage = null;
	let psychicDamageRollResult = null;
	let damagePsychicMessage = null;
	let rolledDice = [];
	//* Cosmic
	if (damageDiceCosmic > 0 || damageBaseCosmic > 0) {
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
			null,
		);
		mL(3, "metaDamageReRoll", "Cosmic Damage Dataset", cosmicDamageRoll.dataset);
		cosmicDamageRollResult = cosmicDamageRoll.dataset.total;
		damageCosmicMessage = `${cosmicDamageRoll.outerHTML}`;
		rolledDice.push(JSON.parse(cosmicDamageRoll.dataset.rolls));
	}
	//* Elemental
	if (damageDiceElemental > 0 || damageBaseElemental > 0) {
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
			null,
		);
		mL(3, "metaDamageReRoll", "Elemental Damage Dataset", elementalDamageRoll.dataset);
		elementalDamageRollResult = elementalDamageRoll.dataset.total;
		damageElementalMessage = `${elementalDamageRoll.outerHTML}`;
		rolledDice.push(JSON.parse(elementalDamageRoll.dataset.rolls));
	}
	//* Material
	if (damageDiceMaterial > 0 || damageBaseMaterial > 0) {
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
			null,
		);
		mL(3, "metaDamageReRoll", "Material Damage Dataset", materialDamageRoll.dataset);
		materialDamageRollResult = materialDamageRoll.dataset.total;
		damageMaterialMessage = `${materialDamageRoll.outerHTML}`;
		rolledDice.push(JSON.parse(materialDamageRoll.dataset.rolls));
	}
	//* Psychic
	if (damageDicePsychic > 0 || damageBasePsychic > 0) {
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
			null,
		);
		mL(3, "metaDamageReRoll", "Psychic Damage Dataset", psychicDamageRoll.dataset);
		psychicDamageRollResult = psychicDamageRoll.dataset.total;
		damagePsychicMessage = `${psychicDamageRoll.outerHTML}`;
		rolledDice.push(JSON.parse(psychicDamageRoll.dataset.rolls));
	}
	if (damageSelectedTargets) {
		//* Work through targets to restore previous Life before applying new Damage
		for (let i = 0; i < targetedActors.length; i++) {
			const targetedActor = await fromUuid(targetedActors[i]);
			await targetedActor.undoLastLifeChange();
		}
		//? need to timeout to make sure the life change has been done first, however this is not properly done here
		//todo instead of this arbitrary timeout, we should have a proper second socket event to track server responses? see https://foundryvtt.wiki/en/development/api/sockets - above specific use cases
		await new Promise((resolve) => setTimeout(resolve, 3000));
		await metanthropes.logic.metaApplyDamage(
			targetedActors,
			cosmicDamageRollResult,
			elementalDamageRollResult,
			materialDamageRollResult,
			psychicDamageRollResult,
		);
	}
	//* Build the chat Message
	if (!reroll) {
		startMessage = "Rolls again for";
	} else {
		startMessage = "Re-Rolls";
		rerollCounter++;
		if (rerollCounter > 1) startMessage += ` (@METAFA(xmark, null)${rerollCounter})`;
	}
	flavorMessage = `${startMessage} ${itemName}'s @METAFA(burst) Damage`;
	if (damageSelectedTargets)
		flavorMessage += ` to ${targetedActors.length} target${targetedActors.length > 1 ? "s" : ""}:<br>`;
	else flavorMessage += `.<br>`;
	if (cosmicDamageRollResult > 0)
		contentMessage += `<div class="meta-roll-inline-results">${damageCosmicMessage}</div>`;
	if (elementalDamageRollResult > 0)
		contentMessage += `<div class="meta-roll-inline-results">${damageElementalMessage}</div>`;
	if (materialDamageRollResult > 0)
		contentMessage += `<div class="meta-roll-inline-results">${damageMaterialMessage}</div>`;
	if (psychicDamageRollResult > 0)
		contentMessage += `<div class="meta-roll-inline-results">${damagePsychicMessage}</div>`;
	if (actor.currentDestiny > 0) {
		const damageReRollButton = `<div class="hide-button hidden">
		<button class="metanthropes-secondary-chat-button damage roll-damage-reroll chat-button-anchor"
		data-targets="${targetedActors}" data-actoruuid="${actor.uuid}" data-item-name="${itemName}"
		data-what="Damage" data-anchor="true" data-reroll="true" data-reroll-counter="${rerollCounter}" data-message-id="messageId"
		data-destiny-re-roll="true" data-dice-cosmic="${damageDiceCosmic}" data-base-cosmic="${damageBaseCosmic}"
		data-dice-elemental="${damageDiceElemental}" data-base-elemental="${damageBaseElemental}"
		data-dice-material="${damageDiceMaterial}" data-base-material="${damageBaseMaterial}"
		data-dice-psychic="${damageDicePsychic}" data-base-psychic="${damageBasePsychic}"
		data-damage-selected-targets="${damageSelectedTargets}"
		>Spend @METAFA(hand-fingers-crossed) to Reroll @METAFA(burst) Damage
		</button></div>`;
		contentMessage += `<hr />`;
		contentMessage += damageReRollButton;
		contentMessage += `<br>`;
	}
	contentMessage += `<div>${actor.name} has ${actor.currentDestiny} @METAFA(hand-fingers-crossed) Destiny remaining.<br><br></div>`;
	const enrichedContent = await foundry.applications.ux.TextEditor.enrichHTML(contentMessage, { async: true });
	const enrichedFlavor = await foundry.applications.ux.TextEditor.enrichHTML(flavorMessage, { async: true });
	//const updatedRoll = JSON.stringify(.toJSON();
	//const renderedRoll = await hungerRoll.render();
	mL(5, "metaDamageReRoll", "rolls", rolledDice);
	let chatData = {
		//speaker: ChatMessage.getSpeaker({ actor: actor }),
		//user: game.user.id,
		flavor: enrichedFlavor,
		//rolls: rolledDice,
		content: enrichedContent,
		rollMode: game.settings.get("core", "rollMode"),
		flags: { metanthropes: { actoruuid: actor.uuid } },
	};
	if (reroll) {
		mL(4, "metaDamageReRoll", "Reroll");
		//todo edw vazw to extra bit gia DSN giati den kanw create new message
		//? issue edw einai oti exw kanei roll 4xmetarolls, poio akrivws tha diksw edw?
		//! ara na kanei show to DSN to idio to metaroll instead? oxi exw to rolls apo to dataset
		mL(5, "dice", rolledDice);
		// if (game.dice3d) {
		// 	await game.dice3d.showForRoll(rolledDice, game.user, true, null, false, messageId);
		// }
		await game.messages.get(messageId).update(chatData);
	} else {
		mL(4, "metaDamageReRoll", "No Reroll");
		//!review oti edw sto prwto diladi reroll apo meta-execute vlepw dsn, right?
		await metanthropes.applications.MetaChatMessage.create(chatData);
	}
	mL(
		3,
		"metaDamageReRoll",
		"Applied Damage ReRoll",
		cosmicDamageRollResult,
		elementalDamageRollResult,
		materialDamageRollResult,
		psychicDamageRollResult,
		`Target${targetedActors.length > 1 ? "s" : ""}:`,
		targetedActors.length,
	);
}

/**
 * metaHealingReRoll handles the re-rolling of healing and applying the new value to targets.
 *
 * @export
 * @async
 * @param {*} event
 * @returns {*}
 */
export async function metaHealingReRoll(event) {
	const mL = metanthropes.utils.metaLog;
	mL(3, "metaHealingReRoll", "Rerolling Healing Result");
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
	let reroll = button.dataset.reroll === "false" ? false : true;
	let rerollCounter = parseInt(button.dataset.rerollCounter) ?? 0;
	const actor = await fromUuid(actoruuid);
	const targetedActors = button.dataset.targets ? button.dataset.targets.split(",") : ([] ?? null);
	const healingDice = parseInt(button.dataset.healingDice) ?? 0;
	const healingBase = parseInt(button.dataset.healingBase) ?? 0;
	const healSelectedTargets = button.dataset.healSelectedTargets === "true" ? true : false;
	let contentMessage = ``;
	let startMessage = ``;
	let flavorMessage = ``;
	//* Return conditions
	//? Need to check if actor has enough Destiny to spend, because they might have already spent it on another secondary button
	if (!(actor.currentDestiny > 0 && destinyReRoll)) {
		ui.notifications.warn(actor.name + " does not have enough Destiny to spend for reroll!");
		mL(1, "metaHealingReRoll", "Not enough Destiny to spend", "OR", "destinyReRoll is not allowed");
		button.classList.remove("disabled");
		return;
	}
	//? Need to ensure we have valid targets before reducing destiny
	if (!targetedActors && healSelectedTargets) {
		ui.notifications.warn("You must select valid targets first");
		button.classList.remove("disabled");
		return;
	}
	//! reroll = true;
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
		null,
	);
	const healingRollResult = healingRoll.dataset.total;
	const healingMessage = `${healingRoll.outerHTML}<br>`;
	if (healSelectedTargets) {
		//* Work through targets to restore previous Life before applying new Healing
		for (let i = 0; i < targetedActors.length; i++) {
			const targetedActor = await fromUuid(targetedActors[i]);
			await targetedActor.undoLastLifeChange();
		}
		//! stin ousia edw thelw na perimenw ena confirm apo server oti ginane ta undolife changes prin paw na kanw apply ta new ones
		//todo instead of this arbitrary timeout, we should have a proper second socket event to track server responses? see https://foundryvtt.wiki/en/development/api/sockets - above specific use cases
		//?des edw gia to pws perimenw na teleiwsei to animation https://gitlab.com/riccisi/foundryvtt-dice-so-nice/-/wikis/API/Roll
		await new Promise((resolve) => setTimeout(resolve, 3000));
		await metanthropes.logic.metaApplyHealing(targetedActors, healingRollResult);
	}
	//* Chat Message
	if (!reroll) {
		startMessage = "Rolls again for";
	} else {
		startMessage = "Re-Rolls";
		rerollCounter++;
		if (rerollCounter > 1) startMessage += ` (@METAFA(xmark, null)${rerollCounter})`;
	}
	flavorMessage = `${startMessage} ${itemName}'s @METAFA(heart-pulse) Healing`;
	if (healSelectedTargets)
		flavorMessage += ` to ${targetedActors.length} target${targetedActors.length > 1 ? "s" : ""}:<br>`;
	else flavorMessage += `.<br>`;
	contentMessage += `<div class="meta-roll-inline-results">`;
	contentMessage += `${healingMessage}`;
	contentMessage += `</div>`;
	if (actor.currentDestiny > 0) {
		const healingReRollButton = `<div class="hide-button hidden">
		<button class="metanthropes-secondary-chat-button damage roll-healing-reroll chat-button-anchor"
		data-targets="${targetedActors}" data-actoruuid="${actor.uuid}" data-item-name="${itemName}"
		data-what="Healing" data-anchor="true" data-reroll="true" data-reroll-counter="${rerollCounter}" data-message-id="messageId"
		data-destiny-re-roll="true" data-healing-dice="${healingDice}" data-healing-base="${healingBase}"
		data-heal-selected-targets="${healSelectedTargets}"
		>Spend @METAFA(hand-fingers-crossed) to Reroll @METAFA(heart-pulse) Healing
		</button></div>`;
		contentMessage += `<hr />`;
		contentMessage += healingReRollButton;
		contentMessage += `<br>`;
	}
	contentMessage += `<div>${actor.name} has ${actor.currentDestiny} @METAFA(hand-fingers-crossed) Destiny remaining.<br><br></div>`;
	const enrichedContent = await foundry.applications.ux.TextEditor.enrichHTML(contentMessage, { async: true });
	const enrichedFlavor = await foundry.applications.ux.TextEditor.enrichHTML(flavorMessage, { async: true });
	const finalMessage = `${enrichedFlavor}${enrichedContent}`;
	//! parsing the object from the string stored in the dataset
	//todo: see https://gitlab.com/riccisi/foundryvtt-dice-so-nice/-/wikis/Integration#step-3-create-a-chat-message-with-the-required-data
	const updatedRoll = await JSON.parse(healingRoll.dataset.rolls);
	const renderedRoll = healingRoll.dataset.content;
	//mL(2, "healingRoll", updatedRoll, renderedRoll);
	//const updatedRoll = await healingRoll.toJSON(); //!!!
	//const renderedRoll = await healingRoll.render();
	let chatData = {
		//speaker: ChatMessage.getSpeaker({ actor: actor }),
		flavor: finalMessage,
		//? deprecated in v12: type: CONST.CHAT_MESSAGE_STYLES.ROLL,
		rolls: updatedRoll,
		content: renderedRoll,
		rollMode: game.settings.get("core", "rollMode"),
		flags: { metanthropes: { actoruuid: actor.uuid } },
	};
	if (reroll) {
		mL(1, "metaHealingReRoll", "Reroll");
		//? need to call dsn as we don't use the roll class to update the message
		if (game.dice3d) {
			await game.dice3d.showForRoll(updatedRoll, game.user, true, null, false, messageId);
		}
		const chatMessage = await game.messages.get(messageId);
		//chatMessage.applyRollMode(chatData, "roll");
		chatMessage.update(chatData);
	} else {
		mL(1, "metaHealingReRoll", "No Reroll");
		await metanthropes.applications.MetaChatMessage.create(chatData);
	}
	mL(3, "metaHealingReRoll", "Applied Healing ReRoll", healingRollResult, "# of targets:", targetedActors.length);
}
