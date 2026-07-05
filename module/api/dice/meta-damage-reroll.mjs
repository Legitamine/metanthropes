/**
 * metaDamageReRoll handles the re-rolling of damage and application of the new damage to targets.
 * Is triggered via an event and will grab the params it needs from the event.target.dataset.
 * Will create a new chat message if this is the first time a reroll is happening, or update the previous one.
 * Will call actor.undoLastLifeChange for each targeted Actor and wait (for Socket reply or after 10sec timeout) before applying.
 * Calls metanthropes.logic.metaApplyDamage(...) to apply the updated Damage result to targeted Actors.
 * todo could be extended to also return the results to anchor if required in the future.
 *
 * @export
 * @async
 * @param {*} event
 * @returns {*}
 */
export async function metaDamageReRoll(event) {
	const mL = metanthropes.utils.metaLog;
	mL(3, "metaDamageReRoll", "Rerolling Damage Result");
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
	const actorUUID = button.dataset.actoruuid;
	const destinyReRoll = button.dataset.destinyReRoll === "true" ? true : false;
	const itemUUID = button.dataset.itemuuid === "null" ? null : button.dataset.itemuuid;
	let item = null;
	if (itemUUID) item = await fromUuid(itemUUID);
	const itemName = item?.name ?? null;
	// const itemName = button.dataset.itemName === "null" ? null : button.dataset.itemName; //todo check the dataset created
	let reroll = button.dataset.reroll === "false" ? false : true;
	let rerollCounter = parseInt(button.dataset.rerollCounter) || 0;
	const actor = await fromUuid(actorUUID);
	const targetedActors = button.dataset.targets ? button.dataset.targets.split(",") : ([] ?? null);
	const damageDiceCosmic = parseInt(button.dataset.diceCosmic) || 0;
	const damageDiceElemental = parseInt(button.dataset.diceElemental) || 0;
	const damageDiceMaterial = parseInt(button.dataset.diceMaterial) || 0;
	const damageDicePsychic = parseInt(button.dataset.dicePsychic) || 0;
	const damageBaseCosmic = parseInt(button.dataset.baseCosmic) || 0;
	const damageBaseElemental = parseInt(button.dataset.baseElemental) || 0;
	const damageBaseMaterial = parseInt(button.dataset.baseMaterial) || 0;
	const damageBasePsychic = parseInt(button.dataset.basePsychic) || 0;
	const damageSelectedTargets = button.dataset.damageSelectedTargets === "true" ? true : false;
	const firstMessage = button.dataset?.firstMessage === "true" ? true : false;
	let contentMessage = ``;
	let startMessage = ``;
	let flavorMessage = ``;
	let cosmicDamageRollResult = null;
	let damageCosmicMessage = null;
	let elementalDamageRollResult = null;
	let damageElementalMessage = null;
	let materialDamageRollResult = null;
	let damageMaterialMessage = null;
	let psychicDamageRollResult = null;
	let damagePsychicMessage = null;
	let rolledDice = [];
	let dsnRolls = [];
	//* Return conditions
	//? Need to check if actor has enough Destiny to spend, because they might have already spent it on another secondary button
	if (!(actor.currentDestiny > 0 && destinyReRoll)) {
		ui.notifications.warn(actor.name + " does not have enough Destiny to spend for reroll!");
		mL(1, "metaDamageReRoll", "Not enough Destiny to spend", "OR", "destinyReRoll is not allowed");
		button.classList.remove("disabled");
		return;
	}
	//? Need to ensure we have valid targets before reducing destiny
	if (!targetedActors.length && damageSelectedTargets) {
		ui.notifications.warn("You must select valid targets first");
		button.classList.remove("disabled");
		return;
	}
	//* Destiny change
	await actor.applyDestinyChange(-1);
	//* Cosmic
	if (damageDiceCosmic > 0 || damageBaseCosmic > 0) {
		const cosmicDamageRoll = await metanthropes.dice.metaRolld10({
			actorUUID: actorUUID,
			what: `Cosmic Damage`,
			destinyReRoll: true,
			dice: damageDiceCosmic,
			itemUUID: itemUUID,
			baseNumber: damageBaseCosmic,
			isHalf: false,
			anchor: true,
			reroll: firstMessage ? false : true,
			rerollCounter: 0,
			messageId: firstMessage ? null : messageId,
		});
		mL(3, "metaDamageReRoll", "Cosmic Damage Dataset", cosmicDamageRoll.dataset);
		cosmicDamageRollResult = Number(cosmicDamageRoll.dataset.total);
		damageCosmicMessage = `${cosmicDamageRoll.outerHTML}`;
		const cosmicRollData = JSON.parse(cosmicDamageRoll.dataset.rolls);
		rolledDice.push(cosmicRollData);
		const cosmicDSNRoll = Roll.fromData(cosmicRollData); //? rebuild a real Roll object for DSN from the RollData
		dsnRolls.push(cosmicDSNRoll);
	}
	//* Elemental
	if (damageDiceElemental > 0 || damageBaseElemental > 0) {
		const elementalDamageRoll = await metanthropes.dice.metaRolld10({
			actorUUID: actorUUID,
			what: `Elemental Damage`,
			destinyReRoll: true,
			dice: damageDiceElemental,
			itemUUID: itemUUID,
			baseNumber: damageBaseElemental,
			isHalf: false,
			anchor: true,
			reroll: firstMessage ? false : true, //? The first time we expect to create a new message as we don't want to overwrite the original meta-Execute chat message.
			rerollCounter: 0,
			messageId: firstMessage ? null : messageId, //? we don't pass the messageId as that would replace the original message
		});
		mL(3, "metaDamageReRoll", "Elemental Damage Dataset", elementalDamageRoll.dataset);
		elementalDamageRollResult = Number(elementalDamageRoll.dataset.total);
		damageElementalMessage = `${elementalDamageRoll.outerHTML}`;
		const elementalRollData = JSON.parse(elementalDamageRoll.dataset.rolls);
		rolledDice.push(elementalRollData);
		const elementalDSNRoll = Roll.fromData(elementalRollData);
		dsnRolls.push(elementalDSNRoll);
	}
	//* Material
	if (damageDiceMaterial > 0 || damageBaseMaterial > 0) {
		const materialDamageRoll = await metanthropes.dice.metaRolld10({
			actorUUID: actorUUID,
			what: `Material Damage`,
			destinyReRoll: true,
			dice: damageDiceMaterial,
			itemUUID: itemUUID,
			baseNumber: damageBaseMaterial,
			isHalf: false,
			anchor: true,
			reroll: firstMessage ? false : true,
			rerollCounter: 0,
			messageId: firstMessage ? null : messageId,
		});
		mL(3, "metaDamageReRoll", "Material Damage Dataset", materialDamageRoll.dataset);
		materialDamageRollResult = Number(materialDamageRoll.dataset.total);
		damageMaterialMessage = `${materialDamageRoll.outerHTML}`;
		const materialRollData = JSON.parse(materialDamageRoll.dataset.rolls);
		rolledDice.push(materialRollData);
		const materialDSNRoll = Roll.fromData(materialRollData);
		dsnRolls.push(materialDSNRoll);
	}
	//* Psychic
	if (damageDicePsychic > 0 || damageBasePsychic > 0) {
		const psychicDamageRoll = await metanthropes.dice.metaRolld10({
			actorUUID: actorUUID,
			what: `Psychic Damage`,
			destinyReRoll: true,
			dice: damageDicePsychic,
			itemUUID: itemUUID,
			baseNumber: damageBasePsychic,
			isHalf: false,
			anchor: true,
			reroll: firstMessage ? false : true,
			rerollCounter: 0,
			messageId: firstMessage ? null : messageId,
		});
		mL(3, "metaDamageReRoll", "Psychic Damage Dataset", psychicDamageRoll.dataset);
		psychicDamageRollResult = Number(psychicDamageRoll.dataset.total);
		damagePsychicMessage = `${psychicDamageRoll.outerHTML}`;
		const psychicRollData = JSON.parse(psychicDamageRoll.dataset.rolls);
		rolledDice.push(psychicRollData);
		const psychicDSNRoll = Roll.fromData(psychicRollData);
		dsnRolls.push(psychicDSNRoll);
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
		data-what="Damage" data-anchor="true" data-reroll="true" data-reroll-counter="${rerollCounter}" data-message-id="${messageId}"
		data-destiny-re-roll="true" data-dice-cosmic="${damageDiceCosmic}" data-base-cosmic="${damageBaseCosmic}"
		data-dice-elemental="${damageDiceElemental}" data-base-elemental="${damageBaseElemental}"
		data-dice-material="${damageDiceMaterial}" data-base-material="${damageBaseMaterial}"
		data-dice-psychic="${damageDicePsychic}" data-base-psychic="${damageBasePsychic}"
		data-damage-selected-targets="${damageSelectedTargets}" data-itemuuid="${itemUUID}"
		>Spend @METAFA(hand-fingers-crossed) to Reroll @METAFA(burst) Damage
		</button></div>`;
		contentMessage += `<br>`;
		contentMessage += damageReRollButton;
		contentMessage += `<br>`;
	}
	contentMessage += `<div class="hide-button hidden">${actor.name} has ${actor.currentDestiny} @METAFA(hand-fingers-crossed) Destiny remaining.<br></div>`;
	const enrichedContent = await foundry.applications.ux.TextEditor.enrichHTML(contentMessage, { async: true });
	const enrichedFlavor = await foundry.applications.ux.TextEditor.enrichHTML(flavorMessage, { async: true });
	let chatData = {
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		flavor: enrichedFlavor,
		content: enrichedContent,
		//! redundant rollMode: game.settings.get("core", "rollMode"),
		flags: { metanthropes: { actoruuid: actor.uuid } },
	};
	//* Send/Update Chat message and trigger DSN
	if (reroll) {
		mL(3, "metaDamageReRoll", "Reroll");
		const chatMessage = game.messages.get(messageId);
		if (!chatMessage) {
			mL(2, "metaDamageReRoll", "Could not find messageId", messageId);
			return;
		}
		//? Handle DSN animation
		if (game.dice3d) {
			for (const roll of dsnRolls) await game.dice3d.showForRoll(roll, game.user, true, null, false, messageId);
		}
		await chatMessage.update(chatData);
	} else {
		mL(3, "metaDamageReRoll", "No Reroll");
		const rollMode = game.settings.get("core", "rollMode");
		await metanthropes.applications.MetaChatMessage.applyMode(chatData, rollMode);
		await metanthropes.applications.MetaChatMessage.create(chatData);
	}
	//* Work through targets to restore previous Life before applying new Damage
	if (damageSelectedTargets) {
		const resolvedActors = targetedActors.map((uuid) => fromUuidSync(uuid)).filter(Boolean);
		await Promise.all(resolvedActors.map((actor) => actor.undoLastLifeChange()));
		await metanthropes.logic.metaApplyDamage(
			targetedActors,
			cosmicDamageRollResult,
			elementalDamageRollResult,
			materialDamageRollResult,
			psychicDamageRollResult,
		);
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
