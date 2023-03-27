// MetaRollStat function is used to roll a stat and get the levels of success/failure and print the message to chat
export async function MetaRollStat(actor, stat, statValue, modifier = 0, bonus = 0, penalty = 0) {
	const roll = await new Roll("1d100").evaluate({ async: true });
	const total = roll.total;
	// const isSuccess = total <= statValue + modifier;
	let result = null; // isSuccess ? "Success 🟩" : "Failure 🟥";
	let levelsOfSuccess = Math.floor((statValue + bonus + penalty + modifier - total) / 10);
	let levelsOfFailure = Math.floor((total - statValue - bonus - modifier - penalty) / 10);
	const criticalSuccess = total === 1;
	const criticalFailure = total === 100;
	const currentDestiny = actor.system.Vital.Destiny.value;
	// this kicks-off the calculation, assuming that is is a failure
	if (total - modifier - penalty > statValue + bonus) {
		// in which case we don't care about what levels of success we have, so we set to 0 to avoid confusion later
		result = "Failure 🟥";
		levelsOfSuccess = 0;
	} else {
		// if the calculation is <= to statValue, it's a success, so we reset the levels of failure to 0
		result = "Success 🟩";
		levelsOfFailure = 0;
	}
	//check for critical success or failure
	//todo: review how bonuses and penalties should affect criticals
	if (criticalSuccess) {
		result = `🟩 Critical Success 🟩, rewarding ${actor.name} with 1 * 🤞`; //todo: add color and bold to crititals
		await actor.update({ "system.Vital.Destiny.value": currentDestiny + 1 });
		levelsOfSuccess = 10;
		if (statValue < 100) {
			levelsOfSuccess += 0;
		} else {
			levelsOfSuccess += Math.floor((statValue - 100) / 10);
		}
	}
	if (criticalFailure) {
		result = `🟥 Critical Failure 🟥, rewarding ${actor.name} with 1 * 🤞`; //todo: add color and bold to crititals
		await actor.update({ "system.Vital.Destiny.value": currentDestiny + 1 });
		levelsOfFailure = 10;
	}
	//console log for debugging
	console.log(
		"Metaroll Results: Stat:",
		statValue,
		"Roll:",
		total,
		"Multi-Action mod:",
		modifier,
		"Bonus:",
		bonus,
		"Penalty:",
		penalty,
		"levelsOfSuccess:",
		levelsOfSuccess,
		"levelsOfFailure:",
		levelsOfFailure,
		"Result:",
		result,
		"Destiny:",
		currentDestiny
	);
	//format the message to be printed to chat
	let message = `${actor.name} attempts a roll with ${stat} score of ${statValue}%`;
	// if we have a bonus or penalty, add it to the message
	if (bonus > 0) {
		message += `, a Bonus of +${bonus}%`;
	}
	if (penalty < 0) {
		message += `, a Penalty of ${penalty}%`;
	}
	// if we have multi-action reduction, add it to the message
	if (modifier < 0) {
		message += ` and with a Multi-Action reduction of ${modifier}%`;
	}
	message += ` and the result is ${total}, therefore it is a ${result}`;
	// if we have levels of success or failure, add them to the message
	if (levelsOfSuccess > 0) {
		message += `, accumulating: ${levelsOfSuccess} * ✔️. ${actor.name} has ${currentDestiny} * 🤞 remaining.`;
	} else if (levelsOfFailure > 0) {
		message += `, accumulating: ${levelsOfFailure} * ❌. ${actor.name} has ${currentDestiny} * 🤞 remaining.`;
	} else {
		message += `. ${actor.name} has ${currentDestiny} * 🤞 remaining.`;
	}
	//add re-roll button to message
	message += `<div><button class="metanthropes meta-re-roll layout-hide" data-actor-id="${actor.id}" data-stat="${stat}" data-stat-value="${statValue}" data-modifier="${modifier}" data-bonus="${bonus}" data-penalty="${penalty}">🤞</button></div>`;
	//print message to chat and enable Dice So Nice to roll the dice and display the message
	roll.toMessage({
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		flavor: message,
		rollMode: game.settings.get("core", "rollMode"),
		content: item.system.effects-metapower.value ?? "error no statrolled found",
		flags: { "metanthropes-system": { actorId: actor.id } },
	});
}
// Function to handle re-roll button click
async function MetaReRoll(event) {
	event.preventDefault();

	const button = event.target;
	const actorId = button.dataset.actorId;
	const stat = button.dataset.stat;
	const statValue = parseInt(button.dataset.statValue);
	const modifier = parseInt(button.dataset.modifier);
	const bonus = parseInt(button.dataset.bonus);
	const penalty = parseInt(button.dataset.penalty);

	const actor = game.actors.get(actorId);

	if (actor && actor.isOwner) {
		// Reduce Destiny.value by 1
		const currentDestiny = actor.system.Vital.Destiny.value;
		if (currentDestiny > 0) {
			await actor.update({ "system.Vital.Destiny.value": currentDestiny - 1 });
			// Update re-roll button visibility
			const message = game.messages.get(button.dataset.messageId);
			if (message) {
				message.render();
			}

			MetaRollStat(actor, stat, statValue, modifier, bonus, penalty);
		}
	}
}
// Add event listener for re-roll button click
Hooks.on("renderChatMessage", async (message, html) => {
	if (message.isAuthor) {
		const actorId = message.getFlag("metanthropes-system", "actorId");
		const actor = game.actors.get(actorId);
		if (actor && actor.system.Vital.Destiny.value > 0) {
			html.find(".meta-re-roll").removeClass("layout-hide");
		} else {
			html.find(".meta-re-roll").addClass("layout-hide");
		}
		html.find(".meta-re-roll").on("click", MetaReRoll);
	}
});
