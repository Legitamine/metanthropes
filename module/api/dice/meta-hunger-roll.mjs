/**
 * metaHungerRoll handles the rolling a simple d100 to check if the actor can beat their Hunger effect.
 */
export async function metaHungerRoll(actor, hungerLevel) {
	let hungerTarget = 0;
	let hungerEffect = 0; //! not needed???
	let hungerMessage = null;
	if (hungerLevel === 1) {
		hungerEffect = 10;
		hungerTarget = 90;
	} else if (hungerLevel === 2) {
		hungerEffect = 25;
		hungerTarget = 75;
	} else if (hungerLevel === 3) {
		hungerEffect = 50;
		hungerTarget = 50;
	} else if (hungerLevel === 4) {
		hungerEffect = 75;
		hungerTarget = 25;
	} else if (hungerLevel === 5) {
		hungerEffect = 90;
		hungerTarget = 10;
	} else {
		metanthropes.utils.metaLog(5, "metaHungerRoll", "Hunger Level is not valid:", hungerLevel);
		return;
	}
	const hungerRoll = await new Roll("1d100").evaluate();
	const hungerRollResult = hungerRoll.total;
	hungerMessage = `Rolls to beat Hunger <i class="fa-solid fa-skull"></i> Condition Level ${hungerLevel} and gets a result of ${hungerRollResult} (needed ${hungerTarget} or less).<br><br>`;
	if (hungerRollResult > hungerTarget) {
		hungerMessage += `It is a <i class="fa-solid fa-square-xmark"></i> Failure!<br><br>${actor.name} is too hungry and can't act!`;
		//? Button to re-roll Hunger using destiny
		const currentDestiny = Number(actor.system.Vital.Destiny.value);
		hungerMessage += `<hr />${actor.name} has ${currentDestiny} <i class="fa-solid fa-hand-fingers-crossed"></i> Destiny remaining.<br>`;
		if (currentDestiny > 0) {
			hungerMessage += `<div class="hide-button hidden"><br><button class="metanthropes-main-chat-button hunger-reroll" 
			data-actoruuid="${actor.uuid}" data-hunger-level="${hungerLevel}"
			>Spend <i class="fa-solid fa-hand-fingers-crossed"></i> Destiny to reroll</button><br></div><br>`;
		}
	} else {
		hungerMessage += `It is a <i class="fa-solid fa-square"></i> Success!<hr />${actor.name} has overcome Hunger!<br><br>`;
		await actor.setFlag("metanthropes", "hungerRollResult", true);
		const MetaRollBeforeHungerCheck = await actor.getFlag("metanthropes", "MetaRollBeforeHungerCheck");
		metanthropes.utils.metaLog(
			3,
			"metaHungerRoll",
			"Engaging metaRoll with:",
			actor,
			MetaRollBeforeHungerCheck.action,
			MetaRollBeforeHungerCheck.stat,
			MetaRollBeforeHungerCheck.isCustomRoll,
			MetaRollBeforeHungerCheck.destinyCost,
			MetaRollBeforeHungerCheck.itemName
		);
		metanthropes.dice.metaRoll(
			actor,
			MetaRollBeforeHungerCheck.action,
			MetaRollBeforeHungerCheck.stat,
			MetaRollBeforeHungerCheck.isCustomRoll,
			MetaRollBeforeHungerCheck.destinyCost,
			MetaRollBeforeHungerCheck.itemName
		);
		await actor.unsetFlag("metanthropes", "MetaRollBeforeHungerCheck");
	}
	hungerRoll.toMessage({
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		flavor: hungerMessage,
		rollMode: game.settings.get("core", "rollMode"),
		flags: { metanthropes: { actoruuid: actor.uuid } },
	});
}

/**
 * Hunger ReRoll
 */
export async function metaHungerReRoll(event) {
	event.preventDefault();
	const button = event.target;
	const actoruuid = button.dataset.actoruuid;
	const hungerLevel = parseInt(button.dataset.hungerLevel);
	const actor = await fromUuid(actoruuid);
	let currentDestiny = Number(actor.system.Vital.Destiny.value);
	if (currentDestiny > 0) {
		currentDestiny--;
		await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
		metaHungerRoll(actor, hungerLevel);
	} else {
		ui.notifications.warn(actor.name + " does not have enough Destiny to spend for reroll!");
		metanthropes.utils.metaLog(3, "metaHungerReRoll", "Not enough Destiny to spend");
	}
}
