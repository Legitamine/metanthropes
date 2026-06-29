/**
 * metaHealingReRoll handles the re-rolling of healing and applying the new value to targets.
 * Is triggered via an event and will grab the params it needs from the event.target.dataset.
 * Will create a new chat message if this is the first time a reroll is happening, or update the previous one.
 * Will call actor.undoLastLifeChange for each targeted Actor and wait (for Socket reply or after 10sec timeout) before applying.
 * Calls metanthropes.logic.metaApplyHealing(targetedActors, healingRollResult) to apply the updated Life result to targeted Actors.
 * todo could be extended to also return the results to anchor if required in the future.
 *
 * @export
 * @async
 * @param {*} event
 * @returns {*}
 */
export async function metaHealingReRoll(event) {
	const mL = metanthropes.utils.metaLog;
	mL(3, "metaHealingReRoll", "Rerolling Healing Result");
	//* Gather params
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
	const destinyReRoll = button.dataset.destinyReRoll === "true" ? true : false;
	const itemName = button.dataset.itemName === "null" ? null : button.dataset.itemName;
	let reroll = button.dataset.reroll === "false" ? false : true;
	let rerollCounter = parseInt(button.dataset.rerollCounter) ?? 0;
	const actor = await fromUuid(actoruuid);
	const targetedActors = button.dataset.targets ? button.dataset.targets.split(",") : ([] ?? null);
	const healingDice = parseInt(button.dataset.healingDice) ?? 0;
	const healingBase = parseInt(button.dataset.healingBase) ?? 0;
	const healSelectedTargets = button.dataset.healSelectedTargets === "true" ? true : false;
	const firstMessage = button.dataset?.firstMessage === "true" ? true : false;
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
	if (!targetedActors.length && healSelectedTargets) {
		ui.notifications.warn("You must select valid targets first");
		button.classList.remove("disabled");
		return;
	}
	//* Destiny Change
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
		firstMessage ? false : true,
		0,
		null,
	);
	const healingRollResult = Number(healingRoll.dataset.total);
	const healingMessage = `${healingRoll.outerHTML}<br>`;
	const healingRollData = JSON.parse(healingRoll.dataset.rolls);
	const healingDSNRoll = Roll.fromData(healingRollData);
	//* Build the Chat Message
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
		data-what="Healing" data-anchor="true" data-reroll="true" data-reroll-counter="${rerollCounter}" data-message-id="${messageId}"
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
	let chatData = {
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		flavor: enrichedFlavor,
		content: enrichedContent,
		rollMode: game.settings.get("core", "rollMode"),
		flags: { metanthropes: { actoruuid: actor.uuid } },
	};
	//* Send/Update chat message and handle DSN
	if (reroll) {
		mL(3, "metaHealingReRoll", "Reroll");
		const chatMessage = game.messages.get(messageId);
		if (!chatMessage) {
			mL(2, "metaHealingReRoll", "Could not find messageId", messageId);
			return;
		}
		if (game.dice3d) {
			await game.dice3d.showForRoll(healingDSNRoll, game.user, true, null, false, messageId);
		}
		await chatMessage.update(chatData);
	} else {
		mL(3, "metaHealingReRoll", "No Reroll");
		await metanthropes.applications.MetaChatMessage.create(chatData);
	}
	//* Work through targets to restore previous Life before applying new Healing
	if (healSelectedTargets) {
		const resolvedActors = targetedActors.map((uuid) => fromUuidSync(uuid)).filter(Boolean);
		await Promise.all(resolvedActors.map((actor) => actor.undoLastLifeChange()));
		await metanthropes.logic.metaApplyHealing(targetedActors, healingRollResult);
	}
	mL(3, "metaHealingReRoll", "Applied Healing ReRoll", healingRollResult, "# of targets:", targetedActors.length);
}
