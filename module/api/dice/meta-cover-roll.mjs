/**
 * metaCoverRoll handles the rolling a simple d100 to check if the actor can find Cover.
 * 
 * todo: update for text enrichers and review d100 roll
 * 
 * @param {*} actor 
 * @param {*} coverType 
 * @param {*} coverValue 
 * @returns 
 */
export async function metaCoverRoll(actor, coverType, coverValue) {
	let coverMessage = null;
	let coverTarget = null;
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
	coverMessage = `Rolls to find ${coverType} Cover, with ${coverValue}% and gets a result of ${coverRollResult} (needed ${coverTarget} or less).<br><br>`;
	if (coverRollResult > coverTarget) {
		coverMessage += `It is a <i class="fa-solid fa-square-xmark"></i> Failure!<br><br>${actor.name} can't find Cover!`;
		//? Button to re-roll Cover using destiny
		const currentDestiny = Number(actor.system.Vital.Destiny.value);
		coverMessage += `<hr />${actor.name} has ${currentDestiny} <i class="fa-solid fa-hand-fingers-crossed"></i> Destiny remaining.<br>`;
		if (currentDestiny > 0) {
			coverMessage += `<div class="hide-button hidden"><br><button class="metanthropes-main-chat-button cover-reroll" 
			data-actoruuid="${actor.uuid}" data-cover-value="${coverValue}" data-type="${coverType}"
			>Spend <i class="fa-solid fa-hand-fingers-crossed"></i> Destiny to reroll</button><br></div><br>`;
		}
	} else {
		coverMessage += `It is a <i class="fa-solid fa-square"></i> Success!<hr />${actor.name} found ${coverType} Cover!<br><br>`;
	}
	coverRoll.toMessage({
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		flavor: coverMessage,
		rollMode: game.settings.get("core", "rollMode"),
		flags: { "metanthropes": { actoruuid: actor.uuid } },
	});
}

/**
 * Cover ReRoll
 * 
 * @param {*} event 
 */
export async function metaCoverReRoll(event) {
	event.preventDefault();
	const button = event.target;
	const actoruuid = button.dataset.actoruuid;
	const actor = await fromUuid(actoruuid);
	const coverType = button.dataset.type;
	const coverValue = parseInt(button.dataset.coverValue);
	let currentDestiny = Number(actor.system.Vital.Destiny.value);
	if (currentDestiny > 0) {
		currentDestiny--;
		await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
		metaCoverRoll(actor, coverType, coverValue);
	} else {
		ui.notifications.warn(actor.name + " does not have enough Destiny to spend for reroll!");
		metanthropes.utils.metaLog(3, "metaCoverReRoll", "Not enough Destiny to spend");
	}
}