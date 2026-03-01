/**
 * metaHungerRoll handles the rolling a simple d100 to check if the actor can beat their Hunger effect.
 * This special D100 roll does not provide any bonus/penalty, nor does it grant Destiny on Criticals.
 * If the hunger check is successful, it will also call metaroll for the previously attempted action
 *
 * @export
 * @async
 * @param {*} actor 
 * @param {*} hungerLevel 
 * @param {boolean} [messageId=false] 
 * @param {boolean} [reroll=false] 
 * @param {number} [rerollCounter=0] 
 * @returns {*}
 */
export async function metaHungerRoll(actor, hungerLevel, messageId = false, reroll = false, rerollCounter = 0) {
	let hungerTarget = 0;
	let hungerMessage = null;
	let startMessage = null;
	let hungerCheckResult = false;
	if (hungerLevel === 1) {
		hungerTarget = 90;
	} else if (hungerLevel === 2) {
		hungerTarget = 75;
	} else if (hungerLevel === 3) {
		hungerTarget = 50;
	} else if (hungerLevel === 4) {
		hungerTarget = 25;
	} else if (hungerLevel === 5) {
		hungerTarget = 10;
	} else {
		metanthropes.utils.metaLog(5, "metaHungerRoll", "Hunger Level is not valid:", hungerLevel);
		return;
	}
	const metaRollBeforeHungerCheck = await actor.getFlag("metanthropes", "MetaRollBeforeHungerCheck") || false;
	const hungerRoll = await new Roll("1d100").evaluate();
	const hungerRollResult = hungerRoll.total;
	if (!reroll) {
		startMessage = "Rolls";
	} else {
		startMessage = "Re-Rolls";
		rerollCounter++;
		if (rerollCounter > 1) startMessage += ` (@METAFA(xmark, null, xs, fw)${rerollCounter})`;
	}
	hungerMessage = `${startMessage} to beat Hunger @METAFA(skull) Condition Level ${hungerLevel} and gets a result of ${hungerRollResult} (needed ${hungerTarget} or less).<br><br>`;
	if (hungerRollResult > hungerTarget) {
		//* We failed the Hunger check
		hungerMessage += `It is a @METAFA(square-xmark, failure) Failure!<br><br>${actor.name} is too hungry and can't act!`;
		//? Button to re-roll Hunger using destiny
		const currentDestiny = Number(actor.system.Vital.Destiny.value);
		hungerMessage += `<hr />${actor.name} has ${currentDestiny} @METAFA(hand-fingers-crossed) Destiny remaining.<br>`;
		if (currentDestiny > 0) {
			hungerMessage += `<div class="hide-button hidden"><br><button class="metanthropes-main-chat-button hunger-reroll" 
			data-actoruuid="${actor.uuid}" data-hunger-level="${hungerLevel}" data-reroll="true" data-reroll-counter="${rerollCounter}"
			>Spend @METAFA(hand-fingers-crossed) Destiny to reroll</button><br></div>`;
		}
	} else {
		//* We passed the Hunger Check
		await actor.setFlag("metanthropes", "hungerRollResult", true);
		if (!metaRollBeforeHungerCheck)
			return ui.notifications.error(`Could not find intended action after passing Hunger check`);
		let messageAction = null;
		switch (metaRollBeforeHungerCheck.action) {
			case "StatRoll":
				messageAction = `roll for ${metaRollBeforeHungerCheck.stat}`;
				break;
			case "Metapower":
				messageAction = `activate @METAICON(metanthropes) ${metaRollBeforeHungerCheck.itemName}`;
				break;
			case "Possession":
				messageAction = `use @METAFA(backpack) ${metaRollBeforeHungerCheck.itemName}`;
				break;
			default:
				metanthropes.utils.metaLog(
					2,
					"metaHungerRoll",
					"Error: Action not valid for Hunger Check:",
					metaRollBeforeHungerCheck.action
				);
				return;
		}
		hungerMessage += `It is a @METAFA(square, success) Success!<hr />${actor.name} has overcome Hunger!<br><br>Proceeding to ${messageAction}.<br><br>`;
		hungerCheckResult = true;
		await actor.unsetFlag("metanthropes", "MetaRollBeforeHungerCheck");
	}
	//* Enrich the message
	const enrichedMessage = await foundry.applications.ux.TextEditor.enrichHTML(hungerMessage, { async: true });
	if (messageId) {
		//? We have a previous hunger roll message, so update it
		const chatMessage = game.messages.get(messageId);
		if (!chatMessage) {
			ui.notifications.warn("Could not find the chat message to update.");
			return;
		}
		const updatedRoll = await hungerRoll.toJSON();
		const renderedRoll = await hungerRoll.render();
		if (game.dice3d) {
			await game.dice3d.showForRoll(hungerRoll, game.user, true, null, false, messageId);
		}
		await chatMessage.update({
			flavor: enrichedMessage,
			rolls: updatedRoll,
			content: renderedRoll, //? controls clickable roll result in chat
			rollMode: game.settings.get("core", "rollMode"),
			flags: { metanthropes: { actoruuid: actor.uuid } },
		});
	} else {
		//? We don't have a previous hunger roll result, so create a chat message
		await hungerRoll.toMessage({
			speaker: ChatMessage.getSpeaker({ actor: actor }),
			flavor: enrichedMessage,
			rollMode: game.settings.get("core", "rollMode"),
			flags: { metanthropes: { actoruuid: actor.uuid } },
		});
	}
	if (hungerCheckResult) {
		metanthropes.utils.metaLog(
			3,
			"metaHungerRoll",
			"Hunger check passed, engaging metaRoll for:",
			actor.name,
			metaRollBeforeHungerCheck.action,
			metaRollBeforeHungerCheck.stat,
			metaRollBeforeHungerCheck.isCustomRoll,
			metaRollBeforeHungerCheck.destinyCost,
			metaRollBeforeHungerCheck.itemName
		);
		metanthropes.dice.metaRoll(
			actor,
			metaRollBeforeHungerCheck.action,
			metaRollBeforeHungerCheck.stat,
			metaRollBeforeHungerCheck.isCustomRoll,
			metaRollBeforeHungerCheck.destinyCost,
			metaRollBeforeHungerCheck.itemName
		);
	}
}

/**
 * Hunger ReRoll
 *
 * @export
 * @async
 * @param {*} event 
 * @returns {*} 
 */
export async function metaHungerReRoll(event) {
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
	const reroll = button.dataset.reroll === "true" ? true : false;
	const rerollCounter = parseInt(button.dataset.rerollCounter);
	const actoruuid = button.dataset.actoruuid;
	const hungerLevel = parseInt(button.dataset.hungerLevel);
	const actor = await fromUuid(actoruuid);
	let currentDestiny = Number(actor.system.Vital.Destiny.value);
	if (currentDestiny > 0) {
		await actor.applyDestinyChange(-1);
		metaHungerRoll(actor, hungerLevel, messageId, reroll, rerollCounter);
	} else {
		ui.notifications.warn(actor.name + " does not have enough Destiny to spend for reroll!");
		metanthropes.utils.metaLog(3, "metaHungerReRoll", "Not enough Destiny to spend");
	}
}
