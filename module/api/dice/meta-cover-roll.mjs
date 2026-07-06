/**
 * metaCoverRoll handles the rolling a simple d100 to check if the actor can find Cover.
 * This special D100 roll does not provide any bonus/penalty, nor does it grant Destiny on Criticals.
 *
 * @export
 * @async
 * @param {object} options
 * @property {string} actorUUID
 * @property {string} coverType
 * @property {number} coverValue
 * @property {boolean} [messageId=false]
 * @property {boolean} [reroll=false]
 * @property {number} [rerollCounter=0]
 * @returns {*}
 */
export async function metaCoverRoll({
	actorUUID,
	coverType,
	coverValue,
	messageId = false,
	reroll = false,
	rerollCounter = 0,
}) {
	const actor = await fromUuid(actorUUID);
	if (!actor) return metanthropes.utils.metaLog(2, "metaCoverRoll", "Could not get Actor from UUID", actorUUID);
	let coverMessage = null;
	let coverTarget = null;
	let startMessage = null;
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
		metanthropes.utils.metaLog(5, "metaCoverRoll", "Cover Value is not valid:", coverValue);
		return;
	}
	const coverRoll = await new Roll("1d100").evaluate();
	const coverRollResult = coverRoll.total;
	if (!reroll) {
		startMessage = "Rolls";
	} else {
		startMessage = "Re-Rolls";
		rerollCounter++;
		if (rerollCounter > 1) startMessage += ` (@METAFA(xmark, null, xs)${rerollCounter})`;
	}
	coverMessage = `${startMessage} to find ${coverType} Cover, with ${coverValue}% and gets a result of <b>${coverRollResult}</b> (needed ${coverTarget} or less).<br><br>`;
	if (coverRollResult > coverTarget) {
		coverMessage += `It is a @METAFA(square-xmark, failure) <b>Failure</b>!<hr/>${actor.name} can't find Cover!`;
		//? Button to re-roll Cover using destiny
		const currentDestiny = Number(actor.system.Vital.Destiny.value);
		if (currentDestiny > 0) {
			coverMessage += `<div class="hide-button hidden"><br><button class="metanthropes-main-chat-button cover-reroll" 
			data-actoruuid="${actor.uuid}" data-cover-value="${coverValue}" data-type="${coverType}"
			data-reroll="true" data-reroll-counter="${rerollCounter}"
			>Spend @METAFA(hand-fingers-crossed) Destiny to reroll</button><br></div>`;
		}
		coverMessage += `<div class="hide-button hidden">${actor.name} has ${currentDestiny} @METAFA(hand-fingers-crossed) Destiny remaining.</div>`;
	} else {
		coverMessage += `It is a @METAFA(square, success) <b>Success</b>!<hr />${actor.name} found ${coverType} Cover!`;
	}
	//* Enrich the message
	const enrichedMessage = await foundry.applications.ux.TextEditor.enrichHTML(coverMessage, { async: true });
	if (messageId) {
		//? We have a previous cover roll message, so update it
		const chatMessage = game.messages.get(messageId);
		if (!chatMessage) {
			ui.notifications.warn("Could not find the chat message to update.");
			return;
		}
		if (game.dice3d) {
			await game.dice3d.showForRoll(coverRoll, game.user, true, null, false, messageId);
		}
		chatMessage.update({
			flavor: enrichedMessage,
			flags: { metanthropes: { actoruuid: actor.uuid } },
		});
	} else {
		//? We don't have a previous cover roll result, so create a chat message
		const chatData = {
			speaker: ChatMessage.getSpeaker({ actor: actor }),
			flavor: enrichedMessage,
			flags: { metanthropes: { actoruuid: actor.uuid } },
		};
		const rollMode = game.settings.get("core", "rollMode");
		await metanthropes.applications.MetaChatMessage.applyMode(chatData, rollMode);
		if (game.dice3d) {
			await game.dice3d.showForRoll(coverRoll, game.user, true, null, false, messageId);
		}
		chatMessage = await metanthropes.applications.MetaChatMessage.create(chatData);
	}
}

/**
 * Cover ReRoll
 *
 * @export
 * @async
 * @param {*} event
 * @returns {*}
 */
export async function metaCoverReRoll(event) {
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
	const actorUUID = button.dataset.actoruuid;
	const actor = await fromUuid(actorUUID);
	const coverType = button.dataset.type;
	const coverValue = parseInt(button.dataset.coverValue);
	let currentDestiny = Number(actor.system.Vital.Destiny.value);
	if (currentDestiny > 0) {
		await actor.applyDestinyChange(-1);
		metaCoverRoll({ actorUUID, coverType, coverValue, messageId, reroll, rerollCounter });
	} else {
		ui.notifications.warn(actor.name + " does not have enough Destiny to spend for reroll!");
		metanthropes.utils.metaLog(3, "metaCoverReRoll", "Not enough Destiny to spend");
	}
}
