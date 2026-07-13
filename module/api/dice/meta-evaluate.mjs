/**
 * metaEvaluate calculates the result of a d100 roll, sets actor flags and prints it to chat
 *
 * This function calculates the results of a roll based on the provided parameters,
 * determines the levels of success or failure, checks for critical outcomes,
 * and then constructs and sends a message to the chat with the results.
 *
 * Note that Cover & Hunger rolls, although d100 rolls, are handled differently because they don't grant/allow Critical Success/Failures
 *
 * @param {Object} actorUUID - The UUID for the Actor making the roll.
 * @param {String} action - The type of action being performed (e.g., "StatRoll", "Initiative", "Metapower", "Possession", "Combo"). Expected to be a string.
 * @param {String} stat - The stat being rolled against. Expected to be a string.
 * @param {Number} statScore - The current score of the stat being rolled against. Expected to be a positive number.
 * @param {Number} multiAction [multiAction=0] - The Reduction for multi-actions. Expected to be negative.
 * @param {Number} perkReduction [perkReduction=0] - A Reduction caused by missing Perk Skill Levels. Expected to be negative.
 * @param {Number} aimingReduction [aimingReduction=0] - A Reduction caused by aiming at a specific body part. Expected to be negative.
 * @param {Number} customReduction [customReduction=0] - A Reduction caused by a custom effect. Expected to be negative.
 * @param {Number} bonus [bonus=0] - Any bonuses applied to the roll. Expected to be positive.
 * @param {Number} penalty [penalty=0] - Any penalties applied to the roll. Expected to be negative.
 * @param {Number} pain [pain=0] - Any Pain Condition applied to the roll. Expected to be positive.
 * @param {Number} destinyCost [destinyCost=0] - The Destiny cost of the Metapower. Expected to be positive.
 * @param {String} itemName [itemName=""] - The name of the Possession or Metapower. Expected to be a string. //todo do I need to keep this? refactor callers too, if I change this.
 * @param {String} messageId [messageId=""] - The message ID of the chat message to update with the new roll result. Expected to be a string.
 * @param {Boolean} reroll [reroll=false] - If this a re-roll from Destiny spending or not.
 * @param {Number} rerollCounter [rerollCounter=0] - The number of Destiny rerolls already made.
 * @param {String} itemUUID [itemUUID=null] - The Item UUID, expected to be a string.
 *
 * @returns {Promise<void>} A promise that resolves once the function completes its operations.
 *
 */
export async function metaEvaluate({
	actorUUID,
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
	itemName = null,
	messageId = null,
	reroll = false,
	rerollCounter = 0,
	itemUUID = null,
}) {
	const mL = metanthropes.utils.metaLog;
	const actor = (await fromUuid(actorUUID)) ?? null;
	if (!actor) return mL(2, "metaEvaluate", "Could not figure out the Actor from UUID:", actorUUID);
	mL(
		3,
		"metaEvaluate",
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
		itemName,
		"Message ID:",
		messageId,
		"Re-Roll?",
		reroll,
		"Reroll Counter:",
		rerollCounter,
		"ItemUUID",
		itemUUID,
	);

	//* Variables
	bonus = bonus || 0;
	penalty = penalty || 0;
	multiAction = multiAction || 0;
	aimingReduction = aimingReduction || 0;
	customReduction = customReduction || 0;
	let result = null;
	let resultLevel = null;
	let autoExecute = false;
	const successColor = metanthropes.system.COLORS.success;
	const failureColor = metanthropes.system.COLORS.failure;

	//* Check for Destiny Cost in case of a Metapower
	//todo: 'hail mary' achievement where we have destiny cost and missing 1 destiny that we would get from a critical, should we still allow the roll, spending all remaining destiny?
	if (action === "Metapower") {
		if (actor.currentDestiny < Number(destinyCost)) {
			ui.notifications.warn(actor.name + " doesn't have " + destinyCost + " Destiny to activate " + itemName);
			return;
		} else {
			await actor.applyDestinyChange(-Number(destinyCost));
		}
	}

	//* Evaluate the result of the roll
	const roll = await new Roll("1d100").evaluate();
	const rollResult = roll.total;
	const criticalSuccess = rollResult === 1;
	const criticalFailure = rollResult === 100;
	const rollMinus = multiAction + perkReduction + aimingReduction + customReduction + penalty;
	const rollPlus = statScore + bonus;
	const rollEffectiveResult = rollResult - rollPlus + rollMinus;
	mL(3, "metaEvaluate", "rollEffectiveResult", rollEffectiveResult);
	let levelsOfSuccess = Math.floor(
		(statScore + bonus + penalty + multiAction + perkReduction + aimingReduction + customReduction - rollResult) /
			10,
	);
	let levelsOfFailure = Math.floor(
		(rollResult - statScore - bonus - multiAction - perkReduction - aimingReduction - customReduction - penalty) /
			10,
	);
	//? this kicks-off the calculation, assuming that is is a failure
	if (rollResult - multiAction - perkReduction - aimingReduction - customReduction - penalty > statScore + bonus) {
		//? in which case we don't care about what levels of success we have, so we set to 0 to avoid confusion later
		result = `@METAFA(square-xmark, failure) <b>Failure</b>`;
		levelsOfSuccess = 0;
		//? resultlevel is a numerical value to facilitate other functions to use the result of the roll
		resultLevel = 0;
	} else {
		//? if it's a success, similarly as above, we don't care about levels of failure
		result = `@METAFA(square, success) <b>Success</b>`;
		levelsOfFailure = 0;
		resultLevel = 0.5;
	}
	//? check for critical success or failure
	if (criticalSuccess) {
		result = `@METAFA(square, success, beat-fade) Critical Success @METAFA(square, success, beat-fade), rewarding ${actor.name} with +1 @METAFA(hand-fingers-crossed) Destiny`;
		await actor.applyDestinyChange(1);
		levelsOfSuccess = 10;
		levelsOfFailure = 0;
		if (statScore > 100) {
			levelsOfSuccess += Math.floor((statScore - 100) / 10);
		}
		if (bonus > 0) {
			levelsOfSuccess += Math.floor(bonus / 10);
		}
		//todo: edw tha valw +/- gia bonus KAI penalty ean to theloume, opote penalty kanei reduce kai ta crit success kai bonus antistrofa sta crit failure?
		//if a/b
		//
	}
	if (criticalFailure) {
		result = `@METAFA(square-xmark, failure, beat-fade) Critical Failure @METAFA(square-xmark, failure, beat-fade), rewarding ${actor.name} with +1 @METAFA(hand-fingers-crossed) Destiny`;
		await actor.applyDestinyChange(1);
		levelsOfFailure = 10;
		levelsOfSuccess = 0;
		if (penalty < 0) {
			levelsOfFailure -= Math.ceil(penalty / 10);
		}
	}
	//* Build the Chat Message
	//? Create the message to be printed to chat - remember: Penalties and Reductions are Negative, Bonus and Pain are Positive
	const needToRoll =
		statScore + bonus + penalty + multiAction + perkReduction + aimingReduction + customReduction - pain * 10;
	let needToRollMessage = ``;
	if (needToRoll <= 1) needToRollMessage = `(needed Critical Success)`;
	else if (needToRoll >= 100) needToRollMessage = `(needed no Critical Failure)`;
	else needToRollMessage = `(needed ${needToRoll} or less)`;
	let message = null;
	let startMessage = null;
	if (!reroll) {
		startMessage = "Rolls";
	} else {
		startMessage = "Re-Rolls";
		rerollCounter++;
		if (rerollCounter > 1) startMessage += ` (@METAFA(xmark, null, xs)${rerollCounter})`;
	}
	if (action === "StatRoll") {
		message = `${startMessage} for ${stat} with a score of ${statScore}%`;
	} else if (action === "Initiative") {
		message = `${startMessage} for Initiative with ${stat} score of ${statScore}%`;
	} else if (action === "Metapower") {
		if (Number(destinyCost) > 0) {
			message = `${startMessage} to activate @METALINK(${itemUUID}) by spending ${destinyCost} @METAFA(hand-fingers-crossed) Destiny, with ${stat} score of ${statScore}%`;
		} else {
			message = `${startMessage} to activate @METALINK(${itemUUID}) with ${stat} score of ${statScore}%`;
		}
	} else if (action === "Possession") {
		message = `${startMessage} to use @METALINK(${itemUUID}) with ${stat} score of ${statScore}%`;
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
	message += ` and the result is <b>${rollResult}</b> ${needToRollMessage}.<br><br>`;
	//? The final message section needs to be bold
	//message += `<span style="font-weight: bold;">`;
	//? if we have Pain condition, our successfull (only) results are lowered by an equal amount - in case of Criticals we ignore Pain
	let painEffect = levelsOfSuccess - pain;
	if (resultLevel > 0 && !criticalSuccess && pain > 0) {
		mL(4, "metaEvaluate", "Results are affected by Pain");
		if (painEffect < 0) {
			result = `@METAFA(square-xmark, failure) Failure`;
			resultLevel = 0;
			levelsOfFailure = 0;
			levelsOfSuccess = 0;
			message += `It was a Success, turned into a <b>${result}</b>, because of Pain ${pain}`;
			mL(1, "metaEvaluate", "Pain Effect should be <0", painEffect, "levelsOfSuccess:", levelsOfSuccess);
		} else if (painEffect === 0) {
			message += `It is still a <b>${result}</b>, besides being affected by Pain ${pain}`;
			levelsOfSuccess = 0;
			mL(1, "metaEvaluate", "Pain Effect should be =0", painEffect, "levelsOfSuccess:", levelsOfSuccess);
		} else if (painEffect > 0) {
			message += `It is a <b>${result}</b>, reduced by Pain ${pain}`;
			levelsOfSuccess = painEffect;
			mL(1, "metaEvaluate", "Pain Effect should be >0", painEffect, "levelsOfSuccess:", levelsOfSuccess);
		}
	} else {
		//? Print the result of the roll
		message += `It is a <b>${result}</b>`;
	}
	//? if we have levels of success or failure, add them to the message
	if (levelsOfSuccess > 0) {
		message += `, accumulating:<br><b>${levelsOfSuccess}</b> @METAFA(check, success) Level${
			levelsOfSuccess > 1 ? "s" : ""
		} of Success.`;
		resultLevel = levelsOfSuccess;
	} else if (levelsOfFailure > 0) {
		message += `, accumulating:<br><b>${levelsOfFailure}</b> @METAFA(xmark, failure) Level${
			levelsOfFailure > 1 ? "s" : ""
		} of Failure.`;
		resultLevel = -levelsOfFailure;
	} else {
		message += `.`;
	}
	//? Bold text stops here
	//message += `</span>`;

	//* Add re-roll buttons to the message
	//? Buttons to Re-Roll metaEvaluate results - only adds the button to message, if it's not a Critical and only if they have enough Destiny for needed reroll.
	//? The buttons are hidden for everyone except the Player of the Actor and the GM
	//? Define threshold of showing the button, to re-roll we need a minimum of 1 Destiny + the Destiny Cost of the Metapower (only applies to Metapowers with DestinyCost, otherwise it's 0)
	const threshold = 1 + Number(destinyCost);
	if (!criticalSuccess && !criticalFailure && actor.currentDestiny >= threshold) {
		message += `<div class="hide-button hidden"><hr/></div>`;
		if (action === "Initiative") {
			//? Button to re-roll Initiative
			message += `<div class="hide-button hidden"><button class="metanthropes-main-chat-button metainitiative-reroll"
			data-actoruuid="${actorUUID}" data-action="${action}"
			data-message-id="${messageId}" data-reroll="true" data-reroll-counter="${rerollCounter}"
			>Spend @METAFA(hand-fingers-crossed) Destiny to reroll</button></div>`;
		} else {
			//? Button to re-roll metaEvaluate
			message += `<div class="hide-button hidden"><button class="metanthropes-main-chat-button metaeval-reroll" data-actoruuid="${actorUUID}"
				data-stat="${stat}" data-stat-score="${statScore}" data-multi-action="${multiAction}" data-perk-reduction="${perkReduction}"
				data-bonus="${bonus}" data-penalty="${penalty}" data-action="${action}" data-destiny-cost="${destinyCost}" data-message-id="${messageId}"
				data-item-name="${itemName}" data-pain="${pain}" data-aiming-reduction="${aimingReduction}" data-custom-reduction="${customReduction}"
				data-reroll="true" data-reroll-counter="${rerollCounter}" data-itemuuid="${itemUUID}"
				>Spend @METAFA(hand-fingers-crossed) Destiny to reroll</button></div>`;
		}
		//? Buttons for Keeping the results of MetaEvalute and trigger metaExecute
		if (action === "Metapower") {
			message += `<div class="hide-button hidden"><br><button class="metanthropes-main-chat-button metapower-activate" data-actoruuid="${actorUUID}"
			data-action="${action}" data-multi-action="${multiAction}" data-itemuuid="${itemUUID}"
			>Activate @METAICON(metanthropes) ${itemName}</button></div>`;
		} else if (action === "Possession") {
			message += `<div class="hide-button hidden"><br><button class="metanthropes-main-chat-button possession-use" data-actoruuid="${actorUUID}"
			data-action="${action}" data-multi-action="${multiAction}" data-itemuuid="${itemUUID}"
			>Use @METAFA(backpack) ${itemName}</button></div>`;
		} else {
			// Intentionally left blank for future expansion
			//message += `<div><br></div>`;
		}
		//? Adding remaining Destiny message
		message += `<div class="hide-button hidden"><br>${actor.name} has ${actor.currentDestiny} @METAFA(hand-fingers-crossed) Destiny remaining.</div>`;
	} else {
		//? Auto-Execute the Metapower or Possession
		if (!(action === "Initiative")) {
			//? Set autoExecute to true if it's either a Critical Success or a Critical Failure, or if the actor doesn't have enough Destiny to reroll
			autoExecute = true;
			mL(3, "metaEvaluate", "Auto-Execution Detected");
		}
	}

	//* Enrich the message
	const enrichedMessage = await foundry.applications.ux.TextEditor.enrichHTML(message, { async: true });

	//* Update actor flags with the results of the roll - used in cases like initiative
	//todo this should be refactored to an api call
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
			mL(2, "metaEvaluate", "Error: Action not recognized:", action);
			return;
	}
	//? Update the actor with the new .lastrolled values
	await actor.setFlag("metanthropes", "lastrolled", newRolls);

	//* Handling the diplay of the chat message
	let chatMessage;
	if (!reroll) {
		mL(3, "metaEvalute", "Not a re-roll");
		//* This is a new roll, creating chat message
		//? Printing the results to chat, allowing Dice So Nice to do it's thing.
		const rollMode = game.settings.get("core", "messageMode");
		const chatData = {
			speaker: ChatMessage.getSpeaker({
				actor: actor,
			}),
			flavor: enrichedMessage,
			flags: { metanthropes: { actoruuid: actor.uuid } },
		};
		await metanthropes.applications.MetaChatMessage.applyMode(chatData, rollMode);
		if (game.dice3d) {
			await game.dice3d.showForRoll(roll, game.user, true, null, false, messageId);
		}
		chatMessage = await metanthropes.applications.MetaChatMessage.create(chatData);
	} else {
		mL(3, "metaEvalute", "Re-roll");
		//* This is a re-roll, updating existing message
		//? Update the original message with the new results
		chatMessage = game.messages.get(messageId);
		if (!chatMessage) {
			ui.notifications.warn("Could not find the chat message to update.");
			return;
		}
		if (game.dice3d) {
			await game.dice3d.showForRoll(roll, game.user, true, null, false, messageId);
		}
		await chatMessage.update(
			{
				flavor: enrichedMessage,
				flags: { metanthropes: { actoruuid: actor.uuid } },
			},
			{ notify: true },
		);
		ui.chat.notify(chatMessage, { newMessage: true });
	}
	mL(
		3,
		"metaEvaluate",
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
		"Result Level:",
		resultLevel,
		"Current Destiny:",
		actor.currentDestiny,
		"Actor UUID:",
		actor.uuid,
		"Item UUID:",
		itemUUID,
	);

	//* Finished, checking for DSN before autoExecute
	if (game.dice3d) {
		//? Await 3D Dice animation - Read More: https://gitlab.com/riccisi/foundryvtt-dice-so-nice/-/wikis/API/Roll#detecting-the-end-of-a-3d-roll-animation-for-a-specific-message
		//? Could also do simply await?
		//todo see https://gitlab.com/riccisi/foundryvtt-dice-so-nice/-/wikis/API/Roll#disablingenabling-the-3d-animation-programmatically
		await game.dice3d.waitFor3DAnimationByMessageID(chatMessage.id);
		//? Autoexecute
		if (!autoExecute) {
			return;
		}
		//? Automatically execute the activation/use of the Metapower/Possession if it's a Critical Success/Failure or not enough destiny to reroll
		//! why no multiAction for Metapowers here = Critical success removed reductions || what about crit fails?
		if (action === "Metapower") {
			mL(3, "metaEvaluate", "Auto-Activating Metapower:", itemName);
			await metanthropes.metapowers.metaExecute({
				actorUUID: actorUUID,
				itemUUID: itemUUID,
				action: action,
			});
		} else if (action === "Possession") {
			mL(3, "metaEvaluate", "Auto-Using Possession:", itemName);
			await metanthropes.possessions.metaExecute({
				actorUUID: actorUUID,
				itemUUID: itemUUID,
				action: action,
				multiAction: multiAction,
			});
		}
	} else {
		if (!autoExecute) {
			return;
		}
		//? wait for 1 second to ensure the chat messages display in the proper order, ?probably not required?
		await new Promise((resolve) => setTimeout(resolve, 1000));
		//? Automatically execute the activation/use of the Metapower/Possession if it's a Critical Success/Failure or not enough destiny to reroll
		//! why no multiAction for Metapowers here? see above
		if (action === "Metapower") {
			mL(3, "metaEvaluate", "Auto-Activating Metapower:", itemName);
			await metanthropes.metapowers.metaExecute({
				actorUUID: actorUUID,
				itemUUID: itemUUID,
				action: action,
			});
		} else if (action === "Possession") {
			mL(3, "metaEvaluate", "Auto-Using Possession:", itemName);
			await metanthropes.possessions.metaExecute({
				actorUUID: actorUUID,
				itemUUID: itemUUID,
				action: action,
				multiAction: multiAction,
			});
		}
	}
}

/**
 * Handles the re-roll of a previously evaluated roll by spending Destiny.
 *
 * This function is called when the "Spend Destiny to reroll" button is clicked in the chat.
 * It reduces the actor's Destiny by 1 and then calls the metaEvaluate function to
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
export async function metaEvaluateReRoll(event) {
	const mL = metanthropes.utils.metaLog;
	event.preventDefault();
	//? Collect the data from the button
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
	const reroll = button.dataset.reroll === "false" ? false : true;
	const rerollCounter = parseInt(button.dataset.rerollCounter);
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
	const itemUUID = button.dataset.itemuuid === "null" ? null : button.dataset.itemuuid;
	const pain = parseInt(button.dataset.pain);
	mL(3, "metaEvaluateReRoll", "Engaged for:", actor.name + "'s", action, actorUUID, "from message ID:", messageId);
	await actor.applyDestinyChange(-1);
	mL(3, "metaEvaluateReRoll", "Destiny spent for re-roll, calling metaEvaluate");
	await metanthropes.dice.metaEvaluate({
		actorUUID,
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
		itemName,
		messageId,
		reroll,
		rerollCounter,
		itemUUID,
	});
	mL(3, "metaEvaluateReRoll", "Finished for:", actor.name + "'s", action, actorUUID);
}
